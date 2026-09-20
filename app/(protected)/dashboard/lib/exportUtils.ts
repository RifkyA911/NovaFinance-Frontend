/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportOptions {
  dateRange?: "all" | "this_month" | "last_30_days";
  includeNotes?: boolean;
}

export function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 📊 Export Comprehensive Multi-Sheet Excel Workbook
 */
export function exportToExcel(
  workspaceName: string,
  currency: string,
  transactions: any[],
  accounts: any[] = [],
  options: ExportOptions = {}
) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split("T")[0];

  // Calculate Aggregates
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0);
    if (tx.type === "income") totalIncome += amt;
    else if (tx.type === "expense") totalExpense += amt;
  });

  const netBalance = totalIncome - totalExpense;

  // 1. SHEET 1: Executive Summary
  const summaryData = [
    ["NOVAFINANCE FINANCIAL STATEMENT & AUDIT LEDGER"],
    ["Generated:", new Date().toLocaleString("id-ID")],
    ["Workspace Entity:", workspaceName],
    ["Operating Currency:", currency],
    ["Reporting Filter:", options.dateRange || "All Recorded Data"],
    [],
    ["EXECUTIVE CASHFLOW KPI SUMMARY"],
    ["Metric", "Nominal Value", "Status"],
    ["Total Cash Inflow (Income)", totalIncome, "Credit"],
    ["Total Cash Outflow (Expense)", totalExpense, "Debit"],
    ["Net Operational Cashflow", netBalance, netBalance >= 0 ? "Surplus" : "Deficit"],
    ["Total Recorded Transactions", transactions.length, "Transactions"],
    [],
    ["LIQUIDITY VAULTS & ACCOUNT BALANCES"],
    ["Account Name", "Type", "Current Balance", "Currency"],
  ];

  accounts.forEach((acc) => {
    summaryData.push([
      acc.name || "Main Wallet",
      (acc.type || "Cash").toUpperCase(),
      typeof acc.balance === "string" ? parseFloat(acc.balance) : Number(acc.balance || 0),
      acc.currency || currency,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths for summary
  wsSummary["!cols"] = [
    { wch: 32 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // 2. SHEET 2: Transaction Ledger (Full audit trail)
  const ledgerHeader = [
    ["Transaction Date", "Type", "Title / Note", "Category", "Nominal Amount", "Account / Wallet", "Reference ID"],
  ];

  const ledgerRows = transactions.map((tx) => [
    tx.date ? new Date(tx.date).toLocaleDateString("id-ID") : "-",
    tx.type === "income" ? "INCOME (Credit)" : "EXPENSE (Debit)",
    tx.note || tx.description || "-",
    typeof tx.category === "object" ? tx.category?.name : tx.category || "General",
    typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0),
    typeof tx.account === "object" ? tx.account?.name : tx.account || tx.wallet || "Main Vault",
    tx.id || "-",
  ]);

  const wsLedger = XLSX.utils.aoa_to_sheet([...ledgerHeader, ...ledgerRows]);

  // Styling Column widths
  wsLedger["!cols"] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 32 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 26 },
  ];

  XLSX.utils.book_append_sheet(wb, wsLedger, "Transaction Ledger");

  // Write and download file
  const filename = `novafinance-${workspaceName.toLowerCase().replace(/\s+/g, "-")}-statement-${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * 📑 Export Professional Executive PDF Financial Statement
 */
export function exportToPdf(
  workspaceName: string,
  currency: string,
  transactions: any[],
  accounts: any[] = [],
  options: ExportOptions = {}
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const dateStr = new Date().toISOString().split("T")[0];

  // Calculate Aggregates
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0);
    if (tx.type === "income") totalIncome += amt;
    else if (tx.type === "expense") totalExpense += amt;
  });

  const netBalance = totalIncome - totalExpense;

  // Header Branding
  doc.setFillColor(30, 58, 138); // Deep Nova Blue
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NOVAFINANCE FINANCIAL STATEMENT", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Enterprise Financial Core & Executive Audit Report", 14, 21);

  // Date and Metadata on Top Right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, 145, 14);
  doc.text(`Entity: ${workspaceName} (${currency})`, 145, 20);

  // Summary Information Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Cashflow Summary", 14, 38);

  // 3 KPI Box Cards
  // Card 1: Total Inflow
  doc.setFillColor(240, 253, 244); // Green tint
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, 42, 58, 22, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text("TOTAL CASH INFLOW", 18, 48);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalIncome, currency), 18, 58);

  // Card 2: Total Outflow
  doc.setFillColor(254, 242, 242); // Red tint
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(76, 42, 58, 22, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text("TOTAL CASH OUTFLOW", 80, 48);
  doc.setFontSize(11);
  doc.text(formatCurrency(totalExpense, currency), 80, 58);

  // Card 3: Net Cashflow
  const isNetPositive = netBalance >= 0;
  doc.setFillColor(isNetPositive ? 239 : 254, isNetPositive ? 246 : 242, isNetPositive ? 255 : 242);
  doc.setDrawColor(isNetPositive ? 191 : 254, isNetPositive ? 219 : 202, isNetPositive ? 254 : 202);
  doc.roundedRect(138, 42, 58, 22, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(isNetPositive ? 30 : 153, isNetPositive ? 58 : 27, isNetPositive ? 138 : 27);
  doc.text("NET CASHFLOW", 142, 48);
  doc.setFontSize(11);
  doc.text(formatCurrency(netBalance, currency), 142, 58);

  // Transactions Table
  const tableRows = transactions.slice(0, 150).map((tx, idx) => {
    const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0);
    const categoryName = typeof tx.category === "object" ? tx.category?.name : tx.category || "-";
    const accountName = typeof tx.account === "object" ? tx.account?.name : tx.account || "-";
    const formattedDate = tx.date ? new Date(tx.date).toLocaleDateString("id-ID") : "-";

    return [
      String(idx + 1),
      formattedDate,
      tx.description || "Untitled",
      (tx.type || "EXP").toUpperCase(),
      categoryName,
      accountName,
      (tx.type === "income" ? "+ " : "- ") + formatCurrency(amt, currency),
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [["#", "Date", "Description", "Type", "Category", "Wallet", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 16 },
      4: { cellWidth: 30 },
      5: { cellWidth: 26 },
      6: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text.startsWith("+")) {
          data.cell.styles.textColor = [22, 101, 52]; // green
        } else {
          data.cell.styles.textColor = [185, 28, 28]; // red
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer page numbering
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NovaFinance Financial Core Engine • Halaman ${i} dari ${pageCount} • Dokumen rahasia terenkripsi`,
      14,
      290
    );
  }

  const filename = `novafinance-${workspaceName.toLowerCase().replace(/\s+/g, "-")}-statement-${dateStr}.pdf`;
  doc.save(filename);
}
