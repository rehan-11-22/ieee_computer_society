"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  return (
    <header className="siteHeader">
      <Link href="/" className="brand">
        <Image
          className="siteBrandMark"
          src="/icon.png"
          alt="IEEE Society emblem"
          width={52}
          height={52}
          priority
        />
        <span className="siteBrandText">
          <strong>IEEE Society</strong>
          <span>Superior University</span>
        </span>
      </Link>

      <nav className="siteNav" aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              className={`siteNavLink siteNavPrimary${active ? " active" : ""}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
        <Link className="siteNavLink siteLoginLink" href="/login">
          {isLoggedIn ? "Dashboard" : "Login"}
        </Link>
        <Link className={`siteVerifyLink${pathname.startsWith("/verify") ? " active" : ""}`} href="/verify">
          Verify Certificate
        </Link>
      </nav>
    </header>
  );
}
