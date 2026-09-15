"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button, Spinner } from "@heroui/react";
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertCircle, Receipt, FileUp, RefreshCw } from "lucide-react";

export interface DocumentMetadata {
  documentType?: "receipt" | "invoice" | "contract" | "statement" | "other";
  amount?: number;
  currency?: string;
  date?: string;
  vendor?: string;
  merchant?: string;
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  categories?: string[];
  extractedText?: string;
  entities?: Array<{
    type: string;
    value: string;
    confidence?: number;
  }>;
  confidence?: number;
}

export interface UploadedDocumentResult {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  metadata?: DocumentMetadata | null;
}

interface DocumentUploadProps {
  workspaceId: string;
  transactionId?: string;
  onUpload?: (file: File, type: "camera" | "file") => void;
  onMetadataExtracted?: (metadata: DocumentMetadata, document: UploadedDocumentResult) => void;
  compact?: boolean;
}

export function DocumentUpload({
  workspaceId,
  transactionId,
  onUpload,
  onMetadataExtracted,
  compact = false,
}: DocumentUploadProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedData, setExtractedData] = useState<DocumentMetadata | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setExtractedData(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Automatically upload to backend and analyze with Gemini
    uploadAndAnalyze(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Unable to access camera. Please check permissions or use file upload.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
            processSelectedFile(file);
          }
        }, "image/jpeg");
      }
      stopCamera();
    }
  };

  const uploadAndAnalyze = async (fileToUpload: File) => {
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("filename", fileToUpload.name);
    formData.append("workspaceId", workspaceId);
    if (transactionId) {
      formData.append("transactionId", transactionId);
    }

    // Build headers with token if stored
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeaders: Record<string, string> = {};
    if (token) {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }

    const endpoints = [
      "/api/documents/upload",
      "http://localhost:8080/api/documents/upload",
      "http://localhost:8080/documents/upload",
    ];

    let lastErrorMessage = "Failed to upload document.";
    let uploadedSuccessfully = false;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: authHeaders,
        });

        if (!response.ok) {
          const errorText = await response.text();
          try {
            const parsed = JSON.parse(errorText);
            lastErrorMessage = parsed.error || parsed.details || `Error: ${response.statusText}`;
          } catch {
            lastErrorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          continue;
        }

        const result = await response.json();

        if (result.success && result.data?.document) {
          const doc: UploadedDocumentResult = {
            id: result.data.document.id,
            fileName: result.data.document.fileName,
            fileUrl: result.data.document.fileUrl || result.data.url,
            fileType: result.data.document.fileType,
            metadata: result.data.document.metadata,
          };
          setUploadedDoc(doc);

          if (result.data.document.metadata) {
            const meta = result.data.document.metadata as DocumentMetadata;
            setExtractedData(meta);
            if (onMetadataExtracted) {
              onMetadataExtracted(meta, doc);
            }
          }

          if (onUpload) {
            onUpload(fileToUpload, fileToUpload.name.startsWith("receipt-") ? "camera" : "file");
          }

          uploadedSuccessfully = true;
          break;
        } else {
          lastErrorMessage = result.error || "Gagal memproses respons dari server";
        }
      } catch (err: unknown) {
        console.warn(`Upload attempt to ${url} failed:`, err);
        lastErrorMessage = err instanceof Error ? err.message : "Network error";
      }
    }

    if (!uploadedSuccessfully) {
      setError(lastErrorMessage);
    }
    setIsAnalyzing(false);
  };

  const clearAttachment = () => {
    setPreview(null);
    setSelectedFile(null);
    setExtractedData(null);
    setUploadedDoc(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Drop Zone / Triggers */}
      {!preview && !isCameraOpen && (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-500/15 scale-[1.01] shadow-lg shadow-purple-500/10 ring-4 ring-purple-500/10"
                : "border-purple-500/30 hover:border-purple-500/60 dark:border-purple-500/20 dark:hover:border-purple-500/50 bg-linear-to-b from-purple-500/5 via-transparent to-transparent hover:bg-purple-500/10"
            } ${compact ? "p-4 sm:p-5" : "p-6 sm:p-7"} text-center`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              {/* Icon Badges */}
              <div className="flex items-center gap-2">
                <div className={`rounded-xl flex items-center justify-center transition-all ${
                  isDragging
                    ? "w-12 h-12 bg-purple-500 text-white animate-bounce"
                    : "w-11 h-11 bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:scale-105"
                }`}>
                  {isDragging ? <FileUp className="w-6 h-6" /> : <Sparkles className="w-5 h-5" />}
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1 max-w-md">
                <p className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-center gap-2">
                  <span>{isDragging ? "Lepaskan file di sini" : "Drag & Drop Struk / Invoice Anda"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    AI Auto-Fill
                  </span>
                </p>
                <p className="text-xs text-default-500">
                  Tarik file ke area ini atau klik untuk memilih file struk, tagihan, atau kuitansi (PNG, JPG, WebP, PDF)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 px-3.5 text-xs font-semibold border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
                  onPress={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Pilih Berkas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 px-3.5 text-xs font-semibold border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer"
                  onPress={() => startCamera()}
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Foto Struk
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {isCameraOpen && (
        <div className="space-y-2.5 p-4 bg-default-100 dark:bg-default-800/60 rounded-2xl border border-default-200 dark:border-default-700 shadow-inner">
          <div className="relative rounded-xl overflow-hidden bg-black max-h-64 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-64" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" type="button" onPress={stopCamera} className="h-8 text-xs font-medium cursor-pointer">
              Batal
            </Button>
            <Button
              size="sm"
              type="button"
              onPress={capturePhoto}
              className="h-8 text-xs bg-linear-to-r from-purple-500 to-blue-600 text-white font-semibold shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Ambil Foto Struk
            </Button>
          </div>
        </div>
      )}

      {/* Preview & AI Analysis State Banner */}
      {preview && (
        <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 space-y-3">
          <div className="flex items-start gap-3.5">
            {/* Thumbnail Preview */}
            <div className="relative w-18 h-18 rounded-xl overflow-hidden border border-default-200 dark:border-default-700 shrink-0 bg-default-100 shadow-xs">
              <Image
                src={preview}
                alt="Receipt Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Status & Extracted Metadata Overview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Receipt className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {uploadedDoc?.fileName || selectedFile?.name || "Dokumen Struk Terlampir"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="p-1.5 text-default-400 hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                  title="Hapus lampiran"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  <Spinner size="sm" />
                  <span className="animate-pulse">Sedang memindai dan mengekstrak data struk dengan Gemini AI...</span>
                </div>
              ) : extractedData ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Data struk berhasil diekstrak dan diisikan otomatis ke form:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {extractedData.merchant && (
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 font-semibold text-foreground shadow-2xs">
                        🏪 {extractedData.merchant}
                      </span>
                    )}
                    {extractedData.amount !== undefined && (
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20 text-green-600 dark:text-green-400 font-mono font-bold shadow-2xs">
                        💰 Rp {extractedData.amount.toLocaleString("id-ID")}
                      </span>
                    )}
                    {extractedData.date && (
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 text-default-500 shadow-2xs">
                        📅 {extractedData.date}
                      </span>
                    )}
                    {extractedData.categories?.[0] && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium shadow-2xs">
                        🏷️ {extractedData.categories[0]}
                      </span>
                    )}
                    {extractedData.confidence !== undefined && (
                      <span className="text-[11px] text-default-400 ml-auto font-medium">
                        Akurasi: {Math.round(extractedData.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ) : error ? (
                <div className="mt-2 p-2 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold truncate">{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedFile && uploadAndAnalyze(selectedFile)}
                      className="flex items-center gap-1 text-[11px] font-bold text-danger hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Coba Lagi
                    </button>
                  </div>
                  <p className="text-[10px] text-danger/80">
                    Pastikan backend API berjalan di http://localhost:8080 dan MinIO aktif.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-default-400 mt-1">Dokumen berhasil diunggah ke MinIO.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
