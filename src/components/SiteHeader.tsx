"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => setIsLoggedIn(response.ok))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setIsLoggedIn(false);
      });

    return () => controller.abort();
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="siteHeader">
      <Link href="/" className="brand" onClick={closeMobileMenu}>
        <Image
          className="siteBrandMark"
          src="/ieee-society-logo.png"
          alt="IEEE CS Society Superior University"
          width={310}
          height={70}
          priority
        />
      </Link>

      <button
        type="button"
        className="mobileNavToggle"
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        {mobileMenuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
      </button>

      <button
        type="button"
        className={`mobileNavBackdrop${mobileMenuOpen ? " open" : ""}`}
        aria-label="Close navigation menu"
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={closeMobileMenu}
      />

      <nav
        id="primary-navigation"
        className={`siteNav${mobileMenuOpen ? " open" : ""}`}
        aria-label="Primary navigation"
      >
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              className={`siteNavLink siteNavPrimary${active ? " active" : ""}`}
              href={item.href}
              key={item.href}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          );
        })}
        <Link className="siteNavLink siteLoginLink" href="/login" onClick={closeMobileMenu}>
          {isLoggedIn ? "Dashboard" : "Login"}
        </Link>
        <Link
          className={`siteVerifyLink${pathname.startsWith("/verify") ? " active" : ""}`}
          href="/verify"
          onClick={closeMobileMenu}
        >
          Verify Certificate
        </Link>
      </nav>
    </header>
  );
}
