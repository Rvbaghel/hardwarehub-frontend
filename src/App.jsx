import React, { useState } from "react";
import HomePage from "./HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import HardwareChatPage from "./pages/HardwareChatPage";
import CreateBlogModal from "./components/CreateBlogModal";
import { ThemeProvider } from "./ThemeContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home"); // "home" | "signup" | "login" | "blog-detail" | "chatbot"
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Read persisted user session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("hardwarehub_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("hardwarehub_user", JSON.stringify(userData));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("hardwarehub_user");
    setCurrentPage("home");
  };

  const handleSelectBlog = (id) => {
    setSelectedBlogId(id);
    setCurrentPage("blog-detail");
  };

  return (
    <ThemeProvider>
      {/* 1. Home Page */}
      {currentPage === "home" && (
        <HomePage 
          onNavigateAuth={(mode) => setCurrentPage(mode)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSelectBlog={handleSelectBlog}
          onOpenChat={() => setCurrentPage("chatbot")}
        />
      )}

      {/* 2. Full-Page Hardware AI Chatbot (Gemini Style) */}
      {currentPage === "chatbot" && (
        <HardwareChatPage
          onBackHome={() => setCurrentPage("home")}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateAuth={(mode) => setCurrentPage(mode)}
        />
      )}

      {/* 3. Detailed Blog Page */}
      {currentPage === "blog-detail" && (
        <BlogDetailPage
          blogId={selectedBlogId}
          onBackHome={() => setCurrentPage("home")}
          onSelectBlog={(id) => setSelectedBlogId(id)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenWriteModal={() => setIsWriteModalOpen(true)}
          onNavigateAuth={(mode) => setCurrentPage(mode)}
        />
      )}

      {/* 4. Auth Pages */}
      {currentPage === "signup" && (
        <SignupPage 
          onNavigateHome={() => setCurrentPage("home")}
          onNavigateLogin={() => setCurrentPage("login")}
          onSignupSuccess={handleAuthSuccess}
        />
      )}

      {currentPage === "login" && (
        <LoginPage 
          onNavigateHome={() => setCurrentPage("home")}
          onNavigateSignup={() => setCurrentPage("signup")}
          onLoginSuccess={handleAuthSuccess}
        />
      )}

      {/* 5. Global Publishing Modal */}
      <CreateBlogModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentUser={currentUser}
        onBlogCreated={() => setCurrentPage("home")}
      />
    </ThemeProvider>
  );
}