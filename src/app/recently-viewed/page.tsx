"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

export default function RecentlyViewedPage() {
  const { recentlyViewed, loading, clearHistory, removeItem, refreshHistory } =
    useRecentlyViewed();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-dismiss feedback toast
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleConfirmClear = async () => {
    setClearing(true);
    try {
      await clearHistory();
      setShowClearConfirm(false);
      setFeedback("Viewing history cleared.");
    } catch {
      setFeedback("Failed to clear viewing history.");
    } finally {
      setClearing(false);
    }
  };

  const handleRemoveSingle = async (productId: string, productName: string) => {
    try {
      await removeItem(productId);
      setFeedback(`Removed "${productName}" from history.`);
    } catch {
      setFeedback("Failed to remove item.");
    }
  };

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
                Recently Viewed
              </h1>
              {!loading && recentlyViewed.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEEEEE] text-[#171717] border border-[#E5E5E5]">
                  {recentlyViewed.length}{" "}
                  {recentlyViewed.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#777777] mt-1">
              Items you&apos;ve browsed recently across SecondCart campus
              marketplace.
            </p>
          </div>

          {!loading && recentlyViewed.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Clear History
              </button>
              <button
                type="button"
                onClick={() => refreshHistory()}
                aria-label="Refresh recently viewed list"
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
          )}
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-md text-sm border bg-emerald-50 border-emerald-200 text-emerald-800 transition-all"
          >
            <div className="flex items-center gap-2">
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
              <span>{feedback}</span>
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
        {loading && (
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
        {!loading && recentlyViewed.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] text-[#777777] flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-7 h-7"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#171717]">
              No Recently Viewed Products
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
              As you explore textbooks, calculators, electronics, and bikes on
              SecondCart, the products you view will appear here so you can
              easily find them again.
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

        {/* Product Grid */}
        {!loading && recentlyViewed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {recentlyViewed.map((product) => (
              <div
                key={product.id}
                className="flex flex-col justify-between group/item"
              >
                <ProductCard product={product} viewMode="grid" />
                <button
                  type="button"
                  onClick={() => handleRemoveSingle(product.id, product.name)}
                  className="mt-1.5 text-[11px] text-[#777777] hover:text-red-600 transition-colors flex items-center justify-center gap-1 py-1"
                  aria-label={`Remove ${product.name} from history`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3 h-3"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  Remove from history
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          >
            <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-sm w-full p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>

              <div>
                <h2
                  id="clear-modal-title"
                  className="text-base font-bold text-[#171717]"
                >
                  Clear viewing history?
                </h2>
                <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                  Are you sure you want to clear all recently viewed items? This
                  will remove them from your history.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearing}
                  className="px-4 py-2 text-xs font-semibold text-[#777777] hover:text-[#171717] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  disabled={clearing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {clearing ? "Clearing…" : "Clear History"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
