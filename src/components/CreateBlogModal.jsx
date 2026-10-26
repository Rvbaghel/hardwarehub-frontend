import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, AlertCircle, CheckCircle2, Image as ImageIcon, ExternalLink, Cpu } from "lucide-react";
import { useTheme } from "../ThemeContext";

export default function CreateBlogModal({ isOpen, onClose, onBlogCreated, currentUser }) {
  const { theme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    manufacturer: "",
    primaryUseCases: "",
    content: "",
    purchaseLink: "",
    categoryId: "",
    image1: "",
    image2: "",
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    if (isOpen) {
      axios
        .get("https://hardwarehub-project.onrender.com/api/categories")
        .then((res) => {
          setCategories(res.data);
          if (res.data.length > 0 && !formData.categoryId) {
            setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
          }
        })
        .catch(() => setStatus({ loading: false, error: "Failed to fetch categories.", success: null }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    const imageUrls = [formData.image1.trim(), formData.image2.trim()].filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      manufacturer: formData.manufacturer.trim(),
      primaryUseCases: formData.primaryUseCases.trim(),
      content: formData.content.trim(),
      purchaseLink: formData.purchaseLink.trim() || null,
      categoryId: parseInt(formData.categoryId, 10),
      authorId: currentUser?.userId || currentUser?.id || 1,
      imageUrls: imageUrls,
    };

    try {
      const response = await axios.post(
        "https://hardwarehub-project.onrender.com/api/blogs",
        payload
      );

      setStatus({ loading: false, error: null, success: "Blog post published successfully!" });
      setTimeout(() => {
        onBlogCreated(response.data);
        onClose();
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to publish post.";
      setStatus({ loading: false, error: msg, success: null });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all`}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold">Publish Hardware Write-up</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts */}
        {status.error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{status.error}</span>
          </div>
        )}

        {status.success && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status.success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-400">POST TITLE (10-120 CHARACTERS)</label>
              <span className="text-slate-500">{formData.title.length}/120</span>
            </div>
            <input
              type="text"
              name="title"
              required
              minLength={10}
              maxLength={120}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. ESP32-S3 Dual-Core Xtensa LX7 Overview & Pinout Analysis"
              className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">CATEGORY</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">MANUFACTURER</label>
              <input
                type="text"
                name="manufacturer"
                required
                maxLength={60}
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Espressif, Texas Instruments"
                className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-400">PRIMARY INDUSTRIAL USE CASES</label>
              <span className="text-slate-500">{formData.primaryUseCases.length}/250</span>
            </div>
            <input
              type="text"
              name="primaryUseCases"
              required
              minLength={10}
              maxLength={250}
              value={formData.primaryUseCases}
              onChange={handleChange}
              placeholder="e.g. Industrial Edge AI, Smart Home telemetry, USB OTG gateways"
              className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-400">TECHNICAL ARTICLE CONTENT (MIN 100 CHARS)</label>
              <span className="text-slate-500">{formData.content.length}/10000</span>
            </div>
            <textarea
              name="content"
              required
              minLength={100}
              rows={5}
              value={formData.content}
              onChange={handleChange}
              placeholder="Deep dive into core architecture, registers, pin multiplexing, errata, voltage tolerances..."
              className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono`}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">DISTRIBUTOR / BUYER LINK (OPTIONAL)</label>
            <input
              type="url"
              name="purchaseLink"
              value={formData.purchaseLink}
              onChange={handleChange}
              placeholder="https://mouser.com/ProductDetail/..."
              className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
            />
          </div>

          {/* Up to 2 Image URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">IMAGE URL 1 (OPTIONAL)</label>
              <input
                type="url"
                name="image1"
                value={formData.image1}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">IMAGE URL 2 (OPTIONAL)</label>
              <input
                type="url"
                name="image2"
                value={formData.image2}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className={`w-full p-2.5 rounded-lg border ${theme.border} bg-slate-950/50 text-slate-100 focus:outline-none focus:border-cyan-500`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className={`w-full mt-4 py-3 rounded-lg ${theme.accentBtn} font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50`}
          >
            {status.loading ? "Publishing to HardwareHub..." : "Publish Write-up"}
          </button>
        </form>
      </div>
    </div>
  );
}