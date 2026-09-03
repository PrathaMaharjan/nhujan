import Link from "next/link";
import { db } from "@/db";
import {
  workProjects,
  workCategories,
  projectGalleryImages,
  brandLogos,
  artists,
  preloaderImages,
} from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import {
  FolderKanban,
  Briefcase,
  Layers,
  Tag,
  Users,
  Loader,
  ArrowUpRight,
  Plus,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { isVideoUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch real-time counts concurrently
  const [
    projectsCountRes,
    categoriesCountRes,
    galleryCountRes,
    brandsCountRes,
    artistsCountRes,
    preloaderCountRes,
    allCategories,
    recentProjects,
  ] = await Promise.all([
    db.select({ value: count() }).from(workProjects),
    db.select({ value: count() }).from(workCategories).where(eq(workCategories.isDefault, false)),
    db.select({ value: count() }).from(projectGalleryImages),
    db.select({ value: count() }).from(brandLogos),
    db.select({ value: count() }).from(artists),
    db.select({ value: count() }).from(preloaderImages),
    db.query.workCategories.findMany({
      where: eq(workCategories.isDefault, false),
      orderBy: (c, { asc }) => [asc(c.order)],
    }),
    db.query.workProjects.findMany({
      limit: 5,
      orderBy: (p, { desc }) => [desc(p.updatedAt)],
    }),
  ]);

  const totalProjects = projectsCountRes[0]?.value || 0;
  const totalCategories = categoriesCountRes[0]?.value || 0;
  const totalGalleryMedia = galleryCountRes[0]?.value || 0;
  const totalBrands = brandsCountRes[0]?.value || 0;
  const totalArtists = artistsCountRes[0]?.value || 0;
  const totalPreloader = preloaderCountRes[0]?.value || 0;

  // Projects per category breakdown
  const categoryStats = await Promise.all(
    allCategories.map(async (cat) => {
      const [res] = await db
        .select({ value: count() })
        .from(workProjects)
        .where(eq(workProjects.categorySlug, cat.slug));
      return {
        ...cat,
        projectCount: res?.value || 0,
      };
    })
  );

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      subtext: `Across ${totalCategories} categories`,
      href: "/admin/projects",
      icon: FolderKanban,
      color: "from-blue-500/20 to-indigo-500/5",
      border: "hover:border-blue-500/40",
    },
    {
      title: "Bento Gallery Media",
      value: totalGalleryMedia,
      subtext: "Showcase photos & clips",
      href: "/admin/projects",
      icon: Layers,
      color: "from-purple-500/20 to-pink-500/5",
      border: "hover:border-purple-500/40",
    },
    {
      title: "Brand Logos",
      value: totalBrands,
      subtext: "Interactive sticker logos",
      href: "/admin/brands",
      icon: Tag,
      color: "from-amber-500/20 to-orange-500/5",
      border: "hover:border-amber-500/40",
    },
    {
      title: "Featured Artists",
      value: totalArtists,
      subtext: "Collaborators listed",
      href: "/admin/brands",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/5",
      border: "hover:border-emerald-500/40",
    },
    {
      title: "Work Categories",
      value: totalCategories,
      subtext: "Homepage showcase tabs",
      href: "/admin/work",
      icon: Briefcase,
      color: "from-cyan-500/20 to-sky-500/5",
      border: "hover:border-cyan-500/40",
    },
    {
      title: "Preloader Frames",
      value: totalPreloader,
      subtext: "Loading sequence assets",
      href: "/admin/preloader",
      icon: Loader,
      color: "from-zinc-500/20 to-neutral-500/5",
      border: "hover:border-zinc-500/40",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8 pb-16 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extralight tracking-tight text-white">
            Stats & Overview
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Real-time portfolio metrics, content distribution, and quick management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono tracking-wider uppercase rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <span>View Live Site</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map(({ title, value, subtext, href, icon: Icon, color, border }) => (
          <Link
            key={title}
            href={href}
            className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border border-white/10 bg-gradient-to-b ${color} bg-zinc-950/80 ${border} transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-white/40 truncate">
                  {title}
                </span>
                <Icon size={16} className="text-white/40 group-hover:text-white transition-colors shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-1">
                {value}
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/40 truncate mt-2">
              {subtext}
            </p>
          </Link>
        ))}
      </div>

      {/* Category Breakdown and Recent Projects Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Category Distribution (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-white">
                  Category Distribution
                </h2>
                <p className="text-xs text-white/40">
                  Projects per category showcase
                </p>
              </div>
              <Link
                href="/admin/work"
                className="text-[11px] font-mono tracking-wider text-white/50 hover:text-white transition uppercase flex items-center gap-1"
              >
                <span>Edit Categories</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {categoryStats.length === 0 ? (
              <p className="text-xs text-white/30 py-8 text-center">
                No categories created yet.
              </p>
            ) : (
              <div className="space-y-4">
                {categoryStats.map((cat) => {
                  const percentage =
                    totalProjects > 0
                      ? Math.round((cat.projectCount / totalProjects) * 100)
                      : 0;

                  return (
                    <Link
                      key={cat.id}
                      href={`/admin/projects?category=${cat.slug}`}
                      className="group block p-2.5 -mx-2.5 rounded-lg hover:bg-white/5 transition"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white group-hover:text-white">
                            {cat.title}
                          </span>
                          <span className="text-[10px] font-mono text-white/30">
                            /{cat.slug}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-white/60">
                          {cat.projectCount} project{cat.projectCount === 1 ? "" : "s"} ({percentage}%)
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/70 group-hover:bg-white transition-all duration-500 rounded-full"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/40 font-mono">
              Total: {totalProjects} project{totalProjects === 1 ? "" : "s"} across {totalCategories} categories
            </span>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-white hover:underline flex items-center gap-1"
            >
              <span>Manage Projects</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right: Quick Actions & Recent Projects (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
            <h2 className="text-base font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-white/60" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/projects"
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-white transition flex flex-col gap-1"
              >
                <Plus size={15} className="text-white/60" />
                <span>Add New Project</span>
              </Link>
              <Link
                href="/admin/work"
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-white transition flex flex-col gap-1"
              >
                <Plus size={15} className="text-white/60" />
                <span>New Category</span>
              </Link>
              <Link
                href="/admin/brands"
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-white transition flex flex-col gap-1"
              >
                <Tag size={15} className="text-white/60" />
                <span>Manage Brands</span>
              </Link>
              <Link
                href="/admin/preloader"
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-white transition flex flex-col gap-1"
              >
                <Loader size={15} className="text-white/60" />
                <span>Preloader Images</span>
              </Link>
            </div>
          </div>

          {/* Recently Updated Projects */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-white">
                Recently Updated
              </h2>
              <Link
                href="/admin/projects"
                className="text-[11px] font-mono text-white/40 hover:text-white uppercase transition"
              >
                All Projects →
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">
                No projects added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => {
                  const mediaSrc = p.thumbnailUrl || p.gifUrl;
                  return (
                    <Link
                      key={p.id}
                      href="/admin/projects"
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <div className="w-10 h-10 rounded bg-zinc-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {mediaSrc ? (
                          isVideoUrl(mediaSrc) ? (
                            <video
                              src={mediaSrc}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={mediaSrc}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <span className="text-[9px] font-mono text-white/20">
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-white group-hover:text-white truncate">
                          {p.title}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 uppercase truncate">
                          {p.categorySlug} {p.categoryLabel ? `• ${p.categoryLabel}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-white/20 group-hover:text-white/60 font-mono transition">
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}