"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, ChangeEvent, DragEvent } from "react";
import {
  CATEGORIES_LIST,
  CONDITIONS_LIST,
  LOCATIONS_LIST,
} from "@/lib/data/products";

/* ------------------------------------------------------------------ */
/*  Types                                                                */
/* ------------------------------------------------------------------ */

interface FormState {
  title: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string;
  condition: string;
  location: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  originalPrice: "",
  condition: "",
  location: "",
};

/* ------------------------------------------------------------------ */
/*  SellPage                                                             */
/* ------------------------------------------------------------------ */

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();

  const categories = CATEGORIES_LIST.filter((c) => c !== "All");
  const conditions = CONDITIONS_LIST.filter((c) => c !== "All");
  const locations = LOCATIONS_LIST.filter((c) => c !== "All");

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- Field change ---- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  /* ---- Image selection ---- */
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setImageFiles((prev) => {
      const combined = [...prev, ...arr].slice(0, 5); // max 5 images
      return combined;
    });
    setImagePreviews((prev) => {
      const newPreviews = arr.map((f) => URL.createObjectURL(f));
      return [...prev, ...newPreviews].slice(0, 5);
    });
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---- Client-side validation ---- */
  const validate = (): string | null => {
    if (!form.title.trim() || form.title.trim().length < 3)
      return "Title must be at least 3 characters.";
    if (form.title.trim().length > 120)
      return "Title cannot exceed 120 characters.";
    if (!form.description.trim() || form.description.trim().length < 10)
      return "Description must be at least 10 characters.";
    if (!form.category) return "Please select a category.";
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price < 0)
      return "Please enter a valid price.";
    if (form.originalPrice) {
      const op = Number(form.originalPrice);
      if (isNaN(op) || op < 0)
        return "Original price must be a valid positive number.";
    }
    if (!form.condition) return "Please select the item condition.";
    if (!form.location) return "Please select a campus location.";
    if (imageFiles.length === 0) return "Please add at least one product photo.";
    return null;
  };

  /* ---- Upload single file → URL ---- */
  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Image upload failed.");
    return data.url as string;
  };

  /* ---- Form submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // 1. Upload all images sequentially
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      // 2. Create product listing
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          condition: form.condition,
          images: uploadedUrls,
          location: form.location,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to create listing. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Redirect to the new product page
      router.push(`/products/${data.product.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setLoading(false);
    }
  };

  /* ================================================================== */
  /*  Render                                                              */
  /* ================================================================== */

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs text-[#777777] hover:text-[#171717] transition-colors inline-flex items-center gap-1 mb-4"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            List an Item for Sale
          </h1>
          <p className="text-sm text-[#777777] mt-1">
            Reach students across your campus quickly and safely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          {/* Authenticated Seller Badge */}
          <div className="bg-[#F5F5F5] rounded-lg p-3.5 border border-[#E5E5E5] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#777777]">Posting as</p>
              <p className="text-sm font-semibold text-[#171717]">
                {user?.name || "Student Seller"}
              </p>
            </div>
            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ---- Title ---- */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
            >
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              maxLength={120}
              placeholder="e.g. Casio FX-991CW Scientific Calculator"
              className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#171717] transition-colors"
            />
            <p className="text-xs text-[#AAAAAA] mt-1 text-right">
              {form.title.length}/120
            </p>
          </div>

          {/* ---- Category & Condition ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Select condition
                </option>
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ---- Price & Original Price ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 850"
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#171717] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="originalPrice"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
              >
                Original Price (₹){" "}
                <span className="text-[#AAAAAA] font-normal normal-case tracking-normal">
                  optional
                </span>
              </label>
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#171717] transition-colors"
              />
              <p className="text-xs text-[#AAAAAA] mt-1">
                Shows discount if set
              </p>
            </div>
          </div>

          {/* ---- Location ---- */}
          <div>
            <label
              htmlFor="location"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
            >
              Campus Location <span className="text-red-500">*</span>
            </label>
            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Select campus location
              </option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* ---- Description ---- */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              maxLength={3000}
              placeholder="Describe condition, reason for selling, any included accessories..."
              className="w-full bg-white border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#171717] transition-colors resize-none"
            />
            <p className="text-xs text-[#AAAAAA] mt-1 text-right">
              {form.description.length}/3000
            </p>
          </div>

          {/* ---- Image Upload ---- */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-2">
              Product Photos <span className="text-red-500">*</span>
              <span className="text-[#AAAAAA] font-normal normal-case tracking-normal ml-1">
                (up to 5, max 5MB each)
              </span>
            </label>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload product photos"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#171717] bg-[#F5F5F5]"
                  : "border-[#E5E5E5] hover:border-[#AAAAAA]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-8 h-8 mx-auto text-[#AAAAAA] mb-2"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <p className="text-sm text-[#777777]">
                <span className="font-medium text-[#171717]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-[#AAAAAA] mt-1">
                JPEG, PNG, WebP up to 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-[#E5E5E5]"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 text-[9px] font-medium bg-[#171717] text-white px-1 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      aria-label={`Remove image ${idx + 1}`}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-[#E5E5E5] hover:border-[#AAAAAA] flex items-center justify-center transition-colors text-[#AAAAAA] hover:text-[#777777]"
                    aria-label="Add more images"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ---- Submit ---- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#171717] hover:bg-black text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Uploading &amp; Publishing…
              </>
            ) : (
              "Post Item for Sale"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
