import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth/token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // 1. Name validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { success: false, message: "Full name cannot exceed 50 characters." },
        { status: 400 }
      );
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Password validation
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 4. Confirm Password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 5. Connect to MongoDB using connectDB utility
    await connectDB();

    // 6. Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 7. Hash password securely using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Create new user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const userSession = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    // 9. Sign JWT token and set HTTP-only cookie
    const token = await signToken(userSession);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: userSession,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });

    return response;
  } catch (error: unknown) {
    console.error("Signup API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process signup request.";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
