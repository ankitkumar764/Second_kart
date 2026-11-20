"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Product } from "@/types/product";
import { useAuth } from "./AuthContext";

const LOCAL_STORAGE_KEY = "secondcart_recently_viewed";
const MAX_HISTORY_ITEMS = 30;

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  loading: boolean;
  recordView: (product: Product) => Promise<void>;
  clearHistory: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const RecentlyViewedContext = createContext<
  RecentlyViewedContextType | undefined
>(undefined);

export function RecentlyViewedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  /*  Helper: Read guest history from localStorage                       */
  /* ------------------------------------------------------------------ */
  const getLocalHistory = (): Product[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Helper: Save guest history to localStorage                         */
  /* ------------------------------------------------------------------ */
  const saveLocalHistory = (items: Product[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS))
      );
    } catch {
      // ignore storage quota errors
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Fetch history (Logged-in -> MongoDB, Guest -> localStorage)        */
  /* ------------------------------------------------------------------ */
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await fetch("/api/recently-viewed", {
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.history)) {
            setRecentlyViewed(data.history);
            return;
          }
        }
      }

      // Guest fallback or fallback if API unauthenticated
      const local = getLocalHistory();
      setRecentlyViewed(local);
    } catch (err) {
      console.error("Failed to load recently viewed history:", err);
      const local = getLocalHistory();
      setRecentlyViewed(local);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* ------------------------------------------------------------------ */
  /*  Initial mount & sync when auth state changes                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let isSubscribed = true;

    async function load() {
      try {
        setLoading(true);
        if (user) {
          const res = await fetch("/api/recently-viewed", {
            credentials: "same-origin",
          });
          if (res.ok) {
            const data = await res.json();
            if (isSubscribed && data.success && Array.isArray(data.history)) {
              setRecentlyViewed(data.history);
              return;
            }
          }
        }

        // Guest mode
        if (isSubscribed) {
          const local = getLocalHistory();
          setRecentlyViewed(local);
        }
      } catch (err) {
        console.error("Load recently viewed error:", err);
        if (isSubscribed) {
          const local = getLocalHistory();
          setRecentlyViewed(local);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  /* ------------------------------------------------------------------ */
  /*  Record product view                                                */
  /* ------------------------------------------------------------------ */
  const recordView = useCallback(
    async (product: Product) => {
      if (!product || !product.id) return;
      const pid = String(product.id);

      // 1. Optimistic state update: move or prepend to top
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((p) => String(p.id) !== pid);
        const updated = [product, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        // Also persist to localStorage for offline / guest backup
        saveLocalHistory(updated);
        return updated;
      });

      // 2. If logged in, persist to MongoDB Atlas
      if (user) {
        try {
          await fetch("/api/recently-viewed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: pid,
              productData: product,
            }),
          });
        } catch (err) {
          console.error("Error saving view to MongoDB:", err);
        }
      }
    },
    [user]
  );

  /* ------------------------------------------------------------------ */
  /*  Clear entire history                                               */
  /* ------------------------------------------------------------------ */
  const clearHistory = useCallback(async () => {
    // 1. Optimistic clear
    setRecentlyViewed([]);

    // 2. Clear localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    // 3. Clear MongoDB if authenticated
    if (user) {
      try {
        await fetch("/api/recently-viewed", { method: "DELETE" });
      } catch (err) {
        console.error("Error clearing viewing history on server:", err);
      }
    }
  }, [user]);

  /* ------------------------------------------------------------------ */
  /*  Remove single item from history                                   */
  /* ------------------------------------------------------------------ */
  const removeItem = useCallback(
    async (productId: string) => {
      const pid = String(productId);

      // 1. Optimistic state update
      setRecentlyViewed((prev) => {
        const updated = prev.filter((p) => String(p.id) !== pid);
        saveLocalHistory(updated);
        return updated;
      });

      // 2. Remove from MongoDB if authenticated
      if (user) {
        try {
          await fetch(`/api/recently-viewed/${encodeURIComponent(pid)}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Error removing item from server:", err);
        }
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      recentlyViewed,
      loading,
      recordView,
      clearHistory,
      removeItem,
      refreshHistory: fetchHistory,
    }),
    [recentlyViewed, loading, recordView, clearHistory, removeItem, fetchHistory]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider"
    );
  }
  return context;
}
