"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Name */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-bold tracking-tight text-[#171717]">
              SecondCart
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Main Navigation"
        >
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-[#171717] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8A8A72]"
          >
            Explore
          </Link>

          <Link
            href="/categories"
            className="text-xs sm:text-sm font-medium text-[#777777] hover:text-[#171717] transition-colors py-1"
          >
            Categories
          </Link>

          <Link
            href="/how-it-works"
            className="text-xs sm:text-sm font-medium text-[#777777] hover:text-[#171717] transition-colors py-1"
          >
            How It Works
          </Link>
        </nav>

        {/* Right: Actions (Login/User & Black Sell CTA) */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-semibold select-none">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-xs font-medium text-[#171717] max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs font-medium text-[#777777] hover:text-[#171717] transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[#777777] hover:text-[#171717] transition-colors"
            >
              Login
            </Link>
          )}

          <Link
            href="/sell"
            className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#171717] hover:bg-black rounded-md transition-colors"
          >
            Sell an Item
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-[#171717] rounded-md"
          >
            Sell
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="p-2 rounded-md text-[#171717] hover:bg-[#F5F5F5] transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white border-b border-[#E5E5E5] md:hidden flex flex-col justify-between p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-sm font-semibold text-[#171717] bg-[#F5F5F5] rounded-md"
              >
                Explore
              </Link>
              <Link
                href="/categories"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-[#777777] hover:text-[#171717] hover:bg-[#F5F5F5] rounded-md"
              >
                Categories
              </Link>
              <Link
                href="/how-it-works"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-[#777777] hover:text-[#171717] hover:bg-[#F5F5F5] rounded-md"
              >
                How It Works
              </Link>
            </nav>
          </div>

          <div className="border-t border-[#E5E5E5] pt-6 space-y-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F5F5F5] rounded-md">
                  <span className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-semibold select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#171717] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#777777] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex w-full items-center justify-center py-2.5 px-4 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex w-full items-center justify-center py-2.5 px-4 text-xs font-medium text-[#171717] border border-[#E5E5E5] rounded-md"
              >
                Login
              </Link>
            )}

            <Link
              href="/sell"
              onClick={closeMenu}
              className="flex w-full items-center justify-center py-2.5 px-4 text-xs font-medium text-white bg-[#171717] rounded-md"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
