import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "@layout/Header";
import Footer from "@layout/Footer";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import PathSelection from "./pages/PathSelection";
import Chatbot from "./comps/ui/Chatbot";
import Dashboard from "./pages/Dashboard";
import DayPage from "./pages/DayPage";
import Step1 from "@/pages/onboarding/Step1";
import Step2 from "@/pages/onboarding/Step2";
import Step3 from "@/pages/onboarding/Step3";
import Step4 from "@/pages/onboarding/Step4";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(380); // px-based, more reliable than %
  const isDragging = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("chatWidthPx");
    if (saved) setChatWidth(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatWidthPx", chatWidth);
  }, [chatWidth]);

  const startDragging = (e) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  const onDrag = (e) => {
    if (!isDragging.current || e.clientX === 0) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 280 && newWidth <= 600) setChatWidth(newWidth);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300"
      onMouseMove={onDrag}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <Header />

      <div className="flex flex-1 overflow-hidden">

        {/* MAIN CONTENT */}
        <div
          style={{ width: chatOpen && token ? `calc(100% - ${chatWidth}px - 4px)` : "100%" }}
          className="h-full overflow-y-auto transition-all duration-200"
        >
          <Routes>
            {/* PUBLIC */}
            <Route path="/"        element={<Home />} />
            <Route path="/auth"    element={<Auth />} />
            <Route path="/about"   element={<About />} />
            <Route path="/features" element={<Features />} />

            {/* PROTECTED */}
            <Route path="/path-selection"    element={<PrivateRoute><PathSelection /></PrivateRoute>} />
            <Route path="/onboarding/step1"  element={<PrivateRoute><Step1 /></PrivateRoute>} />
            <Route path="/onboarding/step2"  element={<PrivateRoute><Step2 /></PrivateRoute>} />
            <Route path="/onboarding/step3"  element={<PrivateRoute><Step3 /></PrivateRoute>} />
            <Route path="/onboarding/step4"  element={<PrivateRoute><Step4 /></PrivateRoute>} />
            <Route path="/dashboard"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/day/:dayNumber"    element={<PrivateRoute><DayPage /></PrivateRoute>} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </div>

        {/* CHAT PANEL */}
        {token && chatOpen && (
          <>
            {/* Drag handle */}
            <div
              onMouseDown={startDragging}
              className="w-[4px] flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-purple-500 dark:hover:bg-purple-500 cursor-col-resize transition-colors duration-150"
            />

            {/* Chat panel */}
            <div
              style={{ width: `${chatWidth}px` }}
              className="h-full flex-shrink-0 bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-2xl"
            >
              <Chatbot setChatOpen={setChatOpen} />
            </div>
          </>
        )}
      </div>

      {/* FLOATING CHAT BUTTON — only when closed */}
      {token && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl"
          title="Open AI Chat"
        >
          🤖
        </button>
      )}
    </div>
  );
}