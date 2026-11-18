"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.isWishlisted));
  const [imgSrc, setImgSrc] = useState(product.imageUrl);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  if (viewMode === "list") {
    return (
      <Link
        href={`/products/${product.id}`}
        className="group flex flex-col sm:flex-row bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#171717]/30 transition-all duration-200"
      >
        {/* Left: Image Container */}
        <div className="relative aspect-4/3 sm:aspect-square w-full sm:w-48 sm:h-48 bg-[#F1F1F1] shrink-0 overflow-hidden flex items-center justify-center">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-contain p-3 group-hover:scale-102 transition-transform duration-300"
            onError={() => {
              setImgSrc(
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
              );
            }}
          />
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-colors duration-150 ${
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-[#777777] hover:text-[#171717]"
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
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        {/* Right: Details Container */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-[#777777]">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-[#171717] font-medium">{product.condition}</span>
            </div>
            <h3 className="font-medium text-base text-[#171717] group-hover:text-black line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-[#777777] line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]/60">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#171717]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#777777] line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-xs text-[#777777] flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 text-[#777777]"
                aria-hidden="true"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{product.location}</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid Card
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#171717]/30 transition-all duration-200"
    >
      {/* Light Grey Image Container (#F1F1F1) */}
      <div className="relative aspect-square w-full bg-[#F1F1F1] overflow-hidden flex items-center justify-center">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-103 transition-transform duration-300"
          onError={() => {
            setImgSrc(
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            );
          }}
        />

        {/* Condition Badge (Top-Left, minimal tag) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-sm bg-white/90 text-[#171717] border border-[#E5E5E5] shadow-2xs backdrop-blur-xs">
            {product.condition}
          </span>
        </div>

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-colors duration-150 z-10 ${
            isWishlisted
              ? "text-red-500 fill-red-500"
              : "text-[#777777] hover:text-[#171717]"
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
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
        <div className="space-y-1">
          {/* Category */}
          <div className="text-[11px] text-[#777777] uppercase tracking-wider font-medium">
            {product.category}
          </div>

          {/* Product Title */}
          <h3 className="font-medium text-sm text-[#171717] group-hover:text-black line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-[#E5E5E5]/60 flex items-center justify-between gap-1">
          {/* Selling Price & Original Price */}
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

          {/* Location */}
          <span className="text-[11px] text-[#777777] truncate max-w-[45%]">
            {product.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
