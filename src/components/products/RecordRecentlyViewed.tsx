"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { Product } from "@/types/product";

interface RecordRecentlyViewedProps {
  product: Product;
}

export default function RecordRecentlyViewed({
  product,
}: RecordRecentlyViewedProps) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    if (product && product.id) {
      recordView(product);
    }
  }, [product, recordView]);

  return null;
}
