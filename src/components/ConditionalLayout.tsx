"use client";
import { usePathname } from "next/navigation";

export function ConditionalLayout({
  children,
  header,
  footer,
  banner,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  banner?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/login");

  return (
    <>
      {!isAdminPage && header}
      <main>{children}</main>
      {!isAdminPage && banner}
      {!isAdminPage && footer}
    </>
  );
}
