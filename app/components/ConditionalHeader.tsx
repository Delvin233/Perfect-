"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on home page (where arcade menu is)
  if (pathname === "/") {
    return null;
  }

  // Show header on all other pages
  return <Header />;
}
