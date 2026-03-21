import React from "react";
import Link from "next/link";

export function Topbar() {
  return (
    <div className="flex items-center justify-center py-2 px-4 bg-dash-dark text-white text-[12px] font-medium gap-3 shrink-0 font-inter">
      Unlock smart routing, QR studio, and custom themes.
      <Link
        href="#"
        className="text-dash-gold bg-dash-gold/15 py-[3px] px-3 rounded-full text-[11px] font-semibold no-underline"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
