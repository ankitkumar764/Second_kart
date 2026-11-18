"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Prepared for routing to search results: /explore?q=...
      console.log("Search query:", searchQuery);
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-primary/40 rounded-sm"
          >
            {/* Custom Shopping Bag / Cart Emblem */}
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
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
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                Second<span className="text-primary">Cart</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium tracking-wider text-muted uppercase mt-0.5">
                Buy. Sell. Reuse. Repeat.
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <label htmlFor="desktop-search" className="sr-only">
              Search products
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              id="desktop-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, electronics, fashion..."
              className="w-full h-10 pl-9 pr-4 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main Navigation"
        >
          <Link
            href="/explore"
            className="px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md hover:bg-background"
          >
            Explore
          </Link>
          <Link
            href="/categories"
            className="px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md hover:bg-background"
          >
            Categories
          </Link>
          <Link
            href="/how-it-works"
            className="px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md hover:bg-background"
          >
            How It Works
          </Link>
        </nav>

        {/* Action Buttons (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3.5 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-background"
          >
            Login
          </Link>
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
            <span>Sell an Item</span>
          </Link>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center p-2 text-primary-foreground bg-primary rounded-md shadow-xs"
            aria-label="Sell an Item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-background border border-border transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/40"
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

      {/* Collapsible Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-surface/98 backdrop-blur-lg border-b border-border sm:hidden flex flex-col justify-between p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="space-y-4">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                id="mobile-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, electronics, fashion..."
                className="w-full h-11 pl-9 pr-4 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-1 pt-2" aria-label="Mobile Links">
              <Link
                href="/explore"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-base font-medium text-foreground rounded-md hover:bg-background transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/categories"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-base font-medium text-foreground rounded-md hover:bg-background transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/how-it-works"
                onClick={closeMenu}
                className="flex items-center px-3 py-2.5 text-base font-medium text-foreground rounded-md hover:bg-background transition-colors"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Mobile Footer Actions & Tagline */}
          <div className="border-t border-border pt-4 mt-6 space-y-3">
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex w-full items-center justify-center py-2.5 px-4 text-sm font-medium text-foreground border border-border rounded-md hover:bg-background transition-colors"
            >
              Login
            </Link>
            <Link
              href="/sell"
              onClick={closeMenu}
              className="flex w-full items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-xs transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 5v14m-7-7h14" />
              </svg>
              <span>Sell an Item</span>
            </Link>

            <p className="text-center text-xs text-muted pt-2">
              Buy. Sell. Reuse. Repeat.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
