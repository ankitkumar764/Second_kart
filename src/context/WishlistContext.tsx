"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  openLoginPrompt: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const openLoginPrompt = useCallback(() => setShowLoginPrompt(true), []);
  const closeLoginPrompt = useCallback(() => setShowLoginPrompt(false), []);

  /* ------------------------------------------------------------------ */
  /*  Load Wishlist                                                      */
  /* ------------------------------------------------------------------ */
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/wishlist", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWishlist(data.wishlist || []);
          const ids = new Set<string>(
            (data.productIds || []).map((id: string) => String(id))
          );
          setWishlistIds(ids);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isSubscribed = true;

    async function load() {
      if (!user) {
        if (isSubscribed) {
          setWishlist([]);
          setWishlistIds(new Set());
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/wishlist", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && data.success) {
            setWishlist(data.wishlist || []);
            const ids = new Set<string>(
              (data.productIds || []).map((id: string) => String(id))
            );
            setWishlistIds(ids);
          }
        }
      } catch (err) {
        console.error("Wishlist load error:", err);
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
  /*  Check membership                                                   */
  /* ------------------------------------------------------------------ */
  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return wishlistIds.has(String(productId));
    },
    [wishlistIds]
  );

  /* ------------------------------------------------------------------ */
  /*  Toggle wishlist                                                    */
  /* ------------------------------------------------------------------ */
  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      const idStr = String(productId);
      if (!user) {
        setShowLoginPrompt(true);
        return false;
      }

      const currentlyWishlisted = wishlistIds.has(idStr);

      if (currentlyWishlisted) {
        // Optimistic remove
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });
        setWishlist((prev) => prev.filter((p) => String(p.id) !== idStr));

        try {
          const res = await fetch(`/api/wishlist/${encodeURIComponent(idStr)}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            // Rollback on failure
            fetchWishlist();
            return true;
          }
          return false;
        } catch {
          fetchWishlist();
          return true;
        }
      } else {
        // Optimistic add
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(idStr);
          return next;
        });

        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: idStr }),
          });

          if (!res.ok) {
            fetchWishlist();
            return false;
          }

          // Fetch full product into state
          fetchWishlist();
          return true;
        } catch {
          fetchWishlist();
          return false;
        }
      }
    },
    [user, wishlistIds, fetchWishlist]
  );

  /* ------------------------------------------------------------------ */
  /*  Explicit Remove                                                    */
  /* ------------------------------------------------------------------ */
  const removeFromWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      const idStr = String(productId);
      if (!user) return false;

      // Optimistic remove
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
      setWishlist((prev) => prev.filter((p) => String(p.id) !== idStr));

      try {
        const res = await fetch(`/api/wishlist/${encodeURIComponent(idStr)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          fetchWishlist();
          return false;
        }
        return true;
      } catch {
        fetchWishlist();
        return false;
      }
    },
    [user, fetchWishlist]
  );

  const value = useMemo(
    () => ({
      wishlist,
      wishlistIds,
      loading,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      refreshWishlist: fetchWishlist,
      openLoginPrompt,
    }),
    [
      wishlist,
      wishlistIds,
      loading,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      fetchWishlist,
      openLoginPrompt,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}

      {/* Guest Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h2
                id="login-prompt-title"
                className="text-base font-bold text-[#171717]"
              >
                Save to your Wishlist
              </h2>
              <p className="text-xs text-[#777777] leading-relaxed">
                Log in or sign up to save products and easily view them later
                from your campus dashboard.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={closeLoginPrompt}
                className="w-full py-2.5 px-4 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-md transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={closeLoginPrompt}
                className="w-full py-2.5 px-4 border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717] text-xs font-semibold rounded-md transition-colors"
              >
                Create an Account
              </Link>
              <button
                type="button"
                onClick={closeLoginPrompt}
                className="text-xs text-[#777777] hover:text-[#171717] pt-1"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
