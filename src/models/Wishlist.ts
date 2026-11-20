import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWishlist extends Document {
  user: Types.ObjectId;
  product?: Types.ObjectId;
  productId: string;
  mockProduct?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents duplicate wishlist items for a user
WishlistSchema.index({ user: 1, productId: 1 }, { unique: true });

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
