import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RecentlyViewed from "@/models/RecentlyViewed";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/* ------------------------------------------------------------------ */
/*  DELETE: Remove single product from viewing history                 */
/* ------------------------------------------------------------------ */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: true, message: "Guest item should be removed locally." },
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

    const { productId } = await params;
    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Strictly delete this user's specific viewing history record
    await RecentlyViewed.findOneAndDelete({
      user: payload.id,
      productId: productId.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from recently viewed history.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE single recently-viewed error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to remove item.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
