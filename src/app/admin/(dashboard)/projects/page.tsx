"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { generateCloudinarySignature } from "@/lib/cloudinary-client";
import { isVideoUrl } from "@/lib/media";

type WorkCategoryRow = {
  id: string;
  slug: string;
  title: string;
  isDefault: boolean;
};

type GalleryImageRow = {
  id: string;
  projectId: string;
  imageUrl: string;
  publicId: string | null;
  colSpan: string;
  aspectRatio: string;
  order: number;
};

type WorkProjectRow = {
  id: string;
  categorySlug: string;
  title: string;
  categoryLabel: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  gifUrl: string | null;
  gifPublicId: string | null;
  heroImageUrl?: string | null;
  heroImagePublicId?: string | null;
  vimeoId: string;
  director: string;
  year: string;
  client: string;
  description: string;
  order: number;
};

const COL_SPAN_OPTIONS = [
  { label: "Full Width (12)", value: "col-span-12" },
  { label: "Half (6)", value: "col-span-12 md:col-span-6" },
  { label: "One-Third (4)", value: "col-span-12 md:col-span-4" },
  { label: "Two-Thirds (8)", value: "col-span-12 md:col-span-8" },
];

const ASPECT_RATIO_OPTIONS = [
  { label: "Widescreen (16:9)", value: "aspect-[16/9]" },
  { label: "Cinematic (21:8)", value: "aspect-[21/8]" },
  { label: "Standard (4:3)", value: "aspect-[4/3]" },
  { label: "Square (1:1)", value: "aspect-[1/1]" },
  { label: "Portrait (9:16)", value: "aspect-[9/16]" },
];

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

export default function ProjectsAdminPage() {
  const [categories, setCategories] = useState<WorkCategoryRow[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const [rows, setRows] = useState<WorkProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  // Bento Gallery modal state
  const [activeGalleryProject, setActiveGalleryProject] = useState<WorkProjectRow | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImageRow[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Load real categories from the Work Categories admin data
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const res = await fetch("/api/admin/work-categories");
    const data = await res.json();
    const list: WorkCategoryRow[] = Array.isArray(data)
      ? data.filter((c: WorkCategoryRow) => !c.isDefault)
      : [];
    setCategories(list);
    setCategoriesLoading(false);

    if (list.length > 0) {
      setActiveSlug((prev) => prev ?? list[0].slug);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchRows = useCallback(async (slug: string | null) => {
    if (!slug) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/work-projects?categorySlug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setRows(list.sort((a: WorkProjectRow, b: WorkProjectRow) => a.order - b.order));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows(activeSlug);
  }, [activeSlug, fetchRows]);

  const fetchGallery = useCallback(async (projectId: string) => {
    setGalleryLoading(true);
    const res = await fetch(`/api/admin/work-projects/${projectId}/gallery`);
    const data = await res.json();
    setGalleryImages(Array.isArray(data) ? data : []);
    setGalleryLoading(false);
  }, []);

  const openGalleryModal = (project: WorkProjectRow) => {
    setActiveGalleryProject(project);
    fetchGallery(project.id);
  };

  const closeGalleryModal = () => {
    setActiveGalleryProject(null);
    setGalleryImages([]);
  };

  const openGifUploadWidget = (id: string) => {
    setUploadingTarget(`${id}-gif`);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: false,
        folder: "work-projects/gifs",
        resourceType: "auto",
        clientAllowedFormats: ["gif", "webp", "png", "jpg", "jpeg", "mp4", "webm", "mov", "m4v"],
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          await fetch(`/api/admin/work-projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gifUrl: result.info.secure_url,
              gifPublicId: result.info.public_id,
            }),
          });
          fetchRows(activeSlug);
        }
        if (result?.event === "success" || error) {
          setUploadingTarget(null);
        }
      }
    );
    widget.open();
  };

  const openThumbnailUploadWidget = (id: string) => {
    setUploadingTarget(`${id}-thumb`);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: false,
        folder: "work-projects/thumbnails",
        resourceType: "auto",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "webm", "mov", "m4v"],
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          await fetch(`/api/admin/work-projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              thumbnailUrl: result.info.secure_url,
              thumbnailPublicId: result.info.public_id,
            }),
          });
          fetchRows(activeSlug);
        }
        if (result?.event === "success" || error) {
          setUploadingTarget(null);
        }
      }
    );
    widget.open();
  };

  const openGalleryUploadWidget = (projectId: string) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: true,
        folder: `work-projects/${projectId}/gallery`,
        resourceType: "auto",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "webm", "mov", "m4v"],
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          await fetch(`/api/admin/work-projects/${projectId}/gallery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: result.info.secure_url,
              publicId: result.info.public_id,
              colSpan: "col-span-12 md:col-span-6",
              aspectRatio: "aspect-[16/9]",
            }),
          });
          fetchGallery(projectId);
        }
      }
    );
    widget.open();
  };

  const updateGalleryItem = async (
    projectId: string,
    imageId: string,
    field: "colSpan" | "aspectRatio",
    value: string
  ) => {
    await fetch(`/api/admin/work-projects/${projectId}/gallery/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchGallery(projectId);
  };

  const deleteGalleryItem = async (projectId: string, imageId: string) => {
    await fetch(`/api/admin/work-projects/${projectId}/gallery/${imageId}`, {
      method: "DELETE",
    });
    fetchGallery(projectId);
  };

  const moveGalleryItem = async (projectId: string, index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const a = galleryImages[index];
    const b = galleryImages[targetIndex];

    await Promise.all([
      fetch(`/api/admin/work-projects/${projectId}/gallery/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/work-projects/${projectId}/gallery/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    fetchGallery(projectId);
  };

  const handleAddProject = async () => {
    if (!newTitle.trim() || !activeSlug) return;
    setAdding(true);
    await fetch("/api/admin/work-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categorySlug: activeSlug,
        title: newTitle.trim(),
        categoryLabel: newLabel.trim(),
      }),
    });
    setNewTitle("");
    setNewLabel("");
    setShowAddForm(false);
    setAdding(false);
    fetchRows(activeSlug);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await fetch(`/api/admin/work-projects/${id}`, { method: "DELETE" });
    fetchRows(activeSlug);
  };

  const handleFieldBlur = async (id: string, field: keyof WorkProjectRow, value: string) => {
    await fetch(`/api/admin/work-projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const a = rows[index];
    const b = rows[targetIndex];

    await Promise.all([
      fetch(`/api/admin/work-projects/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/work-projects/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    fetchRows(activeSlug);
  };

  return (
    <div className="max-w-6xl pb-24">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />

      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2">WORK PAGE</p>
        <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-white">
          Projects & Bento Galleries
        </h1>
      </div>

      {/* Category selector */}
      <div className="mb-12 pb-8 border-b border-white/10">
        {categoriesLoading ? (
          <p className="text-white/30 text-xs tracking-widest">LOADING CATEGORIES</p>
        ) : categories.length === 0 ? (
          <p className="text-white/40 text-xs tracking-widest">
            NO CATEGORIES YET — CREATE ONE ON THE{" "}
            <a href="/admin/work" className="underline hover:text-white transition">
              WORK CATEGORIES
            </a>{" "}
            PAGE FIRST
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
                className={`text-[11px] tracking-[0.2em] px-4 py-2 border transition ${
                  activeSlug === cat.slug
                    ? "border-white text-white"
                    : "border-white/15 text-white/40 hover:border-white/40 hover:text-white/70"
                }`}
              >
                {cat.title.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {activeSlug && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] tracking-[0.3em] text-white/40">
              PROJECTS — {categories.find((c) => c.slug === activeSlug)?.title.toUpperCase()}
            </p>
            <button
              onClick={() => setShowAddForm((s) => !s)}
              className="text-[11px] tracking-[0.25em] text-white/60 hover:text-white transition"
            >
              {showAddForm ? "CANCEL" : "+ ADD PROJECT"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-10 pb-10 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] tracking-[0.25em] text-white/40 block mb-3">
                  TITLE
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="STREET IS NOT A HOME"
                  autoFocus
                  className="w-full bg-transparent border-b border-white/20 py-2 text-lg font-extralight outline-none focus:border-white/60 transition placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.25em] text-white/40 block mb-3">
                  CATEGORY LABEL
                </label>
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="NARRATIVE"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xs tracking-widest outline-none focus:border-white/60 transition placeholder:text-white/20"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={handleAddProject}
                  disabled={adding || !newTitle.trim()}
                  className="text-[11px] tracking-[0.25em] text-black bg-white px-6 py-2.5 disabled:opacity-30 hover:bg-white/90 transition"
                >
                  {adding ? "CREATING…" : "CREATE PROJECT"}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-white/30 text-xs tracking-widest">LOADING</p>
          ) : rows.length === 0 ? (
            <p className="text-white/25 text-xs tracking-widest py-10">
              NO PROJECTS YET FOR THIS CATEGORY
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {rows.map((row, index) => (
                <div key={row.id} className="group border border-white/10 p-4 rounded bg-white/[0.015]">
                  {/* Action bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-white/30">
                      #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <IconButton onClick={() => moveProject(index, "up")} disabled={index === 0} title="Move up">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 6.5L5 2.5L9 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton onClick={() => moveProject(index, "down")} disabled={index === rows.length - 1} title="Move down">
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

                  {/* 1. Center GIF / Video */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] tracking-[0.25em] text-white/40 uppercase">
                        Center Media (GIF / MP4)
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03] rounded-sm group/media">
                      {row.gifUrl ? (
                        isVideoUrl(row.gifUrl) ? (
                          <video
                            src={row.gifUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-90 group-hover/media:opacity-100 transition duration-500"
                          />
                        ) : (
                          <img
                            src={row.gifUrl}
                            alt={`${row.title} Media`}
                            className="w-full h-full object-cover opacity-90 group-hover/media:opacity-100 transition duration-500"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] tracking-widest">
                          NO MEDIA SET
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/60 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => openGifUploadWidget(row.id)}
                          disabled={uploadingTarget === `${row.id}-gif`}
                          className="opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 text-[10px] tracking-[0.2em] text-white border-b border-white/40 pb-0.5 hover:border-white disabled:opacity-40"
                        >
                          {uploadingTarget === `${row.id}-gif` ? "UPLOADING…" : row.gifUrl ? "CHANGE MEDIA" : "+ UPLOAD MEDIA"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Sidebar Thumbnail */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] tracking-[0.25em] text-white/40 uppercase">
                        Sidebar Thumbnail (Image / Video)
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03] rounded-sm group/thumb">
                      {row.thumbnailUrl ? (
                        isVideoUrl(row.thumbnailUrl) ? (
                          <video
                            src={row.thumbnailUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 transition duration-500"
                          />
                        ) : (
                          <img
                            src={row.thumbnailUrl}
                            alt={`${row.title} Thumbnail`}
                            className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 transition duration-500"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] tracking-widest">
                          NO THUMBNAIL SET
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/60 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => openThumbnailUploadWidget(row.id)}
                          disabled={uploadingTarget === `${row.id}-thumb`}
                          className="opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 text-[10px] tracking-[0.2em] text-white border-b border-white/40 pb-0.5 hover:border-white disabled:opacity-40"
                        >
                          {uploadingTarget === `${row.id}-thumb` ? "UPLOADING…" : row.thumbnailUrl ? "CHANGE THUMBNAIL" : "+ UPLOAD THUMBNAIL"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bento Box Gallery Manager Trigger */}
                  <div className="mb-4 pt-1">
                    <button
                      onClick={() => openGalleryModal(row)}
                      className="w-full py-2 px-3 border border-white/20 hover:border-white/60 text-[10px] tracking-[0.2em] text-white/80 hover:text-white uppercase transition flex items-center justify-between rounded-sm bg-white/[0.02]"
                    >
                      <span>🍱 Bento Box Gallery</span>
                      <span className="font-mono text-xs">→</span>
                    </button>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div>
                      <label className="text-[9px] tracking-[0.2em] text-white/30 block">TITLE</label>
                      <input
                        defaultValue={row.title}
                        onBlur={(e) => handleFieldBlur(row.id, "title", e.target.value)}
                        className="w-full bg-transparent text-sm font-light tracking-tight outline-none border-b border-white/10 focus:border-white/40 py-1 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] tracking-[0.2em] text-white/30 block">LABEL</label>
                        <input
                          defaultValue={row.categoryLabel}
                          onBlur={(e) => handleFieldBlur(row.id, "categoryLabel", e.target.value)}
                          placeholder="e.g. NARRATIVE"
                          className="w-full bg-transparent text-[10px] tracking-[0.15em] text-white/60 outline-none border-b border-white/10 focus:border-white/30 py-1 transition placeholder:text-white/15"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-[0.2em] text-white/30 block">YEAR</label>
                        <input
                          defaultValue={row.year}
                          onBlur={(e) => handleFieldBlur(row.id, "year", e.target.value)}
                          placeholder="2024"
                          className="w-full bg-transparent text-[10px] tracking-[0.15em] text-white/60 outline-none border-b border-white/10 focus:border-white/30 py-1 transition placeholder:text-white/15"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] tracking-[0.2em] text-white/30 block">DIRECTOR</label>
                        <input
                          defaultValue={row.director}
                          onBlur={(e) => handleFieldBlur(row.id, "director", e.target.value)}
                          placeholder="Director name"
                          className="w-full bg-transparent text-[10px] tracking-[0.15em] text-white/60 outline-none border-b border-white/10 focus:border-white/30 py-1 transition placeholder:text-white/15"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-[0.2em] text-white/30 block">CLIENT</label>
                        <input
                          defaultValue={row.client}
                          onBlur={(e) => handleFieldBlur(row.id, "client", e.target.value)}
                          placeholder="Client name"
                          className="w-full bg-transparent text-[10px] tracking-[0.15em] text-white/60 outline-none border-b border-white/10 focus:border-white/30 py-1 transition placeholder:text-white/15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] tracking-[0.2em] text-white/30 block">YOUTUBE (URL OR ID)</label>
                      <input
                        defaultValue={row.vimeoId}
                        onBlur={(e) => handleFieldBlur(row.id, "vimeoId", e.target.value)}
                        placeholder="e.g. https://youtu.be/... or YouTube Video ID"
                        className="w-full bg-transparent text-[10px] tracking-[0.15em] text-white/50 outline-none border-b border-white/10 focus:border-white/30 py-1 font-mono transition placeholder:text-white/15"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] tracking-[0.2em] text-white/30 block">DESCRIPTION</label>
                      <textarea
                        defaultValue={row.description}
                        onBlur={(e) => handleFieldBlur(row.id, "description", e.target.value)}
                        placeholder="Cinematic description of the project..."
                        rows={2}
                        className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-white/10 focus:border-white/30 py-1 transition placeholder:text-white/15 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* BENTO BOX GALLERY MODAL */}
      {activeGalleryProject && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex justify-center items-center p-4 sm:p-8">
          <div className="bg-zinc-950 border border-white/20 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  BENTO BOX GALLERY MANAGER
                </p>
                <h2 className="text-xl font-light text-white tracking-tight mt-1">
                  {activeGalleryProject.title}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => openGalleryUploadWidget(activeGalleryProject.id)}
                  className="text-xs tracking-[0.2em] px-4 py-2 bg-white text-black font-medium hover:bg-white/90 transition rounded-sm uppercase"
                >
                  + Upload Cloudinary Pics
                </button>
                <button
                  onClick={closeGalleryModal}
                  className="text-white/60 hover:text-white text-sm font-mono tracking-widest"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {galleryLoading ? (
                <p className="text-white/30 text-xs tracking-widest text-center py-12">
                  LOADING GALLERY…
                </p>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/30 text-xs tracking-widest mb-4">
                    NO PICTURES IN THIS BENTO BOX YET
                  </p>
                  <button
                    onClick={() => openGalleryUploadWidget(activeGalleryProject.id)}
                    className="text-xs tracking-[0.2em] px-5 py-2.5 border border-white/30 text-white hover:border-white transition uppercase"
                  >
                    + Upload First Pictures
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
                      {galleryImages.length} Image{galleryImages.length > 1 ? "s" : ""} — Change Width & Ratio to customize the Bento layout:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="border border-white/10 p-3 rounded bg-white/[0.02] flex flex-col justify-between"
                      >
                        <div>
                          {/* Image/Video preview */}
                          <div className={`relative w-full ${img.aspectRatio} overflow-hidden rounded-sm bg-black mb-3 border border-white/5`}>
                            {isVideoUrl(img.imageUrl) ? (
                              <video
                                src={img.imageUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={img.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                            <span className="absolute top-2 left-2 bg-black/70 text-[9px] font-mono px-1.5 py-0.5 rounded text-white/80">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Quick Layout Presets */}
                          <div className="mb-3">
                            <label className="text-[8px] tracking-[0.2em] text-white/40 block mb-1.5">
                              QUICK LAYOUT PRESETS
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/admin/work-projects/${activeGalleryProject.id}/gallery/${img.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ colSpan: "col-span-12", aspectRatio: "aspect-[21/8]" }),
                                  });
                                  fetchGallery(activeGalleryProject.id);
                                }}
                                className={`text-[9px] py-1 px-2 border text-center transition rounded-sm ${
                                  img.colSpan === "col-span-12" && (img.aspectRatio === "aspect-[21/8]" || img.aspectRatio === "aspect-[16/9]")
                                    ? "border-white bg-white text-black font-semibold"
                                    : "border-white/20 text-white/70 hover:border-white/50"
                                }`}
                              >
                                🖥️ Full Top (12)
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/admin/work-projects/${activeGalleryProject.id}/gallery/${img.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ colSpan: "col-span-12 md:col-span-6", aspectRatio: "aspect-[16/9]" }),
                                  });
                                  fetchGallery(activeGalleryProject.id);
                                }}
                                className={`text-[9px] py-1 px-2 border text-center transition rounded-sm ${
                                  img.colSpan === "col-span-12 md:col-span-6"
                                    ? "border-white bg-white text-black font-semibold"
                                    : "border-white/20 text-white/70 hover:border-white/50"
                                }`}
                              >
                                🌓 Half (6)
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/admin/work-projects/${activeGalleryProject.id}/gallery/${img.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ colSpan: "col-span-12 md:col-span-4", aspectRatio: "aspect-[16/9]" }),
                                  });
                                  fetchGallery(activeGalleryProject.id);
                                }}
                                className={`text-[9px] py-1 px-2 border text-center transition rounded-sm ${
                                  img.colSpan === "col-span-12 md:col-span-4" && img.aspectRatio === "aspect-[16/9]"
                                    ? "border-white bg-white text-black font-semibold"
                                    : "border-white/20 text-white/70 hover:border-white/50"
                                }`}
                              >
                                🔲 1/3 Grid (4)
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/admin/work-projects/${activeGalleryProject.id}/gallery/${img.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ colSpan: "col-span-12 md:col-span-4", aspectRatio: "aspect-[9/16]" }),
                                  });
                                  fetchGallery(activeGalleryProject.id);
                                }}
                                className={`text-[9px] py-1 px-2 border text-center transition rounded-sm ${
                                  img.aspectRatio === "aspect-[9/16]"
                                    ? "border-white bg-white text-black font-semibold"
                                    : "border-white/20 text-white/70 hover:border-white/50"
                                }`}
                              >
                                📱 Portrait (9:16)
                              </button>
                            </div>
                          </div>

                          {/* Detailed Layout Dropdowns */}
                          <div className="space-y-2">
                            <div>
                              <label className="text-[8px] tracking-[0.2em] text-white/40 block mb-1">
                                GRID WIDTH (COLUMNS)
                              </label>
                              <select
                                value={img.colSpan}
                                onChange={(e) =>
                                  updateGalleryItem(
                                    activeGalleryProject.id,
                                    img.id,
                                    "colSpan",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-zinc-900 border border-white/15 text-xs text-white px-2 py-1.5 rounded outline-none focus:border-white/50"
                              >
                                {COL_SPAN_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[8px] tracking-[0.2em] text-white/40 block mb-1">
                                ASPECT RATIO
                              </label>
                              <select
                                value={img.aspectRatio}
                                onChange={(e) =>
                                  updateGalleryItem(
                                    activeGalleryProject.id,
                                    img.id,
                                    "aspectRatio",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-zinc-900 border border-white/15 text-xs text-white px-2 py-1.5 rounded outline-none focus:border-white/50"
                              >
                                {ASPECT_RATIO_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                          <div className="flex gap-1.5">
                            <IconButton
                              onClick={() => moveGalleryItem(activeGalleryProject.id, idx, "up")}
                              disabled={idx === 0}
                              title="Move left"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M6.5 1L2.5 5L6.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </IconButton>
                            <IconButton
                              onClick={() => moveGalleryItem(activeGalleryProject.id, idx, "down")}
                              disabled={idx === galleryImages.length - 1}
                              title="Move right"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M3.5 1L7.5 5L3.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </IconButton>
                          </div>
                          <button
                            onClick={() => deleteGalleryItem(activeGalleryProject.id, img.id)}
                            className="text-[9px] tracking-[0.2em] text-red-400 hover:text-red-300 uppercase transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}