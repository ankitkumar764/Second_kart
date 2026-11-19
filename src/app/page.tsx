"use client";

import { useState, useMemo } from "react";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import ProductGrid from "@/components/products/ProductGrid";
import { SAMPLE_PRODUCTS } from "@/lib/data/products";
import { FilterState, SortOption } from "@/types/product";

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    priceRange: "all",
    condition: "All",
    location: "All",
    onlyVerified: false,
    searchQuery: "",
  });

  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update partial filter state
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      category: "All",
      priceRange: "all",
      condition: "All",
      location: "All",
      onlyVerified: false,
      searchQuery: "",
    });
    setSortOption("newest");
  };

  // Calculate active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.condition !== "All") count++;
    if (filters.location !== "All") count++;
    if (filters.onlyVerified) count++;
    if (filters.searchQuery.trim() !== "") count++;
    return count;
  }, [filters]);

  // Filter and sort the sample products
  const filteredProducts = useMemo(() => {
    let result = [...SAMPLE_PRODUCTS];

    // Category Filter
    if (filters.category !== "All") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Price Range Filter
    if (filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under-500":
          result = result.filter((p) => p.price < 500);
          break;
        case "500-1500":
          result = result.filter((p) => p.price >= 500 && p.price <= 1500);
          break;
        case "1500-5000":
          result = result.filter((p) => p.price > 1500 && p.price <= 5000);
          break;
        case "above-5000":
          result = result.filter((p) => p.price > 5000);
          break;
      }
    }

    // Condition Filter
    if (filters.condition !== "All") {
      result = result.filter((p) => p.condition === filters.condition);
    }

    // Location Filter
    if (filters.location !== "All") {
      result = result.filter((p) => p.location === filters.location);
    }

    // Verified Sellers Only
    if (filters.onlyVerified) {
      result = result.filter((p) => p.isVerifiedSeller);
    }

    // Search Query: match title or description (case-insensitive)
    if (filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Newest: preserve insertion order (id ascending)
      result.sort((a, b) => a.id.localeCompare(b.id));
    }

    return result;
  }, [filters, sortOption]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ====================================================================
            3. PAGE HEADER
            ==================================================================== */}
        <div className="mb-8 sm:mb-12 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717]">
            Explore Marketplace
          </h1>
          <p className="text-sm sm:text-base text-[#777777]">
            Discover quality pre-loved essentials at student-friendly prices.
          </p>
        </div>

        {/* ====================================================================
            4. MAIN MARKETPLACE TWO-COLUMN LAYOUT
            ==================================================================== */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* LEFT SIDEBAR (Desktop) */}
          <div className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Toolbar: Count, Grid/List view toggle, Sort */}
            <ProductToolbar
              totalCount={filteredProducts.length}
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
              searchQuery={filters.searchQuery}
              onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Product Grid (4-column on desktop, 2-column on tablet, 1/2 on mobile) */}
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          MOBILE FILTERS DRAWER / MODAL
          ==================================================================== */}
      {isMobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div className="w-full max-w-xs h-full bg-white p-6 overflow-y-auto flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <h3 className="text-base font-semibold text-[#171717]">
                  Filter Products
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-md text-[#777777] hover:text-[#171717]"
                  aria-label="Close filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>

            <div className="pt-6 border-t border-[#E5E5E5] mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#171717] hover:bg-black rounded-md transition-colors"
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
