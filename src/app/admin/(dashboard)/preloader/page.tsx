"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { generateCloudinarySignature } from "@/lib/cloudinary-client";

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

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl">Preloader Images</h1>
        <button
          onClick={openUploadWidget}
          className="px-4 py-2 border border-white/30 text-sm hover:bg-white hover:text-black transition"
        >
          Upload Image
        </button>
      </div>

      {loading ? (
        <p className="text-white/50 text-sm">Loading...</p>
      ) : images.length === 0 ? (
        <p className="text-white/50 text-sm">No images yet. Upload some above.</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt="" className="w-full aspect-square object-cover" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition"
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