import React from "react";
import { Zap } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        
        <div className="flex items-center justify-center gap-2 mb-3 font-display text-lg font-bold">
          <Zap className="h-4 w-4 text-primary" />
          <span className="gradient-text">CareerKraft</span>
        </div>

        <p className="text-sm text-muted-foreground">
          AI Companion from Classroom to Career
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          © 2026 CareerKraft. Built for students, by students.
        </p>

      </div>
    </footer>
  );
}

export default Footer;
