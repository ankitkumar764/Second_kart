"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES_LIST, CONDITIONS_LIST, LOCATIONS_LIST } from "@/lib/data/products";

export default function SellPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const categories = CATEGORIES_LIST.filter((c) => c !== "All");
  const conditions = CONDITIONS_LIST.filter((c) => c !== "All");
  const locations = LOCATIONS_LIST.filter((c) => c !== "All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs text-[#777777] hover:text-[#171717] transition-colors inline-flex items-center gap-1 mb-4"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            List an Item for Sale
          </h1>
          <p className="text-sm text-[#777777] mt-1">
            Reach students across your campus quickly and safely.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#171717]">
              Listing Submitted!
            </h2>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              Your item has been received and will be visible to students in your
              campus feed shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-[#171717] text-white text-xs font-semibold rounded-md hover:bg-black transition-colors"
              >
                Return to Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            {/* Authenticated Seller Badge */}
            <div className="bg-[#F5F5F5] rounded-lg p-3.5 border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#777777]">Posting as authenticated seller</p>
                <p className="text-sm font-semibold text-[#171717]">
                  {user?.name || "Student Seller"}
                </p>
              </div>
              <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="item-title"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Item Title
              </label>
              <input
                id="item-title"
                type="text"
                required
                placeholder="e.g. Casio FX-991CW Scientific Calculator"
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="item-category"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
                >
                  Category
                </label>
                <select
                  id="item-category"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-hidden focus:border-[#171717] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="item-condition"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
                >
                  Condition
                </label>
                <select
                  id="item-condition"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-hidden focus:border-[#171717] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select condition
                  </option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="item-price"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
                >
                  Selling Price (₹)
                </label>
                <input
                  id="item-price"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 850"
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="item-location"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
                >
                  Campus Location
                </label>
                <select
                  id="item-location"
                  required
                  defaultValue=""
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-hidden focus:border-[#171717] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select campus location
                  </option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="item-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Description
              </label>
              <textarea
                id="item-desc"
                rows={4}
                required
                placeholder="Describe condition, reason for selling, any included accessories..."
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-hidden focus:border-[#171717] transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#171717] hover:bg-black text-white text-sm font-semibold rounded-md transition-colors"
            >
              Post Item for Sale
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
