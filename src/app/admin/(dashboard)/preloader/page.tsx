"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { generateCloudinarySignature } from "@/lib/cloudinary-client";
import { getOptimizedImageUrl } from "@/lib/media";

type PreloaderImage = {
  id: string;
  url: string;
  publicId: string;
  order: number;
};

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function PreloaderAdminPage() {
  const [images, setImages] = useState<PreloaderImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/admin/preloader");
    const data = await res.json();
    setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const openUploadWidget = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: true,
        folder: "preloader",
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          await fetch("/api/admin/preloader", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: result.info.secure_url,
              publicId: result.info.public_id,
            }),
          });
          fetchImages();
        }
      }
    );
    widget.open();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/preloader/${id}`, { method: "DELETE" });
    fetchImages();
  };

  return (
    <div>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight">Preloader Images</h1>
          <p className="text-xs text-white/40 mt-0.5">Upload images shown during initial website preloading.</p>
        </div>
        <button
          onClick={openUploadWidget}
          className="px-4 py-2 bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition rounded-sm shrink-0 self-start sm:self-auto"
        >
          + Upload Images
        </button>
      </div>

      {loading ? (
        <p className="text-white/50 text-sm">Loading...</p>
      ) : images.length === 0 ? (
        <p className="text-white/50 text-sm">No images yet. Upload some above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded overflow-hidden bg-zinc-900 border border-white/10">
              <img src={getOptimizedImageUrl(img.url, { width: 300, quality: 75 })} alt="" className="w-full aspect-square object-cover" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded transition opacity-100 sm:opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}