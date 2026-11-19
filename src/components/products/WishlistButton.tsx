"use client";

import { useState } from "react";

interface WishlistButtonProps {
  initialState?: boolean;
}

export default function WishlistButton({
  initialState = false,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialState);

  return (
    <button
      type="button"
      onClick={() => setIsWishlisted((prev) => !prev)}
      aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors duration-150 ${
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-[#E5E5E5] bg-white text-[#171717] hover:bg-[#EEEEEE]"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      {isWishlisted ? "Saved" : "Save to Wishlist"}
    </button>
  );
}
