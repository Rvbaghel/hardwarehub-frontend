import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Cpu,
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  UserCheck,
  LogOut,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  Zap,
  Radio,
  Cable,
  Lock
} from "lucide-react";
import { useTheme, ThemeToggle } from "../ThemeContext";

const DAILY_LIMIT = 12;

const STARTER_PROMPTS = [
  {
    title: "ESP32-S3 Strapping Pins",
    desc: "Which pins configure boot modes and pull-ups?",
    icon: Cpu,
  },
  {
    title: "I2C vs SPI Bus Sizing",
    desc: "Calculate pull-up resistors and trace lengths",
    icon: Cable,
  },
  {
    title: "LDO Power Dissipation",
    desc: "Equation for thermal limits: (Vin - Vout) * I",
    icon: Zap,
  },
  {
    title: "LoRa SX1262 Matching",
    desc: "Impedance guidelines for 868/915 MHz antennas",
    icon: Radio,
  },
];

export default function HardwareChatPage({
  onBackHome,
  currentUser,
  onLogout,
  onNavigateAuth,
}) {
  const { theme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(DAILY_LIMIT);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(!currentUser);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load the shared daily quota used by the chatbot, blog summaries, and comparisons.
  useEffect(() => {
    const userId = currentUser?.userId || currentUser?.id;

    if (!userId) {
      setQuotaRemaining(DAILY_LIMIT);
      setQuotaExhausted(false);
      return;
    }

    let cancelled = false;

    const loadUsage = async () => {
      try {
        const response = await axios.get(
          `https://hardwarehub-project.onrender.com/api/chat/usage?userId=${encodeURIComponent(userId)}`
        );

        if (cancelled) return;

        const remaining = Number(response.data?.questionsRemaining ?? DAILY_LIMIT);
        setQuotaRemaining(remaining);
        setQuotaExhausted(remaining <= 0);
      } catch (error) {
        // Keep the current display if the usage endpoint is temporarily unavailable.
        console.error("Could not load shared AI usage:", error);
      }
    };

    loadUsage();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.userId, currentUser?.id]);

  const handleSend = async (customPrompt) => {
    const query = (customPrompt || input).trim();
    if (!query || loading || quotaExhausted) return;

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://hardwarehub-project.onrender.com/api/chat",
        {
          userId: currentUser.userId || currentUser.id,
          message: query,
        }
      );

      const data = response.data;
      const remaining = data.questionsRemaining ?? 0;
      setQuotaRemaining(remaining);

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

      if (remaining <= 0) {
        setQuotaExhausted(true);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setQuotaExhausted(true);
        setQuotaRemaining(0);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "🛑 **Daily Quota Exhausted**: You have used all 12 of your daily AI queries. Your quota resets tomorrow at midnight.",
          },
        ]);
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to communicate with the hardware reasoning core.";
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `⚠️ **Diagnostic Alert**: ${errorMsg}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-500 flex flex-col justify-between`}
    >
      {/* 1. Header (Identical to Homepage & Blog Page) */}
      <header
        className={`sticky top-0 z-50 border-b ${theme.border} ${theme.headerBg} backdrop-blur-md transition-colors`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackHome}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} text-xs font-mono transition-colors ${theme.mode === "light" ? "text-slate-700 bg-white hover:bg-slate-100" : "text-slate-200 bg-slate-900/60 hover:bg-slate-800/80"}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Exit Console</span>
            </button>

            <div
              onClick={onBackHome}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${theme.badgeBorder}`}
              >
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-wider hidden sm:inline">
                Hardware<span style={{ color: theme.dotColor }}>Hub</span>{" "}
                <span className="text-xs font-mono px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  AI
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Quota Counter Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono ${
                    quotaExhausted
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {quotaExhausted
                      ? "0/12 Remaining"
                      : `${quotaRemaining}/12 Questions`}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.cardBg} font-mono text-xs`}
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className={`font-semibold ${theme.mode === "light" ? "text-slate-800" : "text-slate-200"}`}>
                    @{currentUser.username}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-all"
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
                    theme.mode === "light"
                      ? "text-slate-700 hover:text-black"
                      : "text-slate-300 hover:text-white"
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

      {/* 2. Chat Conversation Viewport */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col justify-between">
        {messages.length === 0 ? (
          /* Gemini Minimalist Welcome Screen */
          <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${theme.badgeBorder} mb-6 shadow-xl animate-pulse`}
            >
              <Bot className="h-8 w-8" style={{ color: theme.dotColor }} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              HardwareHub{" "}
              <span
                className={`bg-gradient-to-r ${theme.taglineGradient} bg-clip-text text-transparent`}
              >
                Silicon Coprocessor
              </span>
            </h1>

            <p className={`mt-3 text-sm ${theme.textSecondary} max-w-lg leading-relaxed`}>
              Specialized in pinout multiplexing, decoupling capacitors, logic
              level conversions, bus timing, and component sourcing.
            </p>

            {/* Quick Starter Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-10 text-left">
              {STARTER_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.title)}
                    className={`p-4 rounded-xl border ${theme.border} ${theme.cardBg} hover:border-cyan-500/60 transition-all text-left group shadow-sm flex items-start gap-3`}
                  >
                    <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform ${
                      theme.mode === "light"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-slate-900 border-slate-800 text-cyan-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-xs transition-colors ${
                        theme.mode === "light"
                          ? "text-slate-900 group-hover:text-blue-700"
                          : "text-slate-200 group-hover:text-cyan-300"
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-[11px] font-mono mt-0.5 ${
                        theme.mode === "light" ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="space-y-6 pb-6">
            <div className={`flex justify-between items-center pb-3 border-b ${theme.border} text-[11px] font-mono ${theme.textSecondary}`}>
              <span>HARDWAREHUB_AI_REASONING_STREAM</span>
              <button
                onClick={() => setMessages([])}
                className={`flex items-center gap-1 ${
                   theme.mode === "light" ? "text-slate-600 hover:text-slate-950" : "text-slate-400 hover:text-slate-200"
                 }`}
              >
                <RotateCcw className="h-3 w-3" /> Clear Screen
              </button>
            </div>

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div
                    className={`h-8 w-8 rounded-lg border ${theme.badgeBorder} flex items-center justify-center shrink-0 mt-1`}
                  >
                    <Bot className="h-4 w-4" style={{ color: theme.dotColor }} />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-md ${
                    msg.sender === "user"
                      ? "bg-cyan-600 text-white font-sans rounded-tr-none"
                      : `${theme.cardBg} border ${theme.border} ${theme.textPrimary} font-sans rounded-tl-none`
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-3 last:mb-0 leading-relaxed whitespace-normal" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className={`text-xl font-bold mt-5 mb-3 ${theme.mode === "light" ? "text-slate-950" : "text-white"}`} {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className={`text-lg font-bold mt-5 mb-3 ${theme.mode === "light" ? "text-slate-950" : "text-white"}`} {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className={`list-disc pl-5 mb-3 space-y-1 ${theme.mode === "light" ? "text-slate-700" : "text-slate-300"}`} {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className={`list-decimal pl-5 mb-3 space-y-1 ${theme.mode === "light" ? "text-slate-700" : "text-slate-300"}`} {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => (
                        <strong className={`font-semibold ${theme.mode === "light" ? "text-blue-800" : "text-cyan-300"}`} {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className={`font-mono text-xs font-bold uppercase tracking-wider mt-4 mb-2 ${theme.mode === "light" ? "text-blue-800" : "text-cyan-400"}`} {...props} />
                      ),
                      hr: () => <hr className={`my-4 ${theme.mode === "light" ? "border-slate-300" : "border-slate-700"}`} />,
                      table: ({ node, ...props }) => (
                        <div className={`my-4 w-full overflow-x-auto rounded-lg border ${theme.border}`}><table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm" {...props} /></div>
                      ),
                      thead: ({ node, ...props }) => <thead className={theme.mode === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"} {...props} />,
                      tbody: ({ node, ...props }) => <tbody className={theme.mode === "light" ? "divide-y divide-slate-200" : "divide-y divide-slate-700"} {...props} />,
                      tr: ({ node, ...props }) => <tr className={theme.mode === "light" ? "border-b border-slate-200" : "border-b border-slate-700"} {...props} />,
                      th: ({ node, ...props }) => <th className="px-3 py-2 font-semibold whitespace-nowrap" {...props} />,
                      td: ({ node, ...props }) => <td className={`px-3 py-2 align-top ${theme.mode === "light" ? "text-slate-700" : "text-slate-300"}`} {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className={`px-1.5 py-0.5 rounded font-mono text-xs border ${
                            theme.mode === "light"
                              ? "bg-slate-100 text-blue-800 border-slate-300"
                              : "bg-slate-900 text-cyan-300 border-slate-800"
                          }`} {...props} />
                        ) : (
                          <pre className={`p-3 rounded-xl border overflow-x-auto my-2 text-xs font-mono ${
                            theme.mode === "light"
                              ? "bg-slate-100 border-slate-300 text-emerald-800"
                              : "bg-slate-950 border-slate-800 text-emerald-400"
                          }`} {...props} />
                        ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 justify-start">
                <div
                  className={`h-8 w-8 rounded-lg border ${theme.badgeBorder} flex items-center justify-center shrink-0 mt-1`}
                >
                  <Bot className="h-4 w-4 animate-spin" style={{ color: theme.dotColor }} />
                </div>
                <div
                  className={`rounded-2xl rounded-tl-none p-4 ${theme.cardBg} border ${theme.border} text-xs font-mono ${theme.textSecondary} flex items-center gap-2.5`}
                >
                  <span className="h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing logic specifications & voltage curves...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* 3. Gemini-Style Floating Prompt Bar */}
        <div className="pt-2 sticky bottom-4">
          <div
            className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-2 sm:p-2.5 backdrop-blur-xl shadow-2xl transition-all focus-within:border-cyan-500/70`}
          >
            {quotaExhausted ? (
              <div className="flex items-center justify-between p-2.5 font-mono text-xs text-amber-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Daily quota of 12 AI requests exhausted. Refreshes tomorrow.
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  LIMIT: 12/DAY
                </span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    currentUser
                      ? "Ask Hardware AI about pinouts, IC alternatives, decoupling..."
                      : "Sign in to query the silicon assistant..."
                  }
                  disabled={loading || quotaExhausted}
                  className={`w-full bg-transparent px-3 py-2 text-sm ${theme.textPrimary} ${
                    theme.mode === "light"
                      ? "placeholder:text-slate-500"
                      : "placeholder:text-slate-500"
                  } focus:outline-none`}
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim() || quotaExhausted}
                  className={`p-2.5 rounded-xl ${theme.accentBtn} font-semibold transition-all disabled:opacity-40 shadow-md shrink-0`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
          <p className={`text-center text-[10px] font-mono mt-2 ${theme.textSecondary}`}>
            HardwareHub AI can make mistakes. Always cross-reference manufacturer datasheets.
          </p>
        </div>
      </main>

      {/* 4. Login Required Modal Dialog */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`max-w-md w-full rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center`}
          >
            <div
              className={`h-12 w-12 mx-auto rounded-xl border ${theme.badgeBorder} flex items-center justify-center mb-4`}
            >
              <Lock className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold">Authentication Required</h3>
            <p className={`text-xs ${theme.textSecondary} mt-1.5 leading-relaxed`}>
              To ensure fair daily allocation of our hardware reasoning model,
              please sign in with your developer account.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => onNavigateAuth?.("login")}
                className={`w-full py-2.5 rounded-lg ${theme.accentBtn} text-xs font-mono font-bold shadow-md`}
              >
                Sign In to Account
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className={`w-full py-2 rounded-lg border ${theme.border} text-xs font-mono ${
                   theme.mode === "light"
                     ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                     : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                 }`}
              >
                Explore Without AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Daily Limit Reached Modal Dialog */}
      {quotaExhausted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`max-w-md w-full rounded-2xl border border-amber-500/40 ${theme.cardBg} p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center`}
          >
            <div className="h-12 w-12 mx-auto rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className={`text-lg font-bold ${theme.textPrimary}`}>
              Daily Limit Reached
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-2 leading-relaxed`}>
              You have completed all <strong>12 shared AI requests</strong> for
              today. Your quota will automatically restore tomorrow at midnight.
            </p>

            <button
              onClick={onBackHome}
              className={`w-full mt-6 py-2.5 rounded-lg ${theme.accentBtn} text-xs font-mono font-bold`}
            >
              Back to Homepage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}