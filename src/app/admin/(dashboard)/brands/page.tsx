"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Script from "next/script";
import { generateCloudinarySignature } from "@/lib/cloudinary-client";
import {
  Tag,
  Users,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Move,
  Layout,
  Save,
  RotateCcw,
  Layers,
  Eye,
} from "lucide-react";

interface BrandLogo {
  id: string;
  name: string;
  imageUrl: string;
  publicId?: string | null;
  order: number;
  posX?: number | null;
  posY?: number | null;
}

interface Artist {
  id: string;
  name: string;
  order: number;
  posX?: number | null;
  posY?: number | null;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function BrandsAdminPage() {
  const [tab, setTab] = useState<"canvas" | "logos" | "artists">("canvas");

  // Data state
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  // Logo Form state
  const [newLogoName, setNewLogoName] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [newLogoPublicId, setNewLogoPublicId] = useState("");
  const [showAddLogoModal, setShowAddLogoModal] = useState(false);
  const [editingLogo, setEditingLogo] = useState<BrandLogo | null>(null);

  // Artist Form state
  const [newArtistInput, setNewArtistInput] = useState("");
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [editingArtistName, setEditingArtistName] = useState("");

  // Canvas / Drag state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasItems, setCanvasItems] = useState<
    Array<{
      id: string;
      type: "logo" | "artist";
      name: string;
      image?: string;
      x: number; // percentage 0 - 100
      y: number; // percentage 0 - 100
    }>
  >([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [canvasFilter, setCanvasFilter] = useState<"all" | "logos" | "artists">("all");
  const [hasUnsavedCanvas, setHasUnsavedCanvas] = useState(false);

  // Saving / feedback state
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [seeding, setSeeding] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  /* ----------------------------------------------------
   * FETCH DATA
   * ---------------------------------------------------- */
  const fetchLogos = useCallback(async () => {
    try {
      setLoadingLogos(true);
      const res = await fetch("/api/admin/brands/logos");
      if (res.ok) {
        const data = await res.json();
        setLogos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogos(false);
    }
  }, []);

  const fetchArtists = useCallback(async () => {
    try {
      setLoadingArtists(true);
      const res = await fetch("/api/admin/brands/artists");
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingArtists(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
    fetchArtists();
  }, [fetchLogos, fetchArtists]);

  // Sync canvas items when logos or artists are fetched
  useEffect(() => {
    const items: Array<{
      id: string;
      type: "logo" | "artist";
      name: string;
      image?: string;
      x: number;
      y: number;
    }> = [];

    // Calculate initial grid positions if not set
    logos.forEach((logo, idx) => {
      const defaultX = 15 + (idx % 4) * 22;
      const defaultY = 18 + Math.floor(idx / 4) * 16;
      items.push({
        id: logo.id,
        type: "logo",
        name: logo.name,
        image: logo.imageUrl,
        x: typeof logo.posX === "number" ? logo.posX : defaultX,
        y: typeof logo.posY === "number" ? logo.posY : defaultY,
      });
    });

    artists.forEach((artist, idx) => {
      const defaultX = 12 + (idx % 5) * 18;
      const defaultY = 55 + Math.floor(idx / 5) * 10;
      items.push({
        id: artist.id,
        type: "artist",
        name: artist.name,
        x: typeof artist.posX === "number" ? artist.posX : defaultX,
        y: typeof artist.posY === "number" ? artist.posY : defaultY,
      });
    });

    setCanvasItems(items);
    setHasUnsavedCanvas(false);
  }, [logos, artists]);

  /* ----------------------------------------------------
   * CLOUDINARY UPLOAD WIDGET
   * ---------------------------------------------------- */
  const openUploadWidget = (isEditing = false) => {
    if (!window.cloudinary) {
      showToast("Cloudinary widget is still loading. Please try again.", "error");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateCloudinarySignature,
        multiple: false,
        folder: "brands",
      },
      async (error: any, result: any) => {
        if (!error && result.event === "success") {
          const url = result.info.secure_url;
          const publicId = result.info.public_id;
          const originalName = result.info.original_filename || "";

          if (isEditing && editingLogo) {
            setEditingLogo({ ...editingLogo, imageUrl: url, publicId });
          } else {
            setNewLogoUrl(url);
            setNewLogoPublicId(publicId);
            if (!newLogoName) {
              const suggested = originalName
                .replace(/[-_]/g, " ")
                .replace(/\blogo\b/gi, "")
                .trim()
                .toUpperCase();
              setNewLogoName(suggested || "BRAND");
            }
          }
        }
      }
    );
    widget.open();
  };

  /* ----------------------------------------------------
   * CANVAS DRAGGING & PLACEMENT LOGIC
   * ---------------------------------------------------- */
  const handlePointerDown = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setActiveDragId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragId !== id || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    let yPercent = ((clientY - rect.top) / rect.height) * 100;

    // Clamp coordinates safely within canvas
    xPercent = Math.max(4, Math.min(96, Number(xPercent.toFixed(1))));
    yPercent = Math.max(6, Math.min(94, Number(yPercent.toFixed(1))));

    setCanvasItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x: xPercent, y: yPercent } : item))
    );
    setHasUnsavedCanvas(true);
  };

  const handlePointerUp = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragId === id) {
      setActiveDragId(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const saveCanvasPositions = async () => {
    setSavingCanvas(true);
    try {
      const logoItems = canvasItems
        .filter((item) => item.type === "logo")
        .map((item) => ({
          id: item.id,
          posX: item.x,
          posY: item.y,
        }));

      const artistItems = canvasItems
        .filter((item) => item.type === "artist")
        .map((item) => ({
          id: item.id,
          posX: item.x,
          posY: item.y,
        }));

      await Promise.all([
        fetch("/api/admin/brands/logos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: logoItems }),
        }),
        fetch("/api/admin/brands/artists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: artistItems }),
        }),
      ]);

      setHasUnsavedCanvas(false);
      showToast("Screen placement coordinates saved!");
      fetchLogos();
      fetchArtists();
    } catch {
      showToast("Failed to save screen layout", "error");
    } finally {
      setSavingCanvas(false);
    }
  };

  const resetToFlowLayout = async () => {
    if (!confirm("Clear custom screen coordinates and revert to automatic responsive layout?")) {
      return;
    }

    setSavingCanvas(true);
    try {
      const logoItems = logos.map((l) => ({ id: l.id, posX: null, posY: null }));
      const artistItems = artists.map((a) => ({ id: a.id, posX: null, posY: null }));

      await Promise.all([
        fetch("/api/admin/brands/logos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: logoItems }),
        }),
        fetch("/api/admin/brands/artists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: artistItems }),
        }),
      ]);

      showToast("Reverted to automatic flow layout");
      fetchLogos();
      fetchArtists();
    } catch {
      showToast("Error resetting layout", "error");
    } finally {
      setSavingCanvas(false);
    }
  };

  /* ----------------------------------------------------
   * BRAND LOGOS HANDLERS
   * ---------------------------------------------------- */
  const handleCreateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogoName.trim() || !newLogoUrl.trim()) {
      showToast("Please provide both Brand Name and Image URL", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/brands/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLogoName.trim(),
          imageUrl: newLogoUrl.trim(),
          publicId: newLogoPublicId || null,
        }),
      });

      if (res.ok) {
        setNewLogoName("");
        setNewLogoUrl("");
        setNewLogoPublicId("");
        setShowAddLogoModal(false);
        showToast("Brand logo added successfully");
        fetchLogos();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add brand logo", "error");
      }
    } catch {
      showToast("Error adding brand logo", "error");
    }
  };

  const handleUpdateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo || !editingLogo.name.trim() || !editingLogo.imageUrl.trim()) return;

    try {
      const res = await fetch(`/api/admin/brands/logos/${editingLogo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingLogo.name.trim(),
          imageUrl: editingLogo.imageUrl.trim(),
          publicId: editingLogo.publicId,
          posX: editingLogo.posX,
          posY: editingLogo.posY,
        }),
      });

      if (res.ok) {
        setEditingLogo(null);
        showToast("Brand logo updated");
        fetchLogos();
      } else {
        showToast("Failed to update logo", "error");
      }
    } catch {
      showToast("Error updating logo", "error");
    }
  };

  const handleDeleteLogo = async (logo: BrandLogo) => {
    if (!confirm(`Are you sure you want to delete "${logo.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands/logos/${logo.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Deleted "${logo.name}"`);
        fetchLogos();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Error deleting brand logo", "error");
    }
  };

  const moveLogo = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= logos.length) return;

    const reordered = [...logos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const items = reordered.map((item, idx) => ({ id: item.id, order: idx }));
    setLogos(reordered.map((item, idx) => ({ ...item, order: idx })));

    setSavingOrder(true);
    try {
      await fetch("/api/admin/brands/logos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      showToast("Logo placement updated");
    } catch {
      showToast("Failed to save order", "error");
      fetchLogos();
    } finally {
      setSavingOrder(false);
    }
  };

  /* ----------------------------------------------------
   * ARTISTS HANDLERS
   * ---------------------------------------------------- */
  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistInput.trim()) return;

    const names = newArtistInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/brands/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(names.length > 1 ? { names } : { name: names[0] }),
      });

      if (res.ok) {
        setNewArtistInput("");
        showToast(names.length > 1 ? `Added ${names.length} artists` : "Artist added");
        fetchArtists();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add artist", "error");
      }
    } catch {
      showToast("Error adding artist", "error");
    }
  };

  const handleUpdateArtist = async (id: string) => {
    if (!editingArtistName.trim()) return;

    try {
      const res = await fetch(`/api/admin/brands/artists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingArtistName.trim() }),
      });

      if (res.ok) {
        setEditingArtistId(null);
        setEditingArtistName("");
        showToast("Artist updated");
        fetchArtists();
      } else {
        showToast("Failed to update artist", "error");
      }
    } catch {
      showToast("Error updating artist", "error");
    }
  };

  const handleDeleteArtist = async (artist: Artist) => {
    if (!confirm(`Delete artist "${artist.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands/artists/${artist.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Deleted "${artist.name}"`);
        fetchArtists();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Error deleting artist", "error");
    }
  };

  const moveArtist = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= artists.length) return;

    const reordered = [...artists];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const items = reordered.map((item, idx) => ({ id: item.id, order: idx }));
    setArtists(reordered.map((item, idx) => ({ ...item, order: idx })));

    setSavingOrder(true);
    try {
      await fetch("/api/admin/brands/artists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      showToast("Artist placement updated");
    } catch {
      showToast("Failed to save artist order", "error");
      fetchArtists();
    } finally {
      setSavingOrder(false);
    }
  };

  /* ----------------------------------------------------
   * SEED DEFAULT DATA
   * ---------------------------------------------------- */
  const handleSeedDefaults = async () => {
    if (
      !confirm(
        "Import default Brand Logos and Artist names from template? This adds missing items into the database."
      )
    ) {
      return;
    }

    setSeeding(true);
    try {
      const res = await fetch("/api/admin/brands/seed", { method: "POST" });
      const data = await res.json();
      showToast(`Imported ${data.addedLogos} logos and ${data.addedArtists} artists`);
      fetchLogos();
      fetchArtists();
    } catch {
      showToast("Error seeding default data", "error");
    } finally {
      setSeeding(false);
    }
  };

  const visibleCanvasItems = canvasItems.filter((item) => {
    if (canvasFilter === "logos") return item.type === "logo";
    if (canvasFilter === "artists") return item.type === "artist";
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-24 text-white select-none">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />

      {/* TOAST NOTIFICATION */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg border text-sm font-medium shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/90 border-red-500/50 text-red-200"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands & Artists Placement</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Drag items anywhere on the interactive screen canvas to place them exactly where you want on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/brands"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono tracking-wider uppercase rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
          >
            <Eye size={14} />
            <span>View Public Page</span>
          </a>

          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono tracking-wider uppercase rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition disabled:opacity-50"
            title="Import default sample brands & artists if empty"
          >
            <Sparkles size={14} className={seeding ? "animate-spin" : ""} />
            <span>{seeding ? "Importing…" : "Import Defaults"}</span>
          </button>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("canvas")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "canvas"
                ? "border-white text-white font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Move size={16} />
            <span>Visual Screen Canvas (Drag & Place)</span>
            {hasUnsavedCanvas && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
            )}
          </button>

          <button
            onClick={() => setTab("logos")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "logos"
                ? "border-white text-white font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Tag size={16} />
            <span>Brand Logos List</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-white/10 text-zinc-300">
              {logos.length}
            </span>
          </button>

          <button
            onClick={() => setTab("artists")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "artists"
                ? "border-white text-white font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users size={16} />
            <span>Artists List</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-white/10 text-zinc-300">
              {artists.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB: VISUAL SCREEN CANVAS (DRAG & DROP POSITIONING) */}
      {/* ============================================================ */}
      {tab === "canvas" && (
        <div className="space-y-4">
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-white/10 p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setCanvasFilter("all")}
                className={`px-3 py-1 text-xs rounded-md transition font-medium ${
                  canvasFilter === "all"
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                All ({canvasItems.length})
              </button>
              <button
                type="button"
                onClick={() => setCanvasFilter("logos")}
                className={`px-3 py-1 text-xs rounded-md transition font-medium ${
                  canvasFilter === "logos"
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Logos ({logos.length})
              </button>
              <button
                type="button"
                onClick={() => setCanvasFilter("artists")}
                className={`px-3 py-1 text-xs rounded-md transition font-medium ${
                  canvasFilter === "artists"
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                Artists ({artists.length})
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetToFlowLayout}
                disabled={savingCanvas}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-white/15 rounded-lg hover:bg-white/5 transition"
                title="Reset custom coordinates to automatic responsive flow layout"
              >
                <RotateCcw size={13} />
                <span>Reset Flow Layout</span>
              </button>

              <button
                type="button"
                onClick={saveCanvasPositions}
                disabled={savingCanvas}
                className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-lg ${
                  hasUnsavedCanvas
                    ? "bg-amber-400 text-black hover:bg-amber-300 animate-pulse"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                <Save size={14} />
                <span>{savingCanvas ? "Saving Placements…" : hasUnsavedCanvas ? "Save Changes" : "Saved"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Canvas */}
          <div className="relative border border-white/15 rounded-2xl overflow-hidden shadow-2xl bg-[#0b0b0b]">
            {/* Aspect container (16:10 ratio like public layout) */}
            <div
              ref={canvasRef}
              className="relative w-full aspect-[16/9] min-h-[520px] max-h-[75vh] overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 50%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 40px 40px, 40px 40px",
              }}
            >
              {/* Center divider line simulation */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/[0.04] pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/[0.04] pointer-events-none" />

              {/* Watermark instructions */}
              <div className="absolute top-4 left-4 pointer-events-none z-0">
                <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase block">
                  ✦ Screen Viewport Canvas
                </span>
                <span className="text-[10px] text-white/20 block mt-0.5">
                  Click and drag any brand or artist sticker to place it on the screen
                </span>
              </div>

              {/* Draggable items */}
              {visibleCanvasItems.map((item) => {
                const isDragging = activeDragId === item.id;

                return (
                  <div
                    key={item.id}
                    onPointerDown={(e) => handlePointerDown(item.id, e)}
                    onPointerMove={(e) => handlePointerMove(item.id, e)}
                    onPointerUp={(e) => handlePointerUp(item.id, e)}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) scale(${isDragging ? 1.08 : 1})`,
                      zIndex: isDragging ? 50 : 20,
                    }}
                    className={`absolute cursor-grab active:cursor-grabbing group transition-transform duration-75 ${
                      isDragging ? "shadow-2xl ring-2 ring-white/70" : ""
                    }`}
                  >
                    {item.type === "logo" ? (
                      /* BRAND LOGO CARD */
                      <div className="flex flex-col items-center">
                        <div
                          className="bg-black/90 border border-white/30 hover:border-white/80 p-2.5 rounded-lg shadow-lg flex items-center justify-center transition-colors"
                          style={{
                            minWidth: 80,
                            minHeight: 46,
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              draggable={false}
                              className="max-h-8 max-w-[90px] object-contain filter brightness-0 invert pointer-events-none"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white tracking-widest pointer-events-none">
                              {item.name}
                            </span>
                          )}
                        </div>

                        {/* Coordinates pill */}
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 border border-white/20 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300 pointer-events-none whitespace-nowrap">
                          {item.name} ({item.x}%, {item.y}%)
                        </div>
                      </div>
                    ) : (
                      /* ARTIST STICKER CARD */
                      <div className="flex flex-col items-center">
                        <div className="bg-black/80 hover:bg-black border border-white/25 hover:border-white/80 px-3 py-1.5 rounded-md shadow-lg transition-colors flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                          <span className="font-sans font-black text-xs md:text-sm text-white tracking-wide uppercase pointer-events-none">
                            {item.name}
                          </span>
                        </div>

                        {/* Coordinates pill */}
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 border border-white/20 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300 pointer-events-none whitespace-nowrap">
                          {item.x}%, {item.y}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: BRAND LOGOS LIST */}
      {/* ============================================================ */}
      {tab === "logos" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-white/10 p-4 rounded-xl">
            <div className="text-sm text-zinc-400">
              <span className="font-semibold text-white">Brand Logos Management:</span> Upload logo images, rename brands, or reposition display order.
            </div>

            <button
              type="button"
              onClick={() => {
                setNewLogoName("");
                setNewLogoUrl("");
                setNewLogoPublicId("");
                setShowAddLogoModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition shrink-0"
            >
              <Plus size={16} />
              <span>Add Brand Logo</span>
            </button>
          </div>

          {loadingLogos ? (
            <div className="py-16 text-center text-sm text-zinc-500 flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading brand logos…</span>
            </div>
          ) : logos.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/15 rounded-xl p-8 space-y-3">
              <ImageIcon size={32} className="mx-auto text-zinc-600" />
              <p className="text-zinc-400 text-sm">No brand logos in database yet.</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAddLogoModal(true)}
                  className="px-4 py-2 text-xs bg-white text-black font-semibold rounded-lg hover:bg-zinc-200"
                >
                  Upload First Logo
                </button>
                <button
                  onClick={handleSeedDefaults}
                  className="px-4 py-2 text-xs border border-white/20 text-white rounded-lg hover:bg-white/10"
                >
                  Import Defaults
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logos.map((logo, index) => (
                <div
                  key={logo.id}
                  className="group relative bg-zinc-950/80 border border-white/10 hover:border-white/25 rounded-xl p-4 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Top bar: placement badge and reorder buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white tracking-wide truncate max-w-[150px]">
                        {logo.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => moveLogo(index, "up")}
                        disabled={index === 0 || savingOrder}
                        title="Move Earlier in Order"
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLogo(index, "down")}
                        disabled={index === logos.length - 1 || savingOrder}
                        title="Move Later in Order"
                        className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Logo Preview Container with Invert Simulation */}
                  <div className="relative h-28 w-full bg-zinc-900/90 rounded-lg flex items-center justify-center p-3 border border-white/5 overflow-hidden group/preview">
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className="max-h-16 max-w-full object-contain filter brightness-0 invert opacity-95 transition-transform group-hover/preview:scale-105"
                    />
                    {typeof logo.posX === "number" && typeof logo.posY === "number" && (
                      <span className="absolute bottom-1 left-2 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                        Pos: {logo.posX}%, {logo.posY}%
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[180px]">
                      {logo.imageUrl.split("/").pop()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingLogo(logo)}
                        className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition text-xs flex items-center gap-1"
                        title="Edit brand logo"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLogo(logo)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-200 transition text-xs flex items-center gap-1"
                        title="Delete brand logo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: ARTISTS LIST */}
      {/* ============================================================ */}
      {tab === "artists" && (
        <div className="space-y-6">
          {/* Quick Add Artist Form */}
          <form
            onSubmit={handleAddArtist}
            className="bg-zinc-900/60 border border-white/10 p-4 sm:p-5 rounded-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label htmlFor="artistInput" className="text-sm font-semibold text-white">
                Add New Artist
              </label>
              <span className="text-xs text-zinc-400">
                Tip: Enter multiple names separated by commas (e.g. <i>Artist A, Artist B</i>)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="artistInput"
                type="text"
                value={newArtistInput}
                onChange={(e) => setNewArtistInput(e.target.value)}
                placeholder="e.g. Shushant KC or Sajjan Raj Vaidya, Albatross..."
                className="flex-1 bg-black/70 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
              />
              <button
                type="submit"
                disabled={!newArtistInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition disabled:opacity-40 shrink-0"
              >
                <Plus size={16} />
                <span>Add Artist</span>
              </button>
            </div>
          </form>

          {/* Artists List */}
          {loadingArtists ? (
            <div className="py-16 text-center text-sm text-zinc-500 flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading artists…</span>
            </div>
          ) : artists.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/15 rounded-xl p-8 space-y-3">
              <Users size={32} className="mx-auto text-zinc-600" />
              <p className="text-zinc-400 text-sm">No artists in database yet.</p>
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 text-xs border border-white/20 text-white rounded-lg hover:bg-white/10"
              >
                Import Defaults
              </button>
            </div>
          ) : (
            <div className="bg-zinc-950/80 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
              <div className="px-4 py-3 bg-zinc-900/50 flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <span>Placement & Artist Name</span>
                <span>Actions</span>
              </div>

              {artists.map((artist, index) => {
                const isEditing = editingArtistId === artist.id;

                return (
                  <div
                    key={artist.id}
                    className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-mono text-xs text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                        #{index + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input
                            type="text"
                            value={editingArtistName}
                            onChange={(e) => setEditingArtistName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateArtist(artist.id);
                              if (e.key === "Escape") setEditingArtistId(null);
                            }}
                            className="bg-black border border-white/30 rounded px-2.5 py-1 text-sm text-white w-full focus:outline-none focus:border-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateArtist(artist.id)}
                            className="p-1 rounded bg-white text-black hover:bg-zinc-200"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingArtistId(null)}
                            className="p-1 rounded border border-white/20 text-zinc-400 hover:text-white"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white tracking-wide">
                            {artist.name}
                          </span>
                          {typeof artist.posX === "number" && typeof artist.posY === "number" && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                              Pos: {artist.posX}%, {artist.posY}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10">
                        <button
                          type="button"
                          onClick={() => moveArtist(index, "up")}
                          disabled={index === 0 || savingOrder}
                          title="Move Earlier in Placement"
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveArtist(index, "down")}
                          disabled={index === artists.length - 1 || savingOrder}
                          title="Move Later in Placement"
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-20"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArtistId(artist.id);
                            setEditingArtistName(artist.name);
                          }}
                          className="p-1.5 rounded border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                          title="Edit name"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteArtist(artist)}
                        className="p-1.5 rounded border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-200 transition"
                        title="Delete artist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD BRAND LOGO */}
      {/* ============================================================ */}
      {showAddLogoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Add Brand Logo</h2>
              <button
                type="button"
                onClick={() => setShowAddLogoModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLogo} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={newLogoName}
                  onChange={(e) => setNewLogoName(e.target.value)}
                  placeholder="e.g. ADIDAS, NIKE, SAMSUNG..."
                  required
                  className="w-full bg-black/80 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Upload Logo via Cloudinary
                </label>
                <button
                  type="button"
                  onClick={() => openUploadWidget(false)}
                  className="w-full border border-dashed border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition text-zinc-300 hover:text-white"
                >
                  <Upload size={20} />
                  <span className="text-xs font-medium">Click to upload logo image</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Or Paste Image URL directly
                </label>
                <input
                  type="text"
                  value={newLogoUrl}
                  onChange={(e) => setNewLogoUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or /Adidas_Logo.png"
                  required
                  className="w-full bg-black/80 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              {newLogoUrl && (
                <div className="bg-zinc-900 p-3 rounded-lg flex items-center justify-center border border-white/10">
                  <img
                    src={newLogoUrl}
                    alt="Preview"
                    className="max-h-14 max-w-full object-contain filter brightness-0 invert"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddLogoModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newLogoName.trim() || !newLogoUrl.trim()}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition disabled:opacity-40"
                >
                  Save Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT BRAND LOGO */}
      {/* ============================================================ */}
      {editingLogo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Edit Brand Logo</h2>
              <button
                type="button"
                onClick={() => setEditingLogo(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateLogo} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={editingLogo.name}
                  onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                  required
                  className="w-full bg-black/80 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Replace Logo Image
                </label>
                <button
                  type="button"
                  onClick={() => openUploadWidget(true)}
                  className="w-full border border-dashed border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center justify-center gap-2 transition text-zinc-300 hover:text-white"
                >
                  <Upload size={16} />
                  <span className="text-xs font-medium">Upload new image to replace</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingLogo.imageUrl}
                  onChange={(e) => setEditingLogo({ ...editingLogo, imageUrl: e.target.value })}
                  required
                  className="w-full bg-black/80 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              {editingLogo.imageUrl && (
                <div className="bg-zinc-900 p-3 rounded-lg flex items-center justify-center border border-white/10">
                  <img
                    src={editingLogo.imageUrl}
                    alt={editingLogo.name}
                    className="max-h-14 max-w-full object-contain filter brightness-0 invert"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingLogo(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingLogo.name.trim() || !editingLogo.imageUrl.trim()}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition"
                >
                  Update Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
