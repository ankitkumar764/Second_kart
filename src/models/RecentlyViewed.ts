import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRecentlyViewed extends Document {
  user: Types.ObjectId;
  product?: Types.ObjectId;
  productId: string;
  mockProduct?: unknown;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      trim: true,
    },
    mockProduct: {
      type: Schema.Types.Mixed,
      required: false,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensures one entry per user + product
RecentlyViewedSchema.index({ user: 1, productId: 1 }, { unique: true });

const RecentlyViewed: Model<IRecentlyViewed> =
  mongoose.models.RecentlyViewed ||
  mongoose.model<IRecentlyViewed>("RecentlyViewed", RecentlyViewedSchema);

export default RecentlyViewed;
