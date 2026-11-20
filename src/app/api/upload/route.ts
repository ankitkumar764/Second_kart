import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to upload images." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session. Please log in again." },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file type. Please upload JPEG, PNG, WEBP, or GIF.",
        },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(buffer);
        return NextResponse.json(
          { success: true, url: cloudinaryUrl },
          { status: 200 }
        );
      } catch (cloudErr) {
        console.error("Cloudinary upload failed, using local storage fallback:", cloudErr);
      }
    }

    // Fallback: Local storage in public/uploads
    const ext = path.extname(file.name) || ".jpg";
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const localUrl = `/uploads/${filename}`;
    return NextResponse.json(
      { success: true, url: localUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image." },
      { status: 500 }
    );
  }
}
