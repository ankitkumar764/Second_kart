"use client";

import { useRef } from "react";
import { FilterState, SortOption } from "@/types/product";
import { PRICE_RANGES } from "@/lib/data/products";

interface ProductToolbarProps {
  totalCount: number;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

/* ------------------------------------------------------------------ */
/* Active filter chips data builder                                     */
/* ------------------------------------------------------------------ */
interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

function buildChips(
  filters: FilterState,
  sortOption: SortOption,
  onFilterChange: (patch: Partial<FilterState>) => void,
  onSortChange: (s: SortOption) => void
): Chip[] {
  const chips: Chip[] = [];

  if (filters.searchQuery.trim() !== "") {
    chips.push({
      key: "search",
      label: `"${filters.searchQuery.trim()}"`,
      onRemove: () => onFilterChange({ searchQuery: "" }),
    });
  }

  if (filters.category !== "All") {
    chips.push({
      key: "category",
      label: filters.category,
      onRemove: () => onFilterChange({ category: "All" }),
    });
  }

  if (filters.priceRange !== "all") {
    const rangeLabel =
      PRICE_RANGES.find((r) => r.value === filters.priceRange)?.label ??
      filters.priceRange;
    chips.push({
      key: "price",
      label: rangeLabel,
      onRemove: () => onFilterChange({ priceRange: "all" }),
    });
  }

  if (filters.condition !== "All") {
    chips.push({
      key: "condition",
      label: filters.condition,
      onRemove: () => onFilterChange({ condition: "All" }),
    });
  }

  if (filters.location !== "All") {
    chips.push({
      key: "location",
      label: filters.location,
      onRemove: () => onFilterChange({ location: "All" }),
    });
  }

  if (filters.onlyVerified) {
    chips.push({
      key: "verified",
      label: "Verified sellers",
      onRemove: () => onFilterChange({ onlyVerified: false }),
    });
  }

  if (sortOption !== "newest") {
    const sortLabel =
      sortOption === "price-asc" ? "Price: Low → High" : "Price: High → Low";
    chips.push({
      key: "sort",
      label: sortLabel,
      onRemove: () => onSortChange("newest"),
    });
  }

  return chips;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function ProductToolbar({
  totalCount,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  activeFilterCount,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
}: ProductToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const chips = buildChips(filters, sortOption, onFilterChange, onSortChange);
  const hasAnyActive = chips.length > 0;

  return (
    <div className="space-y-3">
      {/* ---- Row 1: Search Bar ---- */}
      <div className="relative">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#777777]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="search"
          id="product-search"
          placeholder="Search books, electronics, furniture..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-[#E5E5E5] rounded-md pl-9 pr-10 py-2.5 text-sm text-[#171717] placeholder:text-[#777777] focus:outline-none focus:border-[#171717] transition-colors"
          aria-label="Search products"
          autoComplete="off"
        />

        {/* Clear search × button */}
        {searchQuery !== "" && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute inset-y-0 right-3 flex items-center text-[#777777] hover:text-[#171717] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ---- Row 2: Count / Mobile Filter / View / Sort ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        {/* Left: Count + mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E5E5] bg-white text-xs font-medium text-[#171717] hover:bg-[#F5F5F5] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-[#777777]">
            Showing{" "}
            <span className="font-semibold text-[#171717]">{totalCount}</span>{" "}
            {totalCount === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Right: View toggle + Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* View Mode Toggle */}
          <div
            className="flex items-center border border-[#E5E5E5] rounded-md p-0.5 bg-white"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#171717] text-white"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#171717] text-white"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Sort Select */}
          <div className="relative">
            <label htmlFor="sort-dropdown" className="sr-only">
              Sort by
            </label>
            <select
              id="sort-dropdown"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#171717] transition-colors cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#777777]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Row 3: Active Filter Chips ---- */}
      {hasAnyActive && (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-xs text-[#171717] hover:bg-[#EEEEEE] hover:border-[#171717]/30 transition-colors group"
              aria-label={`Remove filter: ${chip.label}`}
            >
              <span>{chip.label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3 text-[#777777] group-hover:text-[#171717] transition-colors"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          ))}

          {/* Clear All */}
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              onSortChange("newest");
            }}
            className="text-xs text-[#777777] hover:text-[#171717] underline underline-offset-2 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
