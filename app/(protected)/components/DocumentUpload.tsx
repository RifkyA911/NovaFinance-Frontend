"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button, Spinner } from "@heroui/react";
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertCircle, Receipt } from "lucide-react";

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

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setExtractedData(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Automatically analyze document with Gemini RAG
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

    try {
      // Use proxy or direct backend URL
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

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
      } else {
        const errMsg = result.error || "Gagal mengunggah dan menganalisis dokumen";
        setError(errMsg);
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback try direct port 8080 if proxy hit network issues
      try {
        const directResponse = await fetch("http://localhost:8080/documents/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const directResult = await directResponse.json();
        if (directResult.success && directResult.data?.document) {
          const doc: UploadedDocumentResult = {
            id: directResult.data.document.id,
            fileName: directResult.data.document.fileName,
            fileUrl: directResult.data.document.fileUrl || directResult.data.url,
            fileType: directResult.data.document.fileType,
            metadata: directResult.data.document.metadata,
          };
          setUploadedDoc(doc);
          if (directResult.data.document.metadata) {
            const meta = directResult.data.document.metadata as DocumentMetadata;
            setExtractedData(meta);
            if (onMetadataExtracted) {
              onMetadataExtracted(meta, doc);
            }
          }
          if (onUpload) {
            onUpload(fileToUpload, fileToUpload.name.startsWith("receipt-") ? "camera" : "file");
          }
          return;
        }
      } catch {
        // ignore secondary error
      }
      setError("Gagal menghubungi server dokumen. Pastikan backend aktif.");
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="space-y-2.5">
      {/* Upload Zone / Triggers */}
      {!preview && !isCameraOpen && (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 dark:border-purple-500/30 dark:hover:border-purple-500/60 rounded-xl ${
              compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"
            } text-center cursor-pointer transition-all bg-linear-to-br from-purple-500/5 via-blue-500/5 to-transparent hover:bg-purple-500/10`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Scan Receipt / Invoice dengan Gemini AI</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    Auto-Fill
                  </span>
                </p>
                <p className="text-[11px] text-default-400 truncate">
                  Upload foto struk atau tagihan untuk mengisi nominal, tanggal, dan merchant secara otomatis
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-7 px-2 text-xs border-purple-500/30 text-purple-600 dark:text-purple-400"
                  onPress={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-7 px-2 text-xs border-default-200 dark:border-default-700 text-default-600"
                  onPress={() => startCamera()}
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Kamera
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
        <div className="space-y-2 p-3 bg-default-100 dark:bg-default-800/60 rounded-xl border border-default-200 dark:border-default-700">
          <div className="relative rounded-lg overflow-hidden bg-black max-h-56 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-56" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" type="button" onPress={stopCamera} className="h-7 text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              type="button"
              onPress={capturePhoto}
              className="h-7 text-xs bg-linear-to-r from-purple-500 to-blue-600 text-white font-medium"
            >
              <Camera className="w-3.5 h-3.5 mr-1" />
              Ambil Foto Struk
            </Button>
          </div>
        </div>
      )}

      {/* Preview & AI Analysis State Banner */}
      {preview && (
        <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2.5">
          <div className="flex items-start gap-3">
            {/* Thumbnail Preview */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-default-200 dark:border-default-700 shrink-0 bg-default-100">
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
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {uploadedDoc?.fileName || selectedFile?.name || "Dokumen Struk"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="p-1 text-default-400 hover:text-danger rounded-md transition-colors cursor-pointer"
                  title="Hapus lampiran"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-purple-600 dark:text-purple-400">
                  <Spinner size="sm" />
                  <span className="animate-pulse">Menganalisis struk dengan Gemini Vision...</span>
                </div>
              ) : extractedData ? (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Metadata struk berhasil diekstrak & diisi otomatis:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {extractedData.merchant && (
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 font-semibold text-foreground">
                        {extractedData.merchant}
                      </span>
                    )}
                    {extractedData.amount !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-green-500/15 border border-green-500/20 text-green-600 dark:text-green-400 font-mono font-bold">
                        Rp {extractedData.amount.toLocaleString("id-ID")}
                      </span>
                    )}
                    {extractedData.date && (
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 text-default-500">
                        {extractedData.date}
                      </span>
                    )}
                    {extractedData.categories?.[0] && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        {extractedData.categories[0]}
                      </span>
                    )}
                    {extractedData.confidence && (
                      <span className="text-[10px] text-default-400 ml-auto">
                        Akurasi: {Math.round(extractedData.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-between mt-1 text-xs text-danger">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectedFile && uploadAndAnalyze(selectedFile)}
                    className="text-[11px] underline ml-2 shrink-0 cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
