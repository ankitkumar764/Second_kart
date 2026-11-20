import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SAMPLE_PRODUCTS } from "@/lib/data/products";
import WishlistButton from "@/components/products/WishlistButton";
import { connectDB } from "@/lib/mongodb";
import ProductModel, { IProduct } from "@/models/Product";

/* ------------------------------------------------------------------ */
/*  Dynamic rendering — supports both static sample & DB products       */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

function conditionColor(condition: string): string {
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

function discount(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/* ------------------------------------------------------------------ */
/*  Unified product shape used in this page                             */
/* ------------------------------------------------------------------ */

interface PageProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: string;
  category: string;
  location: string;
  imageUrl: string;
  images?: string[];
  sellerName?: string;
  sellerCampus?: string;
  isVerifiedSeller?: boolean;
  isWishlisted?: boolean;
  postedAt?: string;
}

function dbToPage(doc: IProduct): PageProduct {
  return {
    id: (doc._id as { toString(): string }).toString(),
    name: doc.title,
    description: doc.description,
    price: doc.price,
    originalPrice: doc.originalPrice,
    condition: doc.condition,
    category: doc.category,
    location: doc.location,
    imageUrl: doc.imageUrl || doc.images?.[0] || "",
    images: doc.images,
    sellerName: doc.sellerName,
    sellerCampus: doc.sellerCampus,
    isVerifiedSeller: doc.isVerifiedSeller,
    isWishlisted: false,
    postedAt: new Date(doc.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try sample products first
  const sample = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (sample) {
    return {
      title: `${sample.name} | SecondCart`,
      description: sample.description,
    };
  }

  // Try MongoDB
  try {
    await connectDB();
    const doc = await ProductModel.findById(id).lean<IProduct>();
    if (doc) {
      return {
        title: `${doc.title} | SecondCart`,
        description: doc.description,
      };
    }
  } catch {
    // ignore
  }

  return { title: "Product Not Found | SecondCart" };
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                       */
/* ------------------------------------------------------------------ */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: PageProduct | null = null;
  let relatedFromDB: PageProduct[] = [];

  // 1. Check sample products
  const sampleMatch = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (sampleMatch) {
    product = sampleMatch as unknown as PageProduct;
  } else {
    // 2. Query MongoDB
    try {
      await connectDB();
      const doc = await ProductModel.findById(id).lean<IProduct>();
      if (doc) {
        product = dbToPage(doc);
        // Fetch related from DB (same category, exclude current)
        const relDocs = await ProductModel.find({
          category: doc.category,
          _id: { $ne: doc._id },
          isAvailable: true,
        })
          .limit(4)
          .lean<IProduct[]>();
        relatedFromDB = relDocs.map(dbToPage);
      }
    } catch (err) {
      console.error("DB lookup error:", err);
    }
  }

  if (!product) notFound();

  /* Related products from same source */
  const related: PageProduct[] =
    relatedFromDB.length > 0
      ? relatedFromDB
      : (SAMPLE_PRODUCTS.filter(
          (p) =>
            p.category === (product as PageProduct).category &&
            p.id !== (product as PageProduct).id
        ).slice(0, 4) as unknown as PageProduct[]);

  const discountPct =
    product.originalPrice
      ? discount(product.price, product.originalPrice)
      : 0;

  const initials = (product.sellerName ?? "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      {/* ---- Breadcrumb ---- */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-[#777777] flex-wrap">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#171717] transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3 h-3"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </li>
              <li>
                <span className="text-[#777777]">{product.category}</span>
              </li>
              <li aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3 h-3"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </li>
              <li>
                <span className="text-[#171717] font-medium line-clamp-1 max-w-[200px] sm:max-w-xs">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ---- Main Content ---- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ============================================================
              LEFT: Product Image
          ============================================================ */}
          <div className="space-y-3">
            {/* Primary Image */}
            <div className="relative aspect-square w-full bg-[#F1F1F1] rounded-xl overflow-hidden border border-[#E5E5E5]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
              {/* Condition badge overlay */}
              <div className="absolute top-4 left-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${conditionColor(product.condition)}`}
                >
                  {product.condition}
                </span>
              </div>
              {product.isVerifiedSeller && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Additional image thumbnails (if from DB with multiple images) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 shrink-0 rounded-lg border border-[#E5E5E5] bg-[#F1F1F1] overflow-hidden"
                  >
                    <Image
                      src={img}
                      alt={`${product!.name} image ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================
              RIGHT: Product Details
          ============================================================ */}
          <div className="space-y-6">
            {/* Category + Posted */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#777777] uppercase tracking-wider">
                {product.category}
              </span>
              {product.postedAt && (
                <span className="flex items-center gap-1 text-xs text-[#777777]">
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {product.postedAt}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#171717] leading-snug">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-[#171717]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[#777777] line-through font-normal">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <hr className="border-[#E5E5E5]" />

            {/* Key Details */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs text-[#777777] uppercase tracking-wider font-medium mb-1">
                  Condition
                </dt>
                <dd>
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${conditionColor(product.condition)}`}
                  >
                    {product.condition}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#777777] uppercase tracking-wider font-medium mb-1">
                  Location
                </dt>
                <dd className="flex items-center gap-1 text-[#171717] font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 text-[#777777] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {product.location}
                </dd>
              </div>
            </dl>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs text-[#777777] uppercase tracking-wider font-medium">
                Description
              </h2>
              <p className="text-sm text-[#171717] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-[#E5E5E5]" />

            {/* Seller Info Card */}
            <div className="bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] p-4 flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full bg-[#171717] text-white flex items-center justify-center text-sm font-semibold shrink-0 select-none"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#171717]">
                    {product.sellerName ?? "Student Seller"}
                  </span>
                  {product.isVerifiedSeller && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3 h-3"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#777777] mt-0.5 truncate">
                  {product.sellerCampus ?? product.location}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary: Contact Seller */}
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-[#171717] hover:bg-black text-white text-sm font-medium px-6 py-3 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#171717]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Contact Seller
              </button>

              {/* Secondary: Wishlist (client component) */}
              <WishlistButton
                productId={product.id}
                initialState={Boolean(product.isWishlisted)}
              />
            </div>

            {/* Safety note */}
            <p className="text-xs text-[#777777] flex items-start gap-1.5 leading-relaxed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#8A8A72]"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Meet in a public campus location. Never transfer money before
              inspecting the item in person.
            </p>
          </div>
        </div>

        {/* ---- Related Products ---- */}
        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="related-heading">
            <div className="flex items-center justify-between mb-5">
              <h2
                id="related-heading"
                className="text-lg font-semibold text-[#171717]"
              >
                More in {product.category}
              </h2>
              <Link
                href="/"
                className="text-sm text-[#777777] hover:text-[#171717] transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((rel) => (
                <RelatedCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Related Card (Server Component — no state needed)                   */
/* ------------------------------------------------------------------ */

function RelatedCard({ product }: { product: PageProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:border-[#171717]/30 transition-all duration-200"
    >
      <div className="relative aspect-square w-full bg-[#F1F1F1] overflow-hidden flex items-center justify-center">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs text-[#777777] uppercase tracking-wider font-medium truncate">
          {product.condition}
        </p>
        <h3 className="text-sm font-medium text-[#171717] line-clamp-2 leading-snug group-hover:text-black">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-[#171717] pt-1">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
