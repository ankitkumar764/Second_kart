import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";
import { SAMPLE_PRODUCTS } from "@/lib/data/products";
import { Product as ProductType } from "@/types/product";

/* ------------------------------------------------------------------ */
/*  GET: Fetch authenticated user's wishlist                           */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to view your wishlist.",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session. Please log in again.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const wishlistDocs = await Wishlist.find({ user: payload.id })
      .sort({ createdAt: -1 })
      .populate("product")
      .lean();

    const formattedWishlist: ProductType[] = [];
    const validProductIds: string[] = [];
    const orphanedDocIds: mongoose.Types.ObjectId[] = [];

    for (const item of wishlistDocs) {
      // 1. If it's a valid DB product
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
          createdAt: Date;
          sellerName?: string;
          sellerCampus?: string;
        };

        const idStr = p._id.toString();
        validProductIds.push(idStr);
        formattedWishlist.push({
          id: idStr,
          name: p.title,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          condition: p.condition as ProductType["condition"],
          category: p.category,
          location: p.location,
          imageUrl: p.imageUrl || p.images?.[0] || "",
          isWishlisted: true,
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
          validProductIds.push(sampleMatch.id);
          formattedWishlist.push({
            ...sampleMatch,
            isWishlisted: true,
          });
        } else if (item.mockProduct && typeof item.mockProduct === "object") {
          const mp = item.mockProduct as unknown as ProductType;
          validProductIds.push(item.productId);
          formattedWishlist.push({
            ...mp,
            isWishlisted: true,
          });
        } else if (mongoose.isValidObjectId(item.productId)) {
          // DB product was deleted in the meantime -> mark orphaned entry for cleanup
          orphanedDocIds.push(item._id as mongoose.Types.ObjectId);
        }
      }
    }

    // Clean up orphaned deleted products silently in background
    if (orphanedDocIds.length > 0) {
      Wishlist.deleteMany({ _id: { $in: orphanedDocIds } }).catch((err) =>
        console.error("Cleanup orphaned wishlist items error:", err)
      );
    }

    return NextResponse.json(
      {
        success: true,
        wishlist: formattedWishlist,
        productIds: validProductIds,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET wishlist error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to fetch wishlist.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST: Add product to authenticated user's wishlist                 */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to add items to your wishlist.",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required." },
        { status: 400 }
      );
    }

    const cleanProductId = productId.trim();

    await connectDB();

    // 1. Verify that the product actually exists
    let isDbProduct = false;
    let sampleProduct: ProductType | undefined;

    if (mongoose.isValidObjectId(cleanProductId)) {
      const dbProd = await Product.findById(cleanProductId).lean();
      if (dbProd) {
        isDbProduct = true;
      }
    }

    if (!isDbProduct) {
      sampleProduct = SAMPLE_PRODUCTS.find((p) => p.id === cleanProductId);
    }

    if (!isDbProduct && !sampleProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // 2. Prevent duplicate entries
    const existing = await Wishlist.findOne({
      user: payload.id,
      productId: cleanProductId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Product is already in your wishlist.",
          isWishlisted: true,
        },
        { status: 200 }
      );
    }

    // 3. Create entry
    await Wishlist.create({
      user: payload.id,
      product: isDbProduct ? cleanProductId : undefined,
      productId: cleanProductId,
      mockProduct: sampleProduct ? (sampleProduct as unknown) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added to wishlist.",
        isWishlisted: true,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle duplicate key error in case of race conditions
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: true,
          message: "Product is already in your wishlist.",
          isWishlisted: true,
        },
        { status: 200 }
      );
    }

    console.error("POST wishlist error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to add to wishlist.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
