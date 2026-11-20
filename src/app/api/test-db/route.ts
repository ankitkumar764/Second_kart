import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongooseInstance = await connectDB();
    const readyState = mongooseInstance.connection.readyState;

    const stateMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const statusText = stateMap[readyState] || "unknown";

    if (readyState === 1) {
      return NextResponse.json(
        {
          success: true,
          message: "Successfully connected to MongoDB Atlas.",
          status: statusText,
          databaseName: mongooseInstance.connection.name || "default",
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Database connection is currently in '${statusText}' state.`,
        status: statusText,
      },
      { status: 503 }
    );
  } catch (error) {
    // Log the actual error internally for server diagnostics
    console.error("MongoDB Atlas connection test failed:", error);

    // Return safe, sanitized response without exposing connection string or credentials
    const isMissingEnv =
      error instanceof Error &&
      error.message.includes("MONGODB_URI");

    return NextResponse.json(
      {
        success: false,
        message: isMissingEnv
          ? "Database configuration error: MONGODB_URI is missing or undefined in environment variables."
          : "Database connection failed. Please verify MongoDB Atlas network access, IP whitelist, and user credentials.",
        status: "error",
      },
      { status: 500 }
    );
  }
}
