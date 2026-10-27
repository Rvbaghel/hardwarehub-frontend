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
  Compass,
  FileText,
  GitCompare,
  LoaderCircle,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown
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

  // Blog AI tools: summary and hardware comparison.
  const [activeAiFeature, setActiveAiFeature] = useState(null);
  const [aiResults, setAiResults] = useState({ summary: "", compare: "" });
  const [aiLoading, setAiLoading] = useState({ summary: false, compare: false });
  const [aiErrors, setAiErrors] = useState({ summary: "", compare: "" });
  const [usedAiFeatures, setUsedAiFeatures] = useState({ summary: false, compare: false });
  const [questionsRemaining, setQuestionsRemaining] = useState(12);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(true);

  const API_BASE_URL = "https://hardwarehub-project.onrender.com";

  const getCurrentUserId = () =>
    currentUser?.id ?? currentUser?.userId ?? currentUser?.user_id ?? null;

  const runBlogAiFeature = async (feature) => {
    if (!blog?.id || !currentUser) {
      setAiErrors((previous) => ({
        ...previous,
        [feature]: "Please sign in to use this AI feature."
      }));
      setActiveAiFeature(feature);
      return;
    }

    if (usedAiFeatures[feature]) {
      setAiErrors((previous) => ({
        ...previous,
        [feature]: "You have already used this feature for this blog."
      }));
      setActiveAiFeature(feature);
      return;
    }

    const userId = getCurrentUserId();
    if (userId == null) {
      setAiErrors((previous) => ({
        ...previous,
        [feature]: "Your user ID is missing. Please sign out and sign in again."
      }));
      setActiveAiFeature(feature);
      return;
    }

    setActiveAiFeature(feature);
    setAiPanelExpanded(true);
    setAiLoading((previous) => ({ ...previous, [feature]: true }));
    setAiErrors((previous) => ({ ...previous, [feature]: "" }));
    setAiResults((previous) => ({ ...previous, [feature]: "" }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/blog-ai/${blog.id}/${feature}`,
        { userId: String(userId) }
      );

      const result = response?.data?.result;
      if (!result || typeof result !== "string") {
        throw new Error("The AI service returned an empty response. Please try again.");
      }

      setAiResults((previous) => ({ ...previous, [feature]: result }));
      setUsedAiFeatures((previous) => ({ ...previous, [feature]: true }));

      if (typeof response.data.questionsRemaining === "number") {
        setQuestionsRemaining(response.data.questionsRemaining);
      }
    } catch (error) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;

      let message = serverMessage || error.message || "Unable to generate an AI response.";
      if (status === 401) {
        message = "Please sign in to use this AI feature.";
      } else if (status === 404) {
        message = "This blog or AI endpoint was not found. Confirm that the latest backend is deployed.";
      } else if (status === 409) {
        message = "You have already used this feature for this blog.";
        setUsedAiFeatures((previous) => ({ ...previous, [feature]: true }));
      } else if (status === 429) {
        message = "Your daily AI request limit has been reached. Please try again tomorrow.";
      }

      if (typeof error?.response?.data?.questionsRemaining === "number") {
        setQuestionsRemaining(error.response.data.questionsRemaining);
      }

      setAiErrors((previous) => ({ ...previous, [feature]: message }));
    } finally {
      setAiLoading((previous) => ({ ...previous, [feature]: false }));
    }
  };

  // Render Gemini's Markdown response (headings, lists, bold text, and tables)
  // without requiring an additional frontend dependency.
  const renderAiMarkdown = (markdown) => {
    const lines = String(markdown || "").replace(/\r/g, "").split("\n");
    const elements = [];
    let paragraph = [];
    let listItems = [];
    let listType = null;
    let tableRows = [];

    const inlineFormat = (text, keyPrefix) => {
      const pieces = String(text).split(/(\*\*.*?\*\*|`[^`]+`|\*[^*]+\*)/g);
      return pieces.map((piece, index) => {
        if (piece.startsWith("**") && piece.endsWith("**")) {
          return <strong key={`${keyPrefix}-b-${index}`}>{piece.slice(2, -2)}</strong>;
        }
        if (piece.startsWith("`") && piece.endsWith("`")) {
          return <code key={`${keyPrefix}-c-${index}`} className={`rounded px-1 py-0.5 text-[0.9em] ${theme.mode === "light" ? "bg-slate-200 text-slate-900" : "bg-slate-800 text-cyan-200"}`}>{piece.slice(1, -1)}</code>;
        }
        if (piece.startsWith("*") && piece.endsWith("*")) {
          return <em key={`${keyPrefix}-i-${index}`}>{piece.slice(1, -1)}</em>;
        }
        return piece;
      });
    };

    const flushParagraph = () => {
      if (paragraph.length) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-3 leading-7">
            {inlineFormat(paragraph.join(" "), `p-${elements.length}`)}
          </p>
        );
        paragraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length) {
        const ListTag = listType === "ol" ? "ol" : "ul";
        elements.push(
          <ListTag key={`list-${elements.length}`} className={`${listType === "ol" ? "list-decimal" : "list-disc"} mb-4 space-y-1 pl-6`}>
            {listItems.map((item, index) => (
              <li key={`li-${index}`}>{inlineFormat(item, `li-${elements.length}-${index}`)}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableRows.length) {
        const rows = tableRows.filter((row) => !/^\s*\|?\s*:?-{3,}/.test(row));
        const parsedRows = rows.map((row) =>
          row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim())
        );
        if (parsedRows.length) {
          elements.push(
            <div key={`table-${elements.length}`} className="mb-4 max-w-full overflow-x-auto rounded-lg border border-slate-500/30">
              <table className="w-full min-w-[480px] border-collapse text-left text-xs sm:text-sm">
                <thead className={theme.mode === "light" ? "bg-slate-100" : "bg-slate-800/80"}>
                  <tr>
                    {parsedRows[0].map((cell, index) => (
                      <th key={`th-${index}`} className="border-b border-slate-500/30 px-3 py-2 font-semibold">
                        {inlineFormat(cell, `th-${index}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(1).map((row, rowIndex) => (
                    <tr key={`tr-${rowIndex}`} className={rowIndex % 2 === 0 ? (theme.mode === "light" ? "bg-white" : "bg-slate-900/30") : (theme.mode === "light" ? "bg-slate-50" : "bg-slate-800/30")}>
                      {row.map((cell, cellIndex) => (
                        <td key={`td-${rowIndex}-${cellIndex}`} className="border-b border-slate-500/20 px-3 py-2 align-top">
                          {inlineFormat(cell, `td-${rowIndex}-${cellIndex}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
      }
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      const isTableLine = line.includes("|") && /^\|?.+\|.+/.test(line);
      if (isTableLine) {
        flushParagraph();
        flushList();
        tableRows.push(line);
        return;
      }
      flushTable();

      if (!line) {
        flushParagraph();
        flushList();
        return;
      }

      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        const level = headingMatch[1].length;
        const headingClass = level === 1 ? "text-lg sm:text-xl" : level === 2 ? "text-base sm:text-lg" : "text-sm sm:text-base";
        elements.push(
          <h3 key={`h-${elements.length}`} className={`${headingClass} mb-2 mt-4 font-bold text-cyan-500`}>
            {inlineFormat(headingMatch[2].replace(/\*\*/g, ""), `h-${elements.length}`)}
          </h3>
        );
        return;
      }

      const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
      const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (bulletMatch || orderedMatch) {
        flushParagraph();
        const nextType = orderedMatch ? "ol" : "ul";
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        listItems.push((bulletMatch || orderedMatch)[1]);
        return;
      }

      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    flushTable();
    return elements;
  };

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} text-xs font-mono transition-colors ${
                theme.mode === "light"
                  ? "hover:bg-slate-100"
                  : "hover:bg-slate-800/60"
              }`}
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
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.cardBg} font-mono text-xs`}>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className={`font-semibold ${theme.textPrimary}`}>@{currentUser.username}</span>
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
          <div className={`text-center py-24 font-mono text-sm ${theme.textSecondary}`}>
            <span className="inline-block h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
            Decrypting full hardware datasheet and article...
          </div>
        ) : !blog ? (
          <div className={`p-12 rounded-2xl border ${theme.border} ${theme.cardBg} text-center font-mono text-sm ${theme.textSecondary}`}>
            Article not found. It may have been moved or removed.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left/Center Column: The Full Article (8 cols) */}
            <article className={`lg:col-span-8 rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-10 backdrop-blur-md shadow-xl transition-all`}>
              {/* Category & Manufacturer Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-md border tracking-wider ${
                   theme.mode === "light"
                     ? "border-cyan-700/30 bg-cyan-50 text-cyan-800"
                     : "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                 }`}>
                  {blog.categoryName}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-mono ${theme.textSecondary}`}>
                  <Building2 className={`h-3.5 w-3.5 ${theme.textSecondary}`} />
                  <span>{blog.manufacturer}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug mb-4">
                {blog.title}
              </h1>

              {/* Author & Timestamp */}
              <div className={`flex items-center gap-4 pb-6 border-b ${theme.border} text-xs font-mono ${theme.textSecondary} mb-6`}>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Written by <strong className={theme.textPrimary}>@{blog.authorUsername}</strong>
                </span>
                {blog.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className={`h-3.5 w-3.5 ${theme.textSecondary}`} />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Target Applications Box */}
              <div className={`p-4 rounded-xl border mb-8 font-mono text-xs ${
                 theme.mode === "light"
                   ? "bg-slate-100 border-slate-300"
                   : "bg-slate-950/60 border-slate-800"
               }`}>
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                  <Compass className="h-4 w-4" />
                  <span>PRIMARY INDUSTRIAL APPLICATIONS</span>
                </div>
                <p className={`leading-relaxed ${theme.mode === "light" ? "text-slate-700" : "text-slate-300"}`}>{blog.primaryUseCases}</p>
              </div>

              {/* Hardware Images Gallery (1 or 2 images) */}
              {blog.imageUrls && blog.imageUrls.length > 0 && (
                <div className={`grid ${blog.imageUrls.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-4 mb-8`}>
                  {blog.imageUrls.map((url, idx) => (
                    <div key={idx} className={`rounded-xl overflow-hidden border ${theme.border} ${
                       theme.mode === "light" ? "bg-slate-100" : "bg-slate-950"
                     } shadow-md`}>
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
              <div className={`space-y-4 text-sm sm:text-base leading-relaxed font-sans border-t ${theme.border} pt-6 ${
                 theme.mode === "light" ? "text-slate-700" : "text-slate-300"
               }`}>
                <h3 className={`font-mono text-xs uppercase tracking-widest ${theme.textSecondary}`}>Technical Breakdown</h3>
                <p className={`whitespace-pre-line leading-relaxed font-normal ${
                   theme.mode === "light" ? "text-slate-900" : "text-slate-200"
                 }`}>
                  {blog.content}
                </p>
              </div>

              {/* Sourcing / Direct Purchase Section */}
              {blog.purchaseLink && (
                <div className="mt-10 p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className={`font-bold text-sm ${theme.textPrimary}`}>Verified Sourcing & Distribution</h4>
                    <p className={`text-xs font-mono mt-0.5 ${theme.textSecondary}`}>Direct link to component datasheets and retail distributors.</p>
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
                <div className={`flex items-center gap-2 pb-4 border-b ${theme.border} mb-5`}>
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-sm tracking-tight">More in {blog.categoryName}</h3>
                </div>

                {relatedBlogs.length === 0 ? (
                  <p className={`font-mono text-xs ${theme.textSecondary} py-4 text-center`}>
                    No other articles in this category yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedBlogs.map((rel) => (
                      <div
                        key={rel.id}
                        className={`group p-3.5 rounded-xl border ${theme.border} ${
                           theme.mode === "light"
                             ? "bg-white hover:border-slate-400"
                             : "bg-slate-950/50 hover:border-slate-700"
                         } transition-all flex flex-col justify-between`}
                      >
                        {rel.imageUrls && rel.imageUrls.length > 0 && (
                          <div className={`h-28 rounded-lg overflow-hidden mb-2.5 border ${
                             theme.mode === "light"
                               ? "bg-slate-100 border-slate-300"
                               : "bg-slate-900 border-slate-800/80"
                           }`}>
                            <img
                              src={rel.imageUrls[0]}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </div>
                        )}

                        <span className={`text-[10px] font-mono ${theme.textSecondary} mb-1`}>
                          {rel.manufacturer}
                        </span>

                        <h4 className={`font-bold text-xs line-clamp-2 leading-snug mb-2 transition-colors ${
                           theme.mode === "light"
                             ? "text-slate-900 group-hover:text-blue-700"
                             : "group-hover:text-cyan-400"
                         }`}>
                          {rel.title}
                        </h4>

                        <p className={`text-[11px] font-mono ${theme.textSecondary} line-clamp-2 mb-3`}>
                          {rel.primaryUseCases}
                        </p>

                        <button
                          onClick={() => onSelectBlog(rel.id)}
                          className={`w-full py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors text-center ${
                           theme.mode === "light"
                             ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-blue-800"
                             : "border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400"
                         }`}
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

      {/* Floating AI tools dock — kept separate from the main article and chatbot */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-[60] flex w-[calc(100vw-2rem)] max-w-[390px] flex-col items-end gap-3">
        {activeAiFeature && (
          <section
            className={`w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
              theme.mode === "light"
                ? "border-slate-300 bg-white/95 text-slate-900"
                : "border-slate-700 bg-slate-950/95 text-slate-100"
            }`}
            aria-label={activeAiFeature === "summary" ? "AI blog summary" : "AI hardware comparison"}
          >
            <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${theme.border}`}>
              <div className="flex min-w-0 items-center gap-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.mode === "light" ? "bg-violet-100 text-violet-700" : "bg-violet-500/15 text-violet-300"}`}>
                  {activeAiFeature === "summary" ? <FileText className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">
                    {activeAiFeature === "summary" ? "AI Blog Summary" : "Hardware Comparison"}
                  </h3>
                  <p className={`text-[10px] ${theme.textSecondary}`}>Gemini-powered hardware assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAiFeature(null)}
                className={`rounded-lg p-1.5 transition-colors ${theme.mode === "light" ? "hover:bg-slate-100" : "hover:bg-slate-800"}`}
                aria-label="Close AI result"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[min(55vh,460px)] overflow-y-auto px-4 py-4 text-sm">
              {aiLoading[activeAiFeature] ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-violet-400/30 border-t-violet-500 animate-spin" />
                    <Sparkles className="h-6 w-6 animate-pulse text-violet-400" />
                  </div>
                  <p className="font-semibold">
                    {activeAiFeature === "summary" ? "Summarizing this blog..." : "Comparing hardware alternatives..."}
                  </p>
                  <p className={`text-xs ${theme.textSecondary}`}>Gemini is analyzing the component details.</p>
                </div>
              ) : aiErrors[activeAiFeature] ? (
                <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${theme.mode === "light" ? "border-red-200 bg-red-50 text-red-700" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{aiErrors[activeAiFeature]}</p>
                </div>
              ) : aiResults[activeAiFeature] ? (
                <div className="break-words">
                  {renderAiMarkdown(aiResults[activeAiFeature])}
                  {usedAiFeatures[activeAiFeature] && (
                    <p className={`mt-4 flex items-center gap-1.5 border-t pt-3 text-[11px] ${theme.border} ${theme.textSecondary}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      This feature has been used for this blog.
                    </p>
                  )}
                </div>
              ) : (
                <p className={`py-5 text-center text-sm ${theme.textSecondary}`}>
                  Select an AI tool below to analyze this hardware article.
                </p>
              )}
            </div>
          </section>
        )}

        <div className={`w-full rounded-2xl border p-3 shadow-2xl backdrop-blur-xl ${theme.border} ${theme.mode === "light" ? "bg-white/95" : "bg-slate-950/95"}`}>
          <button
            type="button"
            onClick={() => setAiPanelExpanded((expanded) => !expanded)}
            className="mb-2 flex w-full items-center justify-between gap-2 px-1"
            aria-expanded={aiPanelExpanded}
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-400">
                <Sparkles className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </span>
              Hardware AI Tools
            </span>
            <span className={`flex items-center gap-1 text-[11px] ${theme.textSecondary}`}>
              {questionsRemaining} queries left
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aiPanelExpanded ? "rotate-180" : ""}`} />
            </span>
          </button>

          {aiPanelExpanded && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => runBlogAiFeature("summary")}
                disabled={aiLoading.summary || usedAiFeatures.summary}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  theme.mode === "light"
                    ? "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"
                    : "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
                }`}
              >
                {aiLoading.summary ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>{usedAiFeatures.summary ? "Summary used" : "Summarize blog"}</span>
              </button>
              <button
                type="button"
                onClick={() => runBlogAiFeature("compare")}
                disabled={aiLoading.compare || usedAiFeatures.compare}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  theme.mode === "light"
                    ? "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                }`}
              >
                {aiLoading.compare ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                <span>{usedAiFeatures.compare ? "Comparison used" : "Compare hardware"}</span>
              </button>
            </div>
          )}
          {!currentUser && (
            <p className={`mt-2 text-center text-[10px] ${theme.textSecondary}`}>
              Sign in to use the AI tools.
            </p>
          )}
        </div>
      </div>

      {/* 3. Footer */}
      <footer className={`border-t ${theme.border} py-8 text-center text-xs ${theme.textSecondary} font-mono transition-colors`}>
        &copy; {new Date().getFullYear()} HardwareHub. Technical write-up view.
      </footer>
    </div>
  );
}


