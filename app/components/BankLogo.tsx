"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Landmark, CreditCard, Coins } from "lucide-react";

interface BankLogoProps {
  customLogo?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  type?: string | null;
  size?: number;
  className?: string;
}

export function getBankSlug(bankName?: string | null, accountName?: string | null, type?: string | null): string | null {
  const combined = `${bankName || ""} ${accountName || ""} ${type || ""}`.toLowerCase();

  if (combined.includes("bca digital") || combined.includes("blu")) return "blu";
  if (combined.includes("bca")) return "bca";
  if (combined.includes("mandiri")) return "mandiri";
  if (combined.includes("bri")) return "bri";
  if (combined.includes("bni")) return "bni";
  if (combined.includes("bsi") || combined.includes("syariah")) return "bsi";
  if (combined.includes("jago")) return "jago";
  if (combined.includes("seabank") || combined.includes("sea bank")) return "seabank";
  if (combined.includes("cimb") || combined.includes("niaga")) return "cimb";
  if (combined.includes("permata")) return "permata";
  if (combined.includes("danamon")) return "danamon";
  if (combined.includes("jenius") || combined.includes("btpn")) return "jenius";
  if (combined.includes("ocbc") || combined.includes("nisp")) return "ocbc";
  if (combined.includes("gopay") || combined.includes("go-pay") || combined.includes("gojek")) return "gopay";
  if (combined.includes("ovo")) return "ovo";
  if (combined.includes("dana")) return "dana";
  if (combined.includes("shopee") || combined.includes("spay")) return "shopeepay";
  if (combined.includes("linkaja") || combined.includes("link aja")) return "linkaja";
  if (combined.includes("chase") || combined.includes("jpmorgan")) return "chase";
  if (combined.includes("bank of america") || combined.includes("bofa")) return "bofa";
  if (combined.includes("wells") || combined.includes("fargo")) return "wellsfargo";
  if (combined.includes("citi") || combined.includes("citibank")) return "citi";
  if (combined.includes("paypal")) return "paypal";
  if (combined.includes("wise") || combined.includes("transferwise")) return "wise";
  if (combined.includes("stripe")) return "stripe";
  if (combined.includes("revolut")) return "revolut";
  if (combined.includes("crypto") || combined.includes("usdt") || combined.includes("btc") || combined.includes("bitcoin")) return "crypto";
  if (combined.includes("cash") || combined.includes("tunai") || combined.includes("brankas") || type === "cash") return "cash";

  return null;
}

export default function BankLogo({
  customLogo,
  bankName,
  accountName,
  type,
  size = 40,
  className = "",
}: BankLogoProps) {
  const [hasError, setHasError] = useState(false);
  const slug = getBankSlug(bankName, accountName, type);

  // If custom uploaded logo is available
  if (customLogo) {
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden shadow-2xs border border-default-200/80 dark:border-default-700/80 bg-white dark:bg-gray-900 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={customLogo}
          alt={accountName || "Custom Logo"}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    );
  }

  if (slug && !hasError) {
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden shadow-2xs transition-transform duration-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={`/assets/images/banks/${slug}.svg`}
          alt={bankName || accountName || "Bank Logo"}
          width={size}
          height={size}
          className="w-full h-full object-cover select-none pointer-events-none"
          onError={() => setHasError(true)}
          unoptimized
        />
      </div>
    );
  }

  // Fallback to stylized vector badge
  const isBank = type === "bank";
  const isEwallet = type === "ewallet";
  const isCash = type === "cash";

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: isBank
          ? "var(--primary-subtle, rgba(37, 99, 235, 0.1))"
          : isEwallet
          ? "rgba(16, 185, 129, 0.1)"
          : isCash
          ? "rgba(245, 158, 11, 0.1)"
          : "rgba(139, 92, 246, 0.1)",
        color: isBank
          ? "var(--primary-color, #2563eb)"
          : isEwallet
          ? "#059669"
          : isCash
          ? "#d97706"
          : "#7c3aed",
      }}
    >
      {isBank ? (
        <Landmark style={{ width: size * 0.45, height: size * 0.45 }} />
      ) : isEwallet ? (
        <CreditCard style={{ width: size * 0.45, height: size * 0.45 }} />
      ) : (
        <Coins style={{ width: size * 0.45, height: size * 0.45 }} />
      )}
    </div>
  );
}
