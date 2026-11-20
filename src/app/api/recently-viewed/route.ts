import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import RecentlyViewed from "@/models/RecentlyViewed";
import Product from "@/models/Product";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";
import { SAMPLE_PRODUCTS } from "@/lib/data/products";
import { Product as ProductType } from "@/types/product";

/* ------------------------------------------------------------------ */
/*  GET: Fetch authenticated user's recently viewed products           */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: true,
          history: [],
          isGuest: true,
        },
        { status: 200 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: true,
          history: [],
          isGuest: true,
        },
        { status: 200 }
      );
    }

    await connectDB();

    const viewedDocs = await RecentlyViewed.find({ user: payload.id })
      .sort({ viewedAt: -1 })
      .limit(30)
      .populate("product")
      .lean();

    const formattedHistory: ProductType[] = [];
    const orphanedDocIds: mongoose.Types.ObjectId[] = [];

    for (const item of viewedDocs) {
      // 1. Valid DB Product
      if (item.product && typeof item.product === "object" && "_id" in item.product) {
        const p = item.product as unknown as {
          _id: mongoose.Types.ObjectId;
          title: string;
          description: string;
          price: number;
          originalPrice?: number;
          condition: string;
          category: string;
          location: string;
          imageUrl: string;
          images?: string[];
          isVerifiedSeller?: boolean;
          isAvailable?: boolean;
          createdAt: Date;
          sellerName?: string;
          sellerCampus?: string;
        };

        // Handle unavailable products gracefully: skip if marked unavailable
        if (p.isAvailable === false) {
          continue;
        }

        formattedHistory.push({
          id: p._id.toString(),
          name: p.title,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          condition: p.condition as ProductType["condition"],
          category: p.category,
          location: p.location,
          imageUrl: p.imageUrl || p.images?.[0] || "",
          isVerifiedSeller: p.isVerifiedSeller,
          postedAt: new Date(p.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          sellerName: p.sellerName,
          sellerCampus: p.sellerCampus,
        });
      }
      // 2. Sample mock product match
      else {
        const sampleMatch = SAMPLE_PRODUCTS.find((sp) => sp.id === item.productId);
        if (sampleMatch) {
          formattedHistory.push({ ...sampleMatch });
        } else if (item.mockProduct && typeof item.mockProduct === "object") {
          const mp = item.mockProduct as unknown as ProductType;
          formattedHistory.push({ ...mp });
        } else if (mongoose.isValidObjectId(item.productId)) {
          // DB product was deleted in the meantime -> mark orphaned entry for cleanup
          orphanedDocIds.push(item._id as mongoose.Types.ObjectId);
        }
      }
    }

    // Clean up orphaned deleted product records in background
    if (orphanedDocIds.length > 0) {
      RecentlyViewed.deleteMany({ _id: { $in: orphanedDocIds } }).catch((err) =>
        console.error("Cleanup orphaned recently viewed error:", err)
      );
    }

    return NextResponse.json(
      {
        success: true,
        history: formattedHistory,
        isGuest: false,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET recently-viewed error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to fetch recently viewed.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST: Record product as recently viewed                            */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      // Guest: Client handles storage via localStorage
      return NextResponse.json(
        {
          success: false,
          isGuest: true,
          message: "Guest view should be stored in localStorage.",
        },
        { status: 200 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          isGuest: true,
          message: "Invalid session.",
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { productId, productData } = body;

    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required." },
        { status: 400 }
      );
    }

    const cleanProductId = productId.trim();

    await connectDB();

    // Verify product exists in DB or Sample data
    let isDbProduct = false;
    let sampleProduct: ProductType | undefined;

    if (mongoose.isValidObjectId(cleanProductId)) {
      const dbProd = await Product.findById(cleanProductId).lean();
      if (dbProd) {
        isDbProduct = true;
      }
    }

    if (!isDbProduct) {
      sampleProduct =
        SAMPLE_PRODUCTS.find((p) => p.id === cleanProductId) || productData;
    }

    if (!isDbProduct && !sampleProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // Upsert into RecentlyViewed: if exists, update viewedAt; if not, insert
    await RecentlyViewed.findOneAndUpdate(
      { user: payload.id, productId: cleanProductId },
      {
        $set: {
          product: isDbProduct ? cleanProductId : undefined,
          mockProduct: !isDbProduct ? sampleProduct : undefined,
          viewedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Recorded recently viewed product.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("POST recently-viewed error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to record recently viewed.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE: Clear all viewing history for authenticated user           */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: true, message: "Guest history should be cleared locally." },
        { status: 200 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    await connectDB();

    // Strictly delete only this user's viewing history
    await RecentlyViewed.deleteMany({ user: payload.id });

    return NextResponse.json(
      {
        success: true,
        message: "Viewing history cleared successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE recently-viewed error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to clear history.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
