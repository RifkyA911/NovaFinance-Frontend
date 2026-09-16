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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface FileItem {
    id: string;
    file: File;
    preview: string;
    status: 'idle' | 'analyzing' | 'done' | 'error';
    extractedData?: DocumentMetadata;
    uploadedDoc?: UploadedDocumentResult;
    errorMsg?: string;
  }
  
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processSelectedFiles(Array.from(e.target.files));
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processSelectedFiles = (files: File[]) => {
    const newItems = files.map(file => {
      const id = Date.now().toString() + Math.random().toString();
      const preview = URL.createObjectURL(file);
      return {
        id,
        file,
        preview,
        status: 'idle' as const,
      };
    });
    setFileItems(prev => [...prev, ...newItems]);
    setError(null);
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
            processSelectedFiles([file]);
          }
        }, "image/jpeg");
      }
      stopCamera();
    }
  };

  const triggerExtraction = async (itemId: string) => {
    const item = fileItems.find(i => i.id === itemId);
    if (!item) return;

    setFileItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'analyzing', errorMsg: undefined } : i));

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("filename", item.file.name);
    formData.append("workspaceId", workspaceId);
    if (transactionId) {
      formData.append("transactionId", transactionId);
    }

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

    let lastErrorMessage = "Failed to upload and extract document.";
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
          
          let extractedData: DocumentMetadata | undefined;
          if (result.data.document.metadata) {
            extractedData = result.data.document.metadata as DocumentMetadata;
            if (onMetadataExtracted) {
              onMetadataExtracted(extractedData, doc);
            }
          }

          setFileItems(prev => prev.map(i => i.id === itemId ? { 
            ...i, 
            status: 'done', 
            uploadedDoc: doc, 
            extractedData 
          } : i));

          if (onUpload) {
            onUpload(item.file, item.file.name.startsWith("receipt-") ? "camera" : "file");
          }

          uploadedSuccessfully = true;
          break;
        } else {
          lastErrorMessage = result.error || "Failed to process server response";
        }
      } catch (err: unknown) {
        lastErrorMessage = err instanceof Error ? err.message : "Network error";
      }
    }

    if (!uploadedSuccessfully) {
      setFileItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'error', errorMsg: lastErrorMessage } : i));
    }
  };

  const removeFile = (itemId: string) => {
    setFileItems(prev => {
        const newItems = prev.filter(i => i.id !== itemId);
        return newItems;
    });
  };

  return (
    <div className="space-y-3">
      {/* Upload Drop Zone / Triggers */}
      {!isCameraOpen && (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative border-2 border-dashed rounded-2xl cursor-pointer transition-all p-6 text-center ${
              isDragging
                ? "border-purple-500 bg-purple-500/5 dark:bg-purple-900/10 scale-[1.02]"
                : "border-default-300 dark:border-default-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-default-50 dark:hover:bg-default-800/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isDragging 
                    ? "bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/25" 
                    : "bg-default-100 dark:bg-default-800 text-default-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                }`}>
                  {isDragging ? <FileUp className="w-6 h-6" /> : <Sparkles className="w-5 h-5" />}
                </div>
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-center gap-2">
                  <span>{isDragging ? "Drop files here" : "Drag & Drop Multiple Files"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    AI Auto-Fill
                  </span>
                </p>
                <p className="text-xs text-default-500">
                  Select or drag multiple receipts/invoices (PNG, JPG, WebP, PDF)
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 px-3.5 text-xs font-semibold border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
                  onPress={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Choose Files
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 px-3.5 text-xs font-semibold border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer"
                  onPress={() => startCamera()}
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Take Photo
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple={true}
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
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              onPress={capturePhoto}
              className="h-8 text-xs bg-linear-to-r from-purple-500 to-blue-600 text-white font-semibold shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Take Photo
            </Button>
          </div>
        </div>
      )}

      {/* Preview List */}
      {fileItems.length > 0 && (
        <div className="space-y-3 mt-4">
          {fileItems.map(item => (
            <div key={item.id} className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="relative w-18 h-18 rounded-xl overflow-hidden border border-default-200 dark:border-default-700 shrink-0 bg-default-100 shadow-xs">
                  <Image
                    src={item.preview}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Receipt className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {item.file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 text-default-400 hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {item.status === 'idle' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onPress={() => triggerExtraction(item.id)}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold cursor-pointer h-8 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Extract with AI
                      </Button>
                    </div>
                  )}

                  {item.status === 'analyzing' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                      <Spinner size="sm" />
                      <span className="animate-pulse">Extracting data with AI...</span>
                    </div>
                  )}

                  {item.status === 'done' && item.extractedData && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Data extracted successfully</span>
                      </div>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="mt-2 p-2 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="font-semibold truncate">{item.errorMsg}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerExtraction(item.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-danger hover:underline cursor-pointer shrink-0 ml-2"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
