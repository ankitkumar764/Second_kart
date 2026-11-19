"use client";

import { SortOption } from "@/types/product";

interface ProductToolbarProps {
  totalCount: number;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
}

export default function ProductToolbar({
  totalCount,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  activeFilterCount,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
      {/* Left: Product Count & Mobile Filter Trigger */}
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
          Showing <span className="font-semibold text-[#171717]">{totalCount}</span> {totalCount === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Right: Grid/List View Toggle & Sort Dropdown */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-[#E5E5E5] rounded-md p-0.5 bg-white">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
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
            className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
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
            className="appearance-none bg-white border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded-md pl-3 pr-8 py-1.5 focus:outline-hidden focus:border-[#171717] transition-colors cursor-pointer"
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
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
