"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { generateCloudinarySignature } from "@/lib/cloudinary-client";
import { isVideoUrl } from "@/lib/media";

type WorkCategoryRow = {
  id: string;
  slug: string;
  title: string;
  subtext: string;
  imageUrl: string | null;
  publicId: string | null;
  order: number;
  isDefault: boolean;
};

declare global {
  interface Window {
    cloudinary: any;
  }
}

function IconButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/60 hover:text-white transition disabled:opacity-20 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

export default function WorkAdminPage() {
  const [rows, setRows] = useState<WorkCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtext, setNewSubtext] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRows = useCallback(async () => {
    const res = await fetch("/api/admin/work-categories");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setRows(list.sort((a: WorkCategoryRow, b: WorkCategoryRow) => a.order - b.order));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openUploadWidget = (id: string) => {
    setUploadingId(id);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: false,
        folder: "work-categories",
        resourceType: "auto",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "webm", "mov", "m4v"],
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          await fetch(`/api/admin/work-categories/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: result.info.secure_url,
              publicId: result.info.public_id,
            }),
          });
          fetchRows();
        }
        if (result?.event === "success" || error) {
          setUploadingId(null);
        }
      }
    );
    widget.open();
  };

  const handleAddCategory = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    await fetch("/api/admin/work-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), subtext: newSubtext.trim() }),
    });
    setNewTitle("");
    setNewSubtext("");
    setShowAddForm(false);
    setAdding(false);
    fetchRows();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/work-categories/${id}`, { method: "DELETE" });
    fetchRows();
  };

  const handleSubtextBlur = async (id: string, subtext: string) => {
    await fetch(`/api/admin/work-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtext }),
    });
  };

  const handleTitleBlur = async (id: string, title: string) => {
    await fetch(`/api/admin/work-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    const nonDefault = rows.filter((r) => !r.isDefault);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nonDefault.length) return;

    const a = nonDefault[index];
    const b = nonDefault[targetIndex];

    await Promise.all([
      fetch(`/api/admin/work-categories/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/work-categories/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    fetchRows();
  };

  const defaultRow = rows.find((r) => r.isDefault);
  const categoryRows = rows.filter((r) => !r.isDefault);

  return (
    <div className="max-w-6xl">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="mb-16">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">WORK PAGE</p>
        <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-white">
          Categories
        </h1>
      </div>

      {loading ? (
        <p className="text-white/30 text-xs tracking-widest">LOADING</p>
      ) : (
        <>
          {/* Default background — full-width hero row */}
          {defaultRow && (
            <div className="mb-20">
              <p className="text-[10px] tracking-[0.3em] text-white/40 mb-4">
                DEFAULT BACKGROUND
              </p>
              <div className="relative w-full aspect-[21/9] group overflow-hidden bg-white/[0.02]">
                {defaultRow.imageUrl ? (
                  isVideoUrl(defaultRow.imageUrl) ? (
                    <video
                      src={defaultRow.imageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <img
                      src={defaultRow.imageUrl}
                      alt="Default"
                      className="w-full h-full object-cover opacity-90"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs tracking-widest">
                    NO MEDIA SET
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-center justify-center">
                  <button
                    onClick={() => openUploadWidget(defaultRow.id)}
                    disabled={uploadingId === defaultRow.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[11px] tracking-[0.25em] text-white border-b border-white/40 pb-1 hover:border-white disabled:opacity-40"
                  >
                    {uploadingId === defaultRow.id ? "UPLOADING…" : "CHANGE MEDIA"}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.25em] text-white/50">
                  SHOWN BEFORE HOVER
                </div>
              </div>
            </div>
          )}

          {/* Categories header row */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] tracking-[0.3em] text-white/40">CATEGORIES</p>
            <button
              onClick={() => setShowAddForm((s) => !s)}
              className="text-[11px] tracking-[0.25em] text-white/60 hover:text-white transition"
            >
              {showAddForm ? "CANCEL" : "+ ADD CATEGORY"}
            </button>
          </div>

          {/* Add form — inline, minimal */}
          {showAddForm && (
            <div className="mb-10 pb-10 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] tracking-[0.25em] text-white/40 block mb-3">
                  TITLE
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Fashion Films"
                  autoFocus
                  className="w-full bg-transparent border-b border-white/20 py-2 text-lg font-extralight outline-none focus:border-white/60 transition placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.25em] text-white/40 block mb-3">
                  SUBTEXT — ONE TAG PER LINE
                </label>
                <textarea
                  value={newSubtext}
                  onChange={(e) => setNewSubtext(e.target.value)}
                  placeholder={"EDITORIAL\nCAMPAIGN\nLOOKBOOK"}
                  rows={3}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xs tracking-widest outline-none focus:border-white/60 transition resize-none placeholder:text-white/20"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={handleAddCategory}
                  disabled={adding || !newTitle.trim()}
                  className="text-[11px] tracking-[0.25em] text-black bg-white px-6 py-2.5 disabled:opacity-30 hover:bg-white/90 transition"
                >
                  {adding ? "CREATING…" : "CREATE CATEGORY"}
                </button>
              </div>
            </div>
          )}

          {/* Category cards */}
          {categoryRows.length === 0 ? (
            <p className="text-white/25 text-xs tracking-widest py-10">
              NO CATEGORIES YET
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
              {categoryRows.map((row, index) => (
                <div key={row.id} className="group">
                  {/* Media card */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.02] mb-4">
                    {row.imageUrl ? (
                      isVideoUrl(row.imageUrl) ? (
                        <video
                          src={row.imageUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500"
                        />
                      ) : (
                        <img
                          src={row.imageUrl}
                          alt={row.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs tracking-widest">
                        NO MEDIA SET
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-center justify-center">
                      <button
                        onClick={() => openUploadWidget(row.id)}
                        disabled={uploadingId === row.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[11px] tracking-[0.25em] text-white border-b border-white/40 pb-1 hover:border-white disabled:opacity-40"
                      >
                        {uploadingId === row.id ? "UPLOADING…" : "CHANGE MEDIA"}
                      </button>
                    </div>

                    {/* Reorder / delete controls */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <IconButton
                        onClick={() => moveCategory(index, "up")}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 6.5L5 2.5L9 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton
                        onClick={() => moveCategory(index, "down")}
                        disabled={index === categoryRows.length - 1}
                        title="Move down"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row.id)} title="Delete">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </IconButton>
                    </div>
                  </div>

                  {/* Editable title / subtext — minimal, underline only on focus */}
                  <input
                    defaultValue={row.title}
                    onBlur={(e) => handleTitleBlur(row.id, e.target.value)}
                    className="w-full bg-transparent text-base font-extralight tracking-tight outline-none border-b border-transparent focus:border-white/30 py-1 transition"
                  />
                  <textarea
                    defaultValue={row.subtext}
                    onBlur={(e) => handleSubtextBlur(row.id, e.target.value)}
                    rows={2}
                    placeholder="Subtext — one tag per line"
                    className="w-full bg-transparent text-[10px] tracking-[0.2em] text-white/40 outline-none border-b border-transparent focus:border-white/20 py-1 resize-none transition placeholder:text-white/15"
                  />
                  <p className="text-[9px] tracking-widest text-white/20 mt-1 font-mono">
                    /{row.slug}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}