"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    wishlist,
    loading: wishlistLoading,
    removeFromWishlist,
    refreshWishlist,
  } = useWishlist();

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/wishlist");
    }
  }, [user, authLoading, router]);

  // Auto-dismiss toast feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleRemove = async (productId: string, productName: string) => {
    setRemovingId(productId);
    try {
      const success = await removeFromWishlist(productId);
      if (success) {
        setFeedback({
          type: "success",
          message: `"${productName}" was removed from your wishlist.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: "Failed to remove item. Please try again.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const isLoading = authLoading || (wishlistLoading && wishlist.length === 0);

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="text-xs text-[#777777] hover:text-[#171717] transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                My Wishlist
              </h1>
              {!isLoading && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#777777] mt-1">
              Items you&apos;ve saved to inspect, track, or buy later on campus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-xs font-medium text-[#171717] rounded-md transition-colors"
            >
              Explore More
            </Link>
            <button
              type="button"
              onClick={() => refreshWishlist()}
              aria-label="Refresh wishlist"
              className="p-2 border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[#777777] hover:text-[#171717] rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            role="alert"
            className={`flex items-center justify-between gap-2 px-4 py-3 rounded-md text-sm border transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-emerald-600 shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-red-600 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs hover:opacity-75 p-1"
              aria-label="Dismiss feedback"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white border border-[#E5E5E5] rounded-lg p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-square bg-[#EEEEEE] rounded-md w-full" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-[#EEEEEE] rounded w-1/3" />
                  <div className="h-4 bg-[#EEEEEE] rounded w-3/4" />
                  <div className="h-4 bg-[#EEEEEE] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && wishlist.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-7 h-7"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#171717]">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
              Explore textbooks, scientific calculators, laptops, and campus
              essentials, and tap the heart icon on any listing to save it here.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-xs"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Product Grid */}
        {!isLoading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#171717]/30 transition-all duration-200 shadow-2xs"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full bg-[#F1F1F1] overflow-hidden flex items-center justify-center">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-4 group-hover:scale-103 transition-transform duration-300"
                  />

                  {/* Condition Tag */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-sm bg-white/90 text-[#171717] border border-[#E5E5E5] shadow-2xs backdrop-blur-xs">
                      {product.condition}
                    </span>
                  </div>

                  {/* Remove Button (Red heart) */}
                  <button
                    type="button"
                    disabled={removingId === product.id}
                    onClick={() => handleRemove(product.id, product.name)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/95 backdrop-blur-xs shadow-xs text-red-500 hover:bg-red-50 transition-colors z-10 cursor-pointer disabled:opacity-50"
                  >
                    {removingId === product.id ? (
                      <svg
                        className="w-4 h-4 animate-spin text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#777777] uppercase tracking-wider font-medium truncate">
                      {product.category}
                    </div>

                    <Link href={`/products/${product.id}`} className="block">
                      <h3 className="font-medium text-sm text-[#171717] group-hover:underline line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-[#E5E5E5]/60 flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-[#171717]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#777777] line-through font-normal">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-[#777777] truncate max-w-[45%]">
                      {product.location}
                    </span>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full inline-flex items-center justify-center py-1.5 px-3 bg-[#171717] hover:bg-black text-white text-xs font-medium rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
