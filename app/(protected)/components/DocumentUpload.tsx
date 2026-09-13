"use client";

import { useState, useRef } from "react";
import { Button, Modal } from "@heroui/react";
import { Camera, Upload, X, FileImage } from "lucide-react";

interface DocumentUploadProps {
  onUpload: (file: File, type: 'camera' | 'file') => void;
  transactionId?: string;
  workspaceId: string;
}

export function DocumentUpload({ onUpload, transactionId, workspaceId }: DocumentUploadProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      setError('Unable to access camera. Please check permissions.');
      setShowErrorModal(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
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
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
              setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }, 'image/jpeg');
      }
      stopCamera();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filename', selectedFile.name);
    formData.append('workspaceId', workspaceId);
    if (transactionId) {
      formData.append('transactionId', transactionId);
    }

    try {
      const response = await fetch('http://localhost:8080/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        onUpload(selectedFile, selectedFile.name.startsWith('receipt-') ? 'camera' : 'file');
        setPreview(null);
        setSelectedFile(null);
        setShowSuccessModal(true);
      } else {
        setError('Upload failed: ' + (result.error || 'Unknown error'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {!preview && !isCameraOpen && (
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-blue-500 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button
            onClick={startCamera}
            className="flex-1 bg-green-500 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {isCameraOpen && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <Button onClick={capturePhoto} className="flex-1 bg-green-500 text-white">
              Capture
            </Button>
            <Button onClick={stopCamera} className="flex-1 bg-red-500 text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg max-h-64 object-contain"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              className="flex-1 bg-blue-500 text-white"
              isDisabled={isUploading}
            >
              <FileImage className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
            <Button onClick={clearPreview} className="flex-1 bg-gray-500 text-white">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <Modal isOpen={showErrorModal} onOpenChange={setShowErrorModal}>
        <div className="flex flex-col gap-1 p-6 text-danger">Error</div>
        <div className="p-6">
          <p>{error}</p>
        </div>
        <div className="p-6">
          <Button onPress={() => setShowErrorModal(false)}>
            OK
          </Button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <div className="flex flex-col gap-1 p-6 text-success">Success</div>
        <div className="p-6">
          <p>Document uploaded successfully!</p>
        </div>
        <div className="p-6">
          <Button onPress={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
