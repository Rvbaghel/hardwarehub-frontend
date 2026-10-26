    import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Cpu, 
  ArrowLeft, 
  ExternalLink, 
  UserCheck, 
  LogOut, 
  PenTool, 
  Layers, 
  Sparkles, 
  Calendar, 
  Building2, 
  Compass 
} from "lucide-react";
import { useTheme, ThemeToggle } from "../ThemeContext";

export default function BlogDetailPage({ 
  blogId, 
  onBackHome, 
  onSelectBlog, 
  currentUser, 
  onLogout, 
  onOpenWriteModal,
  onNavigateAuth 
}) {
  const { theme } = useTheme();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    // 1. Fetch the main blog post
    axios
      .get(`https://hardwarehub-project.onrender.com/api/blogs/${blogId}`)
      .then((res) => {
        setBlog(res.data);
        setLoading(false);

        // 2. Fetch related posts in the same category
        if (res.data.categoryName) {
          axios
            .get(
              `https://hardwarehub-project.onrender.com/api/blogs/category/${encodeURIComponent(
                res.data.categoryName
              )}`
            )
            .then((catRes) => {
              // Exclude the currently viewed blog from the sidebar
              const filtered = catRes.data.filter((item) => item.id !== res.data.id);
              setRelatedBlogs(filtered);
            })
            .catch(() => setRelatedBlogs([]));
        }
      })
      .catch((err) => {
        console.error("Error fetching blog details:", err);
        setLoading(false);
      });
  }, [blogId]);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-500 flex flex-col justify-between`}>
      {/* 1. Universal Top Navigation Bar */}
      <header className={`sticky top-0 z-50 border-b ${theme.border} ${theme.headerBg} backdrop-blur-md transition-colors`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackHome}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} text-xs font-mono hover:bg-slate-800/60 transition-colors`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div onClick={onBackHome} className="flex items-center gap-2.5 cursor-pointer">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${theme.badgeBorder}`}>
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-wider hidden sm:inline">
                Hardware<span style={{ color: theme.dotColor }}>Hub</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onOpenWriteModal}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${theme.accentBtn} text-xs font-mono font-semibold transition-all`}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>Write Post</span>
                </button>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} bg-slate-900/60 font-mono text-xs`}>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">@{currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateAuth?.("login")}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    theme.mode === "light" ? "text-slate-700 hover:text-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigateAuth?.("signup")}
                  className={`rounded-lg ${theme.accentBtn} px-4 py-2 text-sm font-semibold shadow-md`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Blog Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        {loading ? (
          <div className="text-center py-24 font-mono text-sm text-slate-400">
            <span className="inline-block h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
            Decrypting full hardware datasheet and article...
          </div>
        ) : !blog ? (
          <div className={`p-12 rounded-2xl border ${theme.border} text-center font-mono text-sm text-slate-400`}>
            Article not found. It may have been moved or removed.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left/Center Column: The Full Article (8 cols) */}
            <article className={`lg:col-span-8 rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-10 backdrop-blur-md shadow-xl transition-all`}>
              {/* Category & Manufacturer Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 tracking-wider">
                  {blog.categoryName}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>{blog.manufacturer}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug mb-4">
                {blog.title}
              </h1>

              {/* Author & Timestamp */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800 text-xs font-mono text-slate-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Written by <strong className="text-slate-200">@{blog.authorUsername}</strong>
                </span>
                {blog.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Target Applications Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-8 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Compass className="h-4 w-4" />
                  <span>PRIMARY INDUSTRIAL APPLICATIONS</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{blog.primaryUseCases}</p>
              </div>

              {/* Hardware Images Gallery (1 or 2 images) */}
              {blog.imageUrls && blog.imageUrls.length > 0 && (
                <div className={`grid ${blog.imageUrls.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-4 mb-8`}>
                  {blog.imageUrls.map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                      <img
                        src={url}
                        alt={`${blog.title} spec view ${idx + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Complete Unclipped Blog Content */}
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-300 font-sans border-t border-slate-800 pt-6">
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500">Technical Breakdown</h3>
                <p className="whitespace-pre-line text-slate-200 leading-relaxed font-normal">
                  {blog.content}
                </p>
              </div>

              {/* Sourcing / Direct Purchase Section */}
              {blog.purchaseLink && (
                <div className="mt-10 p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">Verified Sourcing & Distribution</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Direct link to component datasheets and retail distributors.</p>
                  </div>
                  <a
                    href={blog.purchaseLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg ${theme.accentBtn} text-xs font-mono font-bold shadow-md`}
                  >
                    <span>Procure / Datasheet</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </article>

            {/* Right Sidebar: Related Category Write-ups (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-6 backdrop-blur-md shadow-lg`}>
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-sm tracking-tight">More in {blog.categoryName}</h3>
                </div>

                {relatedBlogs.length === 0 ? (
                  <p className="font-mono text-xs text-slate-500 py-4 text-center">
                    No other articles in this category yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedBlogs.map((rel) => (
                      <div
                        key={rel.id}
                        className="group p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        {rel.imageUrls && rel.imageUrls.length > 0 && (
                          <div className="h-28 rounded-lg overflow-hidden mb-2.5 bg-slate-900 border border-slate-800/80">
                            <img
                              src={rel.imageUrls[0]}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </div>
                        )}

                        <span className="text-[10px] font-mono text-slate-500 mb-1">
                          {rel.manufacturer}
                        </span>

                        <h4 className="font-bold text-xs line-clamp-2 leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
                          {rel.title}
                        </h4>

                        <p className="text-[11px] font-mono text-slate-400 line-clamp-2 mb-3">
                          {rel.primaryUseCases}
                        </p>

                        <button
                          onClick={() => onSelectBlog(rel.id)}
                          className="w-full py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-mono font-medium transition-colors text-center"
                        >
                          Read Full Blog →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className={`border-t ${theme.border} py-8 text-center text-xs ${theme.textSecondary} font-mono transition-colors`}>
        &copy; {new Date().getFullYear()} HardwareHub. Technical write-up view.
      </footer>
    </div>
  );
}