export type AssetCategory =
  | "stocks_id"
  | "stocks_us"
  | "crypto"
  | "bonds"
  | "mutual_funds"
  | "gold"
  | "cash";

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  shares: number; // e.g. lots or units
  avgBuyPrice: number;
  currentPrice: number;
  currency: "IDR" | "USD";
  dividendYield: number; // in percentage e.g. 3.5%
  sparkline: number[];
  targetAllocation: number; // target percentage e.g. 20%
  sector: string;
}

export const CATEGORY_CONFIG: Record<
  AssetCategory,
  { label: string; color: string; bg: string; iconName: string }
> = {
  stocks_id: {
    label: "Saham IHSG",
    color: "#3b82f6",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    iconName: "TrendingUp",
  },
  stocks_us: {
    label: "US / Global Stocks",
    color: "#8b5cf6",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    iconName: "Globe",
  },
  crypto: {
    label: "Crypto Assets",
    color: "#f59e0b",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconName: "Zap",
  },
  bonds: {
    label: "SBN & Obligasi",
    color: "#10b981",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    iconName: "ShieldCheck",
  },
  mutual_funds: {
    label: "Reksadana",
    color: "#06b6d4",
    bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    iconName: "Layers",
  },
  gold: {
    label: "Emas & Logam Mulia",
    color: "#eab308",
    bg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    iconName: "Coins",
  },
  cash: {
    label: "Pasar Uang & Kas",
    color: "#64748b",
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    iconName: "Wallet",
  },
};

export const INITIAL_DEFAULT_ASSETS: PortfolioAsset[] = [
  {
    id: "ast-1",
    symbol: "BBCA.JK",
    name: "Bank Central Asia Tbk",
    category: "stocks_id",
    shares: 10000,
    avgBuyPrice: 9150,
    currentPrice: 10250,
    currency: "IDR",
    dividendYield: 2.8,
    sparkline: [9800, 9900, 10050, 9950, 10100, 10200, 10250],
    targetAllocation: 25,
    sector: "Financials / Banking",
  },
  {
    id: "ast-2",
    symbol: "BBRI.JK",
    name: "Bank Rakyat Indonesia Tbk",
    category: "stocks_id",
    shares: 15000,
    avgBuyPrice: 4800,
    currentPrice: 5350,
    currency: "IDR",
    dividendYield: 5.6,
    sparkline: [4950, 5000, 5150, 5100, 5250, 5300, 5350],
    targetAllocation: 20,
    sector: "Micro-Banking",
  },
  {
    id: "ast-3",
    symbol: "SBN-FR0097",
    name: "Surat Berharga Negara FR0097",
    category: "bonds",
    shares: 50,
    avgBuyPrice: 1000000,
    currentPrice: 1035000,
    currency: "IDR",
    dividendYield: 7.125,
    sparkline: [1010000, 1015000, 1020000, 1025000, 1030000, 1032000, 1035000],
    targetAllocation: 20,
    sector: "Government Fixed Coupon",
  },
  {
    id: "ast-4",
    symbol: "ANTAM",
    name: "Emas Batangan Antam 24K",
    category: "gold",
    shares: 25, // grams
    avgBuyPrice: 1250000,
    currentPrice: 1420000,
    currency: "IDR",
    dividendYield: 0,
    sparkline: [1360000, 1375000, 1390000, 1385000, 1405000, 1410000, 1420000],
    targetAllocation: 10,
    sector: "Precious Metals",
  },
  {
    id: "ast-5",
    symbol: "BTC",
    name: "Bitcoin",
    category: "crypto",
    shares: 0.085,
    avgBuyPrice: 850000000,
    currentPrice: 990000000,
    currency: "IDR",
    dividendYield: 0,
    sparkline: [920000000, 940000000, 915000000, 960000000, 975000000, 985000000, 990000000],
    targetAllocation: 10,
    sector: "Digital Store of Value",
  },
  {
    id: "ast-6",
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "stocks_us",
    shares: 15,
    avgBuyPrice: 3200000, // in IDR equiv
    currentPrice: 3600000,
    currency: "IDR",
    dividendYield: 0.6,
    sparkline: [3350000, 3400000, 3450000, 3500000, 3520000, 3580000, 3600000],
    targetAllocation: 10,
    sector: "Consumer Electronics",
  },
  {
    id: "ast-7",
    symbol: "RDPU-SUCOFINDO",
    name: "Sucorinvest Sharia Money Market",
    category: "cash",
    shares: 20000000,
    avgBuyPrice: 1,
    currentPrice: 1.055,
    currency: "IDR",
    dividendYield: 5.5,
    sparkline: [1.02, 1.025, 1.03, 1.035, 1.04, 1.048, 1.055],
    targetAllocation: 5,
    sector: "Money Market Liquidity",
  },
];
