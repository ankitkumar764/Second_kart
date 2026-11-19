export type ProductCondition =
  | "Brand New"
  | "Like New"
  | "Gently Used"
  | "Good"
  | "Fair";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: ProductCondition;
  category: string;
  location: string;
  imageUrl: string;
  isWishlisted?: boolean;
  isVerifiedSeller?: boolean;
  postedAt: string;
}

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface FilterState {
  category: string;
  priceRange: string;
  condition: string;
  location: string;
  onlyVerified: boolean;
  searchQuery: string;
}
