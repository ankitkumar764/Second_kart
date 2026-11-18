"use client";

import { useState } from "react";
import { FilterState } from "@/types/product";
import {
  CATEGORIES_LIST,
  PRICE_RANGES,
  CONDITIONS_LIST,
  LOCATIONS_LIST,
} from "@/lib/data/products";

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export default function ProductFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: ProductFiltersProps) {
  // Expand/collapse state for each filter section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    condition: true,
    location: true,
    availability: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters =
    filters.category !== "All" ||
    filters.priceRange !== "all" ||
    filters.condition !== "All" ||
    filters.location !== "All" ||
    filters.onlyVerified;

  return (
    <aside className="w-full space-y-5 text-[#171717]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171717]">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[#777777] hover:text-[#171717] underline transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Categories Section */}
      <div className="pb-4 border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between py-1 text-sm font-medium text-[#171717] hover:text-[#8A8A72] transition-colors"
        >
          <span>Category</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
              openSections.categories ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSections.categories && (
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {CATEGORIES_LIST.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-[#171717] hover:text-black cursor-pointer group select-none"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat}
                  onChange={() => onFilterChange({ category: cat })}
                  className="w-3.5 h-3.5 text-[#171717] border-[#E5E5E5] focus:ring-0 focus:ring-offset-0 accent-[#171717] cursor-pointer"
                />
                <span
                  className={
                    filters.category === cat
                      ? "font-semibold text-[#171717]"
                      : "text-[#555555] group-hover:text-[#171717]"
                  }
                >
                  {cat}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Price Range Section */}
      <div className="pb-4 border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between py-1 text-sm font-medium text-[#171717] hover:text-[#8A8A72] transition-colors"
        >
          <span>Price Range</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-2 text-xs">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.value}
                className="flex items-center gap-2.5 text-[#171717] hover:text-black cursor-pointer group select-none"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === range.value}
                  onChange={() => onFilterChange({ priceRange: range.value })}
                  className="w-3.5 h-3.5 text-[#171717] border-[#E5E5E5] focus:ring-0 focus:ring-offset-0 accent-[#171717] cursor-pointer"
                />
                <span
                  className={
                    filters.priceRange === range.value
                      ? "font-semibold text-[#171717]"
                      : "text-[#555555] group-hover:text-[#171717]"
                  }
                >
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Condition Section */}
      <div className="pb-4 border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => toggleSection("condition")}
          className="flex w-full items-center justify-between py-1 text-sm font-medium text-[#171717] hover:text-[#8A8A72] transition-colors"
        >
          <span>Condition</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
              openSections.condition ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSections.condition && (
          <div className="mt-3 space-y-2 text-xs">
            {CONDITIONS_LIST.map((cond) => (
              <label
                key={cond}
                className="flex items-center gap-2.5 text-[#171717] hover:text-black cursor-pointer group select-none"
              >
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === cond}
                  onChange={() => onFilterChange({ condition: cond })}
                  className="w-3.5 h-3.5 text-[#171717] border-[#E5E5E5] focus:ring-0 focus:ring-offset-0 accent-[#171717] cursor-pointer"
                />
                <span
                  className={
                    filters.condition === cond
                      ? "font-semibold text-[#171717]"
                      : "text-[#555555] group-hover:text-[#171717]"
                  }
                >
                  {cond}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Location Section */}
      <div className="pb-4 border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="flex w-full items-center justify-between py-1 text-sm font-medium text-[#171717] hover:text-[#8A8A72] transition-colors"
        >
          <span>Campus Location</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
              openSections.location ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSections.location && (
          <div className="mt-3 space-y-2 text-xs">
            {LOCATIONS_LIST.map((loc) => (
              <label
                key={loc}
                className="flex items-center gap-2.5 text-[#171717] hover:text-black cursor-pointer group select-none"
              >
                <input
                  type="radio"
                  name="location"
                  checked={filters.location === loc}
                  onChange={() => onFilterChange({ location: loc })}
                  className="w-3.5 h-3.5 text-[#171717] border-[#E5E5E5] focus:ring-0 focus:ring-offset-0 accent-[#171717] cursor-pointer"
                />
                <span
                  className={
                    filters.location === loc
                      ? "font-semibold text-[#171717]"
                      : "text-[#555555] group-hover:text-[#171717]"
                  }
                >
                  {loc}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 5. Availability Section */}
      <div className="pb-4">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between py-1 text-sm font-medium text-[#171717] hover:text-[#8A8A72] transition-colors"
        >
          <span>Availability</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
              openSections.availability ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSections.availability && (
          <div className="mt-3 space-y-2 text-xs">
            <label className="flex items-center gap-2.5 text-[#171717] hover:text-black cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={filters.onlyVerified}
                onChange={(e) =>
                  onFilterChange({ onlyVerified: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded-xs text-[#171717] border-[#E5E5E5] focus:ring-0 focus:ring-offset-0 accent-[#171717] cursor-pointer"
              />
              <span
                className={
                  filters.onlyVerified
                    ? "font-semibold text-[#171717]"
                    : "text-[#555555] group-hover:text-[#171717]"
                }
              >
                Verified Student Sellers
              </span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}
