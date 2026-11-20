"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CATEGORIES_LIST,
  CONDITIONS_LIST,
  LOCATIONS_LIST,
} from "@/lib/data/products";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  condition: string;
  images: string[];
  imageUrl: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string;
  condition: string;
  location: string;
  isAvailable: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

function conditionBadgeClass(condition: string): string {
  switch (condition) {
    case "Brand New":
    case "New":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Like New":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Gently Used":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Good":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Fair":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-[#F5F5F5] text-[#777777] border-[#E5E5E5]";
  }
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tab filter: all, active, sold
  const [filterTab, setFilterTab] = useState<"all" | "active" | "sold">("all");

  // Edit Modal State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    condition: "",
    location: "",
    isAvailable: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action in-flight tracking (e.g. status toggle)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const categories = CATEGORIES_LIST.filter((c) => c !== "All");
  const conditions = CONDITIONS_LIST.filter((c) => c !== "All");
  const locations = LOCATIONS_LIST.filter((c) => c !== "All");

  /* ------------------------------------------------------------------ */
  /*  Fetch listings                                                     */
  /* ------------------------------------------------------------------ */
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadListings = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/my-listings");
      return;
    }

    if (user) {
      const load = async () => {
        try {
          const res = await fetch("/api/my-listings", {
            headers: { "Cache-Control": "no-cache" },
          });
          const data = await res.json();
          if (!isSubscribed) return;

          if (!res.ok || !data.success) {
            if (res.status === 401) {
              router.push("/login?callbackUrl=/my-listings");
              return;
            }
            throw new Error(data.message || "Failed to load listings.");
          }

          setListings(data.listings || []);
        } catch (err: unknown) {
          if (!isSubscribed) return;
          console.error("Fetch listings error:", err);
          const msg =
            err instanceof Error ? err.message : "Failed to load listings.";
          setError(msg);
        } finally {
          if (isSubscribed) {
            setLoading(false);
          }
        }
      };

      load();
    }

    return () => {
      isSubscribed = false;
    };
  }, [user, authLoading, router, refreshKey]);

  // Dismiss feedback banner after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  /* ------------------------------------------------------------------ */
  /*  Status Toggle (Available <-> Sold)                                 */
  /* ------------------------------------------------------------------ */
  const handleToggleStatus = async (listing: Listing) => {
    setActionLoadingId(listing._id);
    const newStatus = !listing.isAvailable;
    try {
      const res = await fetch(`/api/products/${listing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update listing status.");
      }

      setListings((prev) =>
        prev.map((item) =>
          item._id === listing._id ? { ...item, isAvailable: newStatus } : item
        )
      );

      setFeedback({
        type: "success",
        message: newStatus
          ? `Listing marked as Active.`
          : `Listing marked as Sold.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not update status.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Edit Listing Actions                                               */
  /* ------------------------------------------------------------------ */
  const openEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: listing.price.toString(),
      originalPrice: listing.originalPrice?.toString() || "",
      condition: listing.condition,
      location: listing.location,
      isAvailable: listing.isAvailable,
    });
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingListing(null);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    // Frontend validation
    if (!editForm.title.trim() || editForm.title.trim().length < 3) {
      setEditError("Title must be at least 3 characters.");
      return;
    }
    if (editForm.title.trim().length > 120) {
      setEditError("Title cannot exceed 120 characters.");
      return;
    }
    if (
      !editForm.description.trim() ||
      editForm.description.trim().length < 10
    ) {
      setEditError("Description must be at least 10 characters.");
      return;
    }
    if (!editForm.category) {
      setEditError("Please select a category.");
      return;
    }
    const priceNum = Number(editForm.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setEditError("Please enter a valid price.");
      return;
    }
    let origNum: number | undefined;
    if (editForm.originalPrice.trim()) {
      origNum = Number(editForm.originalPrice);
      if (isNaN(origNum) || origNum < 0) {
        setEditError("Original price must be a valid positive number.");
        return;
      }
    }
    if (!editForm.condition) {
      setEditError("Please select item condition.");
      return;
    }
    if (!editForm.location) {
      setEditError("Please select campus location.");
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/products/${editingListing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category,
          price: priceNum,
          originalPrice: origNum !== undefined ? origNum : null,
          condition: editForm.condition,
          location: editForm.location,
          isAvailable: editForm.isAvailable,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update listing.");
      }

      setListings((prev) =>
        prev.map((item) =>
          item._id === editingListing._id ? { ...item, ...data.product } : item
        )
      );

      closeEditModal();
      setFeedback({
        type: "success",
        message: "Listing updated successfully.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update listing.";
      setEditError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete Listing Actions                                             */
  /* ------------------------------------------------------------------ */
  const openDeleteModal = (listing: Listing) => {
    setDeletingListing(listing);
  };

  const closeDeleteModal = () => {
    setDeletingListing(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${deletingListing._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete listing.");
      }

      setListings((prev) =>
        prev.filter((item) => item._id !== deletingListing._id)
      );
      closeDeleteModal();
      setFeedback({
        type: "success",
        message: `"${deletingListing.title}" was deleted.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete listing.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Filter calculations                                                */
  /* ------------------------------------------------------------------ */
  const activeCount = listings.filter((l) => l.isAvailable).length;
  const soldCount = listings.filter((l) => !l.isAvailable).length;

  const filteredListings = listings.filter((listing) => {
    if (filterTab === "active") return listing.isAvailable;
    if (filterTab === "sold") return !listing.isAvailable;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="text-xs text-[#777777] hover:text-[#171717] transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
              My Listings
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] mt-1">
              Manage, edit, or remove your campus items listed for sale.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-xs w-full sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            List New Item
          </Link>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            role="alert"
            className={`flex items-center justify-between gap-2 px-4 py-3 rounded-md text-sm border transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-emerald-600 shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-red-600 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs hover:opacity-75 p-1"
              aria-label="Dismiss feedback"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Summary & Filter Tabs */}
        {!loading && !error && listings.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6 text-xs sm:text-sm">
              <div>
                <span className="text-[#777777] block text-[11px] uppercase tracking-wider">
                  Total Listings
                </span>
                <span className="font-bold text-[#171717] text-lg">
                  {listings.length}
                </span>
              </div>
              <div className="h-8 w-px bg-[#E5E5E5]" aria-hidden="true" />
              <div>
                <span className="text-emerald-700 block text-[11px] uppercase tracking-wider font-medium">
                  Active
                </span>
                <span className="font-bold text-emerald-700 text-lg">
                  {activeCount}
                </span>
              </div>
              <div className="h-8 w-px bg-[#E5E5E5]" aria-hidden="true" />
              <div>
                <span className="text-[#777777] block text-[11px] uppercase tracking-wider">
                  Sold
                </span>
                <span className="font-bold text-[#777777] text-lg">
                  {soldCount}
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-lg border border-[#E5E5E5] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterTab === "all"
                    ? "bg-white text-[#171717] shadow-xs"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                All ({listings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterTab === "active"
                    ? "bg-white text-[#171717] shadow-xs"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("sold")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterTab === "sold"
                    ? "bg-white text-[#171717] shadow-xs"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                Sold ({soldCount})
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square bg-[#EEEEEE] rounded-lg w-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#EEEEEE] rounded w-3/4" />
                  <div className="h-4 bg-[#EEEEEE] rounded w-1/3" />
                </div>
                <div className="h-9 bg-[#EEEEEE] rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#171717]">
              Failed to Load Listings
            </h2>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">{error}</p>
            <button
              onClick={reloadListings}
              className="px-4 py-2 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State (No listings at all) */}
        {!loading && !error && listings.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-[#F5F5F5] text-[#777777] rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-7 h-7"
              >
                <path d="M21 8v13H3V8" />
                <path d="M1 3h22v5H1z" />
                <path d="M10 12h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#171717]">
              No Listings Created Yet
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
              You haven&apos;t listed any items for sale yet. Turn your unused
              books, electronics, cycles, or dorm furniture into cash today.
            </p>
            <div className="pt-2">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Your First Listing
              </Link>
            </div>
          </div>
        )}

        {/* Empty Tab State (e.g. No sold items) */}
        {!loading &&
          !error &&
          listings.length > 0 &&
          filteredListings.length === 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-3 shadow-xs">
              <p className="text-sm text-[#777777]">
                No {filterTab} listings found.
              </p>
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className="text-xs text-[#171717] font-semibold underline underline-offset-2"
              >
                View all listings
              </button>
            </div>
          )}

        {/* Listings Grid */}
        {!loading && !error && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs hover:border-[#171717]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-square w-full bg-[#F1F1F1] overflow-hidden">
                    <Image
                      src={listing.imageUrl || listing.images?.[0] || ""}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-4"
                    />

                    {/* Condition badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${conditionBadgeClass(
                          listing.condition
                        )}`}
                      >
                        {listing.condition}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          listing.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border-neutral-300"
                        }`}
                      >
                        {listing.isAvailable ? "Active" : "Sold"}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#777777]">
                      <span className="uppercase tracking-wider font-medium truncate">
                        {listing.category}
                      </span>
                      <span className="shrink-0">
                        {new Date(listing.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>

                    <Link
                      href={`/products/${listing._id}`}
                      className="block group"
                    >
                      <h3 className="text-sm font-semibold text-[#171717] line-clamp-2 leading-snug group-hover:underline">
                        {listing.title}
                      </h3>
                    </Link>

                    {/* Price row */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#171717]">
                        ₹{listing.price.toLocaleString("en-IN")}
                      </span>
                      {listing.originalPrice && (
                        <span className="text-xs text-[#777777] line-through">
                          ₹{listing.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <p className="text-xs text-[#777777] flex items-center gap-1 truncate">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-3.5 h-3.5 shrink-0"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {listing.location}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 pt-0 border-t border-[#E5E5E5] mt-2 grid grid-cols-3 gap-2 text-xs">
                  {/* Toggle Status */}
                  <button
                    type="button"
                    disabled={actionLoadingId === listing._id}
                    onClick={() => handleToggleStatus(listing)}
                    className={`py-2 px-2.5 font-medium rounded-md border text-center transition-colors truncate ${
                      listing.isAvailable
                        ? "border-[#E5E5E5] text-[#777777] hover:text-[#171717] hover:bg-[#F5F5F5]"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {actionLoadingId === listing._id
                      ? "Saving…"
                      : listing.isAvailable
                      ? "Mark Sold"
                      : "Mark Active"}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(listing)}
                    className="py-2 px-2.5 font-medium rounded-md border border-[#E5E5E5] text-[#171717] hover:bg-[#F5F5F5] text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => openDeleteModal(listing)}
                    className="py-2 px-2.5 font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          EDIT LISTING MODAL
      ============================================================ */}
      {editingListing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h2
                id="edit-modal-title"
                className="text-lg font-bold text-[#171717]"
              >
                Edit Listing
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-[#777777] hover:text-[#171717] p-1 text-sm font-semibold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                >
                  Item Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  maxLength={120}
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-category"
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-condition"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-condition"
                    required
                    value={editForm.condition}
                    onChange={(e) =>
                      setEditForm({ ...editForm, condition: e.target.value })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-price"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-price"
                    type="number"
                    min="0"
                    required
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-originalPrice"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Original Price (₹){" "}
                    <span className="text-[#777777] font-normal normal-case">
                      optional
                    </span>
                  </label>
                  <input
                    id="edit-originalPrice"
                    type="number"
                    min="0"
                    value={editForm.originalPrice}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        originalPrice: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-location"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Campus Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-location"
                    required
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-status"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                  >
                    Listing Status
                  </label>
                  <select
                    id="edit-status"
                    value={editForm.isAvailable ? "active" : "sold"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        isAvailable: e.target.value === "active",
                      })
                    }
                    className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="active">Active (Available for sale)</option>
                    <option value="sold">Sold (Mark as completed)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  maxLength={3000}
                  className="w-full bg-white border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-xs font-semibold text-[#777777] hover:text-[#171717] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Saving Changes…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          DELETE CONFIRMATION MODAL
      ============================================================ */}
      {deletingListing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-[#E5E5E5] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-bold text-[#171717]"
              >
                Delete this listing?
              </h2>
              <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
                Are you sure you want to delete &ldquo;
                <span className="font-medium text-[#171717]">
                  {deletingListing.title}
                </span>
                &rdquo;? This action cannot be undone and will permanently remove
                the item from SecondCart.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-[#777777] hover:text-[#171717] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  "Delete Listing"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
