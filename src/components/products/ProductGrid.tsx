import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onResetFilters: () => void;
}

export default function ProductGrid({
  products,
  viewMode,
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg p-12 text-center space-y-3 my-4">
        <div className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#777777]">
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-[#171717]">
          No products found matching your filters
        </h3>
        <p className="text-xs text-[#777777] max-w-sm mx-auto">
          Try expanding your price range, choosing another category, or resetting all filters.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 text-xs font-medium text-white bg-[#171717] hover:bg-black rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode="grid" />
      ))}
    </div>
  );
}
