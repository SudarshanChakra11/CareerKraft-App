import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/comps/ui/button";
import { Zap, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { getStoredUser, clearStoredUser } from "@/lib/store";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isLoggedIn = !!user && !!user.name;

  // ── Live XP + streak from store ──
  const streak     = useAppStore((s) => s.streak);
  const xp         = useAppStore((s) => s.xp);
  const resetStore = useAppStore((s) => s.resetStore); // ✅ add this

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("ck-theme");
    return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ck-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    // ✅ Wipe all user state — xp, progress, badges, onboarding, tasks
    resetStore();

    // ✅ Clear localStorage (keep theme preference)
    const theme = localStorage.getItem("ck-theme");
    clearStoredUser();
    localStorage.removeItem("token");
    localStorage.removeItem("selectedPath");
    if (theme) localStorage.setItem("ck-theme", theme); // restore theme

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className="gradient-primary text-primary-foreground rounded-lg p-1.5">
            <Zap className="h-5 w-5" />
          </span>
          <span className="gradient-text">CareerKraft</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">

          <Link to="/about" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>

          <Link to="/features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>

          {isLoggedIn && (
            <Link to="/roadmap" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Roadmap
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>

              <div className="flex items-center gap-3">
                {/* Live streak */}
                <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                  🔥 {streak}
                </span>
                {/* Live XP */}
                <span className="flex items-center gap-1 text-sm font-bold text-purple-600">
                  ⚡ {xp} XP
                </span>

                {/* Dark mode toggle */}
                <button
                  onClick={() => setDark((d) => !d)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title="Toggle theme"
                >
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark((d) => !d)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Button
                onClick={() => navigate("/auth")}
                className="gradient-primary border-0 font-semibold"
              >
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile: streak + xp inline when logged in */}
        {isLoggedIn && (
          <div className="flex md:hidden items-center gap-2 text-xs font-bold mr-2">
            <span className="text-orange-500">🔥 {streak}</span>
            <span className="text-purple-600">⚡ {xp}</span>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 flex flex-col gap-3 animate-slide-up">

          <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-semibold">
            About
          </Link>

          <Link to="/features" onClick={() => setMobileOpen(false)} className="text-sm font-semibold">
            Features
          </Link>

          {isLoggedIn && (
            <Link to="/roadmap" onClick={() => setMobileOpen(false)} className="text-sm font-semibold">
              Roadmap
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-semibold">
                Dashboard
              </Link>

              <button
                onClick={() => setDark((d) => !d)}
                className="text-sm font-semibold text-left"
              >
                {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { handleLogout(); setMobileOpen(false); }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => { navigate("/auth"); setMobileOpen(false); }}
              className="gradient-primary border-0 font-semibold"
            >
              Get Started
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;