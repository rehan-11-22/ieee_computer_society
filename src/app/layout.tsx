import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { getCurrentSession } from "@/lib/auth";
import { Mail, MapPin } from "lucide-react";
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
        <div className="footerBrand">
          <Link className="footerBrandLogo" href="/">
            <Image src="/images/ieee-neural-mark.png" alt="IEEE Society Superior University" width={310} height={110} />
          </Link>
          <p>Learn&nbsp; | &nbsp;Connect&nbsp; | &nbsp;Build the Future</p>
        </div>
        <div className="footerColumn">
          <strong>Quick Links</strong>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/events">Events</Link>
          <Link href="/team">Our Team</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/verify">Verify Certificate</Link>
        </div>
        <div className="footerColumn footerContact">
          <strong>Contact</strong>
          <span><MapPin size={15} /> Superior University, Lahore</span>
          <a href="mailto:ieeecs@superior.edu.pk"><Mail size={15} /> ieeecs@superior.edu.pk</a>
        </div>
      </div>
      <div className="footerBottom">
        <span>© {new Date().getFullYear()} IEEE CS Superior University. All rights reserved.</span>
        <span>Privacy Policy&nbsp;&nbsp; | &nbsp;&nbsp;Terms &amp; Conditions</span>
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
