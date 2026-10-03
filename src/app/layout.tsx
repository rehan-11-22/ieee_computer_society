import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "IEECS Certificate Verification Portal",
  description: "Official Certificate Verification Portal for IEEE Computer Society Superior University Student Branch",
};

import { ConditionalLayout } from "../components/ConditionalLayout";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = !!(await getCurrentSession());

  const header = (
    <header>
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <div className="brandLogo">CS</div>
        <div>
          <strong>IEEE Computer Society</strong>
          <span>Superior University Student Branch</span>
        </div>
      </Link>
      <nav>
        {isLoggedIn ? (
          <Link href="/login">
            <button>Dashboard</button>
          </Link>
        ) : (
          <Link href="/login">
            <button>Login</button>
          </Link>
        )}
        <Link href="/#verify">
          <button style={{ background: "var(--blue)", color: "white" }}>Verify</button>
        </Link>
      </nav>
    </header>
  );

  const footer = (
    <footer>
      <div className="footerTop">
        <div className="footerBrand">
          <strong>IEEE Computer Society</strong>
          <span>Superior University Student Branch</span>
        </div>
        <div className="footerLinks">
          <Link href="/">Home</Link>
          <a href="#verify">Verify</a>
          <a href="https://www.ieee.org" target="_blank" rel="noopener noreferrer">IEEE.org</a>
        </div>
      </div>
      <div className="footerBottom">
        <span>© {new Date().getFullYear()} IEEE CS Superior University. All rights reserved.</span>
        <span>Credential-based verification • Link Only</span>
      </div>
    </footer>
  );

  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} antialiased`}>
        <ConditionalLayout header={header} footer={footer}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
