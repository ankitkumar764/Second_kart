import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/* ------------------------------------------------------------------ */
/*  GET: Fetch single product details                                  */
/* ------------------------------------------------------------------ */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format." },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(id).populate("seller", "name email");

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH: Update an existing listing (Owner only)                    */
/* ------------------------------------------------------------------ */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to edit listings.",
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

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Find listing
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Listing not found." },
        { status: 404 }
      );
    }

    // 3. Ownership check: Only the seller who created the product can edit
    if (product.seller.toString() !== payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. You can only edit your own listings.",
        },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      originalPrice,
      condition,
      location,
      isAvailable,
      images,
      imageUrl,
    } = body;

    // Validate fields if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 3) {
        return NextResponse.json(
          { success: false, message: "Title must be at least 3 characters." },
          { status: 400 }
        );
      }
      if (title.trim().length > 120) {
        return NextResponse.json(
          { success: false, message: "Title cannot exceed 120 characters." },
          { status: 400 }
        );
      }
      product.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length < 10) {
        return NextResponse.json(
          {
            success: false,
            message: "Description must be at least 10 characters.",
          },
          { status: 400 }
        );
      }
      product.description = description.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return NextResponse.json(
          { success: false, message: "Category cannot be empty." },
          { status: 400 }
        );
      }
      product.category = category.trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid price." },
          { status: 400 }
        );
      }
      product.price = numPrice;
    }

    if (originalPrice !== undefined) {
      if (originalPrice === null || originalPrice === "") {
        product.originalPrice = undefined;
      } else {
        const numOrig = Number(originalPrice);
        if (isNaN(numOrig) || numOrig < 0) {
          return NextResponse.json(
            { success: false, message: "Original price must be positive." },
            { status: 400 }
          );
        }
        product.originalPrice = numOrig;
      }
    }

    if (condition !== undefined) {
      const allowedConditions = [
        "Brand New",
        "New",
        "Like New",
        "Gently Used",
        "Good",
        "Fair",
      ];
      if (!allowedConditions.includes(condition)) {
        return NextResponse.json(
          {
            success: false,
            message: `Condition must be one of: ${allowedConditions.join(", ")}.`,
          },
          { status: 400 }
        );
      }
      product.condition = condition;
    }

    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        return NextResponse.json(
          { success: false, message: "Campus location cannot be empty." },
          { status: 400 }
        );
      }
      product.location = location.trim();
    }

    if (isAvailable !== undefined) {
      product.isAvailable = Boolean(isAvailable);
    }

    if (Array.isArray(images) && images.length > 0) {
      const validImages = images.filter(
        (img) => typeof img === "string" && img.trim() !== ""
      );
      if (validImages.length > 0) {
        product.images = validImages;
        product.imageUrl = validImages[0];
      }
    } else if (imageUrl && typeof imageUrl === "string") {
      product.imageUrl = imageUrl;
    }

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Listing updated successfully.",
        product,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("PATCH product error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update listing.";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE: Remove a listing (Owner only)                             */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to delete listings.",
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

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Find listing
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Listing not found." },
        { status: 404 }
      );
    }

    // 3. Ownership check: Only the seller who created the product can delete
    if (product.seller.toString() !== payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. You can only delete your own listings.",
        },
        { status: 403 }
      );
    }

    // 4. Delete document
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Listing deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE product error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete listing.";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
