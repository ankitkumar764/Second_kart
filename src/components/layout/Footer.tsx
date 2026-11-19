import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E5E5] bg-white text-[#171717] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E5E5E5]">
          {/* Brand & Tagline */}
          <div className="space-y-1">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold tracking-tight text-[#171717]">
                SecondCart
              </span>
            </Link>
            <p className="text-xs text-[#777777]">
              Buy. Sell. Reuse. Repeat.
            </p>
          </div>

          {/* Useful Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#777777]">
            <Link href="/" className="hover:text-[#171717] transition-colors">
              Explore
            </Link>
            <Link href="/categories" className="hover:text-[#171717] transition-colors">
              Categories
            </Link>
            <Link href="/how-it-works" className="hover:text-[#171717] transition-colors">
              How It Works
            </Link>
            <Link href="/sell" className="hover:text-[#171717] transition-colors">
              Sell an Item
            </Link>
            <span className="hidden sm:inline text-[#E5E5E5]">•</span>
            <Link href="/login" className="hover:text-[#171717] transition-colors">
              Login
            </Link>
            <Link href="/privacy" className="hover:text-[#171717] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#171717] transition-colors">
              Terms
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777777]">
          <p>© {new Date().getFullYear()} SecondCart. All rights reserved.</p>
          <p className="text-xs text-[#777777]">
            Student-to-student marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}
