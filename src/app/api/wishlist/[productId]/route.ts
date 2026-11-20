import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/* ------------------------------------------------------------------ */
/*  DELETE: Remove product from authenticated user's wishlist          */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to update your wishlist.",
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

    const { productId } = await params;
    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Only delete this user's wishlist entry
    await Wishlist.findOneAndDelete({
      user: payload.id,
      productId: productId.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from wishlist.",
        isWishlisted: false,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE wishlist error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to remove from wishlist.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
