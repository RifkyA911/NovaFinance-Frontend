/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, Button, Spinner } from "@heroui/react";
import { Search, Filter, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown, Receipt } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

interface TransactionsTableProps {
  table: any;
  transactions: any[];
  rawTransactions: any[];
  activeFiltersCount: number;
  apiSortBy: string;
  setApiSortBy: (val: "createdAt" | "date") => void;
  filterKeyword: string;
  setFilterKeyword: (val: string) => void;
  setIsFilterModalOpen: (val: boolean) => void;
  generatePageNumbers: (currentPage: number, totalPages: number) => (number | string)[];
  jumpPageVal: string;
  setJumpPageVal: (val: string) => void;
  columns: any[];
}

export function TransactionsTable({
  table,
  transactions,
  rawTransactions,
  activeFiltersCount,
  apiSortBy,
  setApiSortBy,
  filterKeyword,
  setFilterKeyword,
  setIsFilterModalOpen,
  generatePageNumbers,
  jumpPageVal,
  setJumpPageVal,
  columns
}: TransactionsTableProps) {
  const router = useRouter();

  return (
    <section aria-label="Transactions Table">
      {/* Transaction Journal: Full TanStack Table DataTable */}
      <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs overflow-hidden">
        <Card.Header className="p-3.5 sm:p-4 border-b border-default-100 dark:border-default-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Card.Title className="text-sm font-semibold text-foreground">Transaction Journal</Card.Title>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                TanStack DataTable
              </span>
            </div>
            <Card.Description className="text-xs text-default-500">
              Total {transactions.length} entri termuat
              {activeFiltersCount > 0 ? ` (difilter dari ${rawTransactions.length} total)` : ""}
            </Card.Description>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Order Selector (Created At vs Transaction Date) */}
            <div className="flex items-center gap-1.5 bg-default-100 dark:bg-default-800 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setApiSortBy("createdAt")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  apiSortBy === "createdAt"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-500 hover:text-foreground"
                }`}
                title="Tampilkan transaksi yang paling baru diinput ke sistem"
              >
                ✨ Terbaru Diinput
              </button>
              <button
                type="button"
                onClick={() => setApiSortBy("date")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  apiSortBy === "date"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-500 hover:text-foreground"
                }`}
                title="Urutkan berdasarkan tanggal pada nota/struk"
              >
                📅 Tgl Nota
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative w-40 sm:w-52">
              <Search className="w-3.5 h-3.5 text-default-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full h-8 pl-8 pr-7 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all"
              />
              {filterKeyword && (
                <button aria-label="Clear Search" type="button" onClick={() => setFilterKeyword("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Modal Trigger */}
            <Button aria-label="Filter Transactions" size="sm" variant="outline" className="h-8 px-2.5 text-xs flex items-center gap-1 cursor-pointer border-default-200 dark:border-default-700 hover:border-blue-500/40 rounded-xl"
              onPress={() => setIsFilterModalOpen(true)}
            >
              <Filter className="w-3 h-3 text-default-500" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View All */}
            <Button aria-label="View All Transactions" size="sm" variant="ghost" className="text-xs h-8 px-2 text-default-500 hover:text-foreground cursor-pointer rounded-xl"
              onPress={() => router.push("/transactions")}
            >
              Semua
            </Button>
          </div>
        </Card.Header>

        {/* TanStack Table Grid */}
        <Card.Content className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-160">
              <thead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-default-200 dark:border-default-800 bg-default-50/70 dark:bg-default-900/40"
                  >
                    {headerGroup.headers.map((header: any) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`py-3 px-4 text-xs font-semibold text-default-500 uppercase tracking-wider select-none ${
                            canSort
                              ? "cursor-pointer hover:text-foreground hover:bg-default-100/60 dark:hover:bg-default-800/60 transition-colors"
                              : ""
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 ${header.id === "amount" || header.id === "actions" ? "justify-end" : "justify-start"}`}>
                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            {canSort && (
                              <span className="text-default-400 shrink-0">
                                {sorted === "asc" ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
                                ) : sorted === "desc" ? (
                                  <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 opacity-30 hover:opacity-100" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-default-100 dark:divide-default-800/60">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row: any) => (
                    <tr
                      key={row.id}
                      className="hover:bg-default-50/70 dark:hover:bg-default-800/40 transition-colors group"
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <td key={cell.id} className="py-2.5 px-4 text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-default-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-9 h-9 text-default-300 dark:text-default-600 stroke-[1.5]" />
                        <p className="font-semibold text-foreground text-sm">Tidak ada transaksi yang cocok</p>
                        <p className="text-xs text-default-400 max-w-sm">
                          {filterKeyword || activeFiltersCount > 0
                            ? "Coba sesuaikan kata kunci pencarian atau bersihkan filter yang aktif."
                            : "Belum ada transaksi di workspace ini. Klik 'Add Transaction' di atas untuk mencatat transaksi baru."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DataTable Footer: table.getState().pagination Controls & Page Jump */}
          <div className="p-3 sm:p-4 border-t border-default-100 dark:border-default-800/80 bg-default-50/40 dark:bg-default-900/20 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs text-default-500">
            {/* Left: Entries range info & Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <span>
                Menampilkan{" "}
                <strong className="text-foreground font-mono">
                  {table.getFilteredRowModel().rows.length === 0
                    ? 0
                    : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-foreground font-mono">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </strong>{" "}
                dari{" "}
                <strong className="text-foreground font-mono">
                  {table.getFilteredRowModel().rows.length}
                </strong>{" "}
                transaksi
              </span>

              {/* Page size dropdown */}
              <div className="flex items-center gap-1.5 border-l border-default-200 dark:border-default-700 pl-3">
                <span className="text-[11px] text-default-400">Baris:</span>
                <select aria-label="Page size" value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {[5, 10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / hal
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Page Navigation & Direct Select / Jump */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-center lg:justify-end">
              {/* Direct Select Page Dropdown */}
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[11px] text-default-400">Halaman:</span>
                <select aria-label="Page index" value={table.getState().pagination.pageIndex}
                  onChange={(e) => table.setPageIndex(Number(e.target.value))}
                  className="h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold"
                >
                  {Array.from({ length: Math.max(1, table.getPageCount()) }, (_, i) => (
                    <option key={i} value={i}>
                      {i + 1} dari {Math.max(1, table.getPageCount())}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Page Button */}
              <button
                type="button"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="Halaman Pertama"
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page Button */}
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Halaman Sebelumnya"
                className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Dynamic Numeric Page Buttons */}
              <div className="flex items-center gap-1">
                {generatePageNumbers(table.getState().pagination.pageIndex, Math.max(1, table.getPageCount())).map(
                  (page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-default-400 select-none">
                          ...
                        </span>
                      );
                    }
                    const pNum = Number(page) - 1;
                    const isActive = pNum === table.getState().pagination.pageIndex;
                    return (
                      <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => table.setPageIndex(pNum)}
                        className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Halaman Berikutnya"
                className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs font-medium"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page Button */}
              <button
                type="button"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                title="Halaman Terakhir"
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>

              {/* Direct Jump Input */}
              <div className="flex items-center gap-1 border-l border-default-200 dark:border-default-700 pl-2">
                <span className="text-[11px] text-default-400 hidden xl:inline">Lompat:</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, table.getPageCount())}
                  placeholder="Hal"
                  value={jumpPageVal}
                  onChange={(e) => setJumpPageVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = Number(jumpPageVal);
                      if (val >= 1 && val <= table.getPageCount()) {
                        table.setPageIndex(val - 1);
                        setJumpPageVal("");
                      }
                    }
                  }}
                  className="w-12 h-7 px-1 text-center text-xs rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}




