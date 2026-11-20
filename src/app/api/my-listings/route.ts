import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to view your listings.",
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

    // 2. Connect to database
    await connectDB();

    // 3. Fetch listings created by this authenticated user
    const listings = await Product.find({ seller: payload.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        listings,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Get my listings error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch listings.";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
