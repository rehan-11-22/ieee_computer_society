import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { getCurrentSession } from "@/lib/auth";
import { Mail, MapPin, ShieldCheck, ChevronRight, Award } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});
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

  const header = <SiteHeader isLoggedIn={isLoggedIn} />;

  const footer = (
    <footer className="siteFooter">
      <div className="siteFooterMain">
        {/* Brand Column */}
        <div className="footerBrand">
          <Link className="footerBrandLogo" href="/">
            <Image
              src="/ieee-society-logo-white-text.png"
              alt="IEEE Society Superior University"
              width={250}
              height={85}
              priority
            />
          </Link>
          <p className="footerTagline">
            Advancing Technology for Humanity. Empowering students with hands-on technical skills, industry mentorship, and leadership excellence at Superior University.
          </p>
          <div className="footerSocials">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="footerSocialBtn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="footerSocialBtn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="footerSocialBtn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="mailto:ieeecs@superior.edu.pk"
              aria-label="Email IEEE CS"
              className="footerSocialBtn"
            >
              <Mail size={15} />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footerColumn">
          <strong className="footerColumnTitle">Explore</strong>
          <Link href="/" className="footerLink"><ChevronRight size={13} /> Home</Link>
          <Link href="/about" className="footerLink"><ChevronRight size={13} /> About Society</Link>
          <Link href="/events" className="footerLink"><ChevronRight size={13} /> Events &amp; Sessions</Link>
          <Link href="/team" className="footerLink"><ChevronRight size={13} /> Executive Team</Link>
          <Link href="/contact" className="footerLink"><ChevronRight size={13} /> Contact Us</Link>
        </div>

        {/* Column 3: Verification & Portal */}
        <div className="footerColumn">
          <strong className="footerColumnTitle">Certificate Portal</strong>
          <Link href="/verify" className="footerLink footerVerifyHighlight">
            <ShieldCheck size={14} /> Verify Certificate
            <span className="footerPillLive">Live</span>
          </Link>
          <Link href="/about" className="footerLink"><ChevronRight size={13} /> Society Mission</Link>
          <Link href="/events" className="footerLink"><ChevronRight size={13} /> Upcoming Workshops</Link>
          <Link href="/login" className="footerLink"><ChevronRight size={13} /> Officer Sign In</Link>
        </div>

        {/* Column 4: Contact & Chapter Details */}
        <div className="footerColumn footerContactCol">
          <strong className="footerColumnTitle">Chapter Headquarters</strong>
          <div className="footerContactItem">
            <MapPin size={15} className="footerIconAccent" />
            <div>
              <strong>Superior University</strong>
              <span>Main Campus, Raiwind Road, Lahore</span>
            </div>
          </div>
          <div className="footerContactItem">
            <Mail size={15} className="footerIconAccent" />
            <div>
              <a href="mailto:ieeecs@superior.edu.pk">ieeecs@superior.edu.pk</a>
              <span>Student Inquiries &amp; Collaborations</span>
            </div>
          </div>
          <div className="footerAffiliationBadge">
            <Award size={15} className="badgeIcon" />
            <div>
              <span className="badgeTitle">IEEE Computer Society</span>
              <small>Lahore Section &bull; Region 10</small>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footerBottom">
        <div className="footerBottomLeft">
          <span>&copy; {new Date().getFullYear()} IEEE Computer Society Superior University Chapter. All rights reserved.</span>
          <span className="footerBottomDivider">&bull;</span>
          <span className="footerMotto">Advancing Technology for Humanity</span>
        </div>
        <div className="footerBottomRight">
          <Link href="/about">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="/about">Terms of Service</Link>
          <span>&bull;</span>
          <Link href="/verify">Portal Security</Link>
        </div>
      </div>
    </footer>
  );

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${playfair.variable} antialiased`}>
        <ConditionalLayout header={header} footer={footer}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
