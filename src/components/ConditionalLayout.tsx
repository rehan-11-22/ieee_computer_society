"use client";
import { usePathname } from "next/navigation";

export function ConditionalLayout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/login");

  return (
    <>
      {!isAdminPage && header}
      <main>{children}</main>
      {!isAdminPage && footer}
    </>
  );
}
