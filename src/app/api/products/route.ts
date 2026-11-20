import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. You must be logged in to create a listing.",
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

    // 2. Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      originalPrice,
      condition,
      images,
      location,
    } = body;

    // 3. Backend validations
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Title must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (title.trim().length > 120) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 120 characters." },
        { status: 400 }
      );
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must be at least 10 characters long.",
        },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { success: false, message: "Category is required." },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid price." },
        { status: 400 }
      );
    }

    let numericOriginalPrice: number | undefined;
    if (originalPrice !== undefined && originalPrice !== "") {
      numericOriginalPrice = Number(originalPrice);
      if (isNaN(numericOriginalPrice) || numericOriginalPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Original price must be a valid positive number." },
          { status: 400 }
        );
      }
    }

    const allowedConditions = [
      "Brand New",
      "New",
      "Like New",
      "Gently Used",
      "Good",
      "Fair",
    ];
    if (!condition || !allowedConditions.includes(condition)) {
      return NextResponse.json(
        {
          success: false,
          message: `Condition must be one of: ${allowedConditions.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // Process images (array or single string)
    let imageUrls: string[] = [];
    if (Array.isArray(images)) {
      imageUrls = images.filter((img) => typeof img === "string" && img.trim() !== "");
    } else if (typeof images === "string" && images.trim() !== "") {
      imageUrls = [images.trim()];
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one product image is required." },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { success: false, message: "Campus location is required." },
        { status: 400 }
      );
    }

    // 4. Connect to database
    await connectDB();

    // 5. Create product associated with authenticated seller
    const newProduct = await Product.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      condition,
      images: imageUrls,
      imageUrl: imageUrls[0],
      location: location.trim(),
      seller: payload.id,
      sellerName: payload.name,
      isVerifiedSeller: true,
      isAvailable: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product listing created successfully.",
        product: {
          id: newProduct._id.toString(),
          title: newProduct.title,
          price: newProduct.price,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create product listing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create product listing.";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .populate("seller", "name email");

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
