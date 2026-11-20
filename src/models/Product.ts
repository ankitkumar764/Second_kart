import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  condition: "Brand New" | "New" | "Like New" | "Gently Used" | "Good" | "Fair";
  images: string[];
  imageUrl: string;
  location: string;
  seller: Types.ObjectId;
  sellerName?: string;
  sellerCampus?: string;
  isVerifiedSeller: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["Brand New", "New", "Like New", "Gently Used", "Good", "Fair"],
        message: "{VALUE} is not a valid condition",
      },
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: "At least one product image is required",
      },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: [true, "Campus location is required"],
      trim: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller user ID is required"],
    },
    sellerName: {
      type: String,
      trim: true,
    },
    sellerCampus: {
      type: String,
      trim: true,
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
