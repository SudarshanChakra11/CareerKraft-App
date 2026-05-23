import { Target, Lightbulb, Heart, Users, ChevronDown } from "lucide-react";
import ScrollToTop from "./ScrollToTop";

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ================= HERO SECTION ================= */}
      <section className="text-center pt-20 pb-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About <span className="gradient-text">CareerKraft</span>
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground">
          Bridging classroom learning and career readiness through AI-powered,
          gamified guidance.
        </p>
        {/* Scroll Down Button */}
        <a href="#mission" className="flex justify-center mt-8 animate-bounce">
          <ChevronDown className="w-10 h-10 text-primary cursor-pointer" />
        </a>
      </section>

      {/* ================= MISSION & PROBLEM ================= */}
      <section id="mission" className="pt-12 pb-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Mission Card */}
          <div className="bg-card p-8 rounded-2xl shadow-md">
            <Target className="text-primary mb-4" size={32} />
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground">
              To empower every student with personalized, AI-driven career
              guidance that transforms uncertainty into confidence. We believe
              every student deserves a clear roadmap from classroom to career.
            </p>
          </div>

          {/* Problem Card */}
          <div className="bg-card p-8 rounded-2xl shadow-md">
            <Lightbulb className="text-orange-500 mb-4" size={32} />
            <h2 className="text-2xl font-bold mb-3">The Problem</h2>
            <p className="text-muted-foreground">
              Students often lack personalized guidance and consistent learning
              paths. Traditional education doesn’t always prepare them for the
              rapidly evolving job market, leaving a gap between learning and
              industry demands.
            </p>
          </div>

        </div>
      </section>

      {/* ================= WHY CAREERKRAFT ================= */}
      <section id="why" className="py-24 px-4 text-center">
        <Heart className="mx-auto text-red-500 mb-4" size={36} />
        <h2 className="text-3xl font-bold mb-4">Why CareerKraft?</h2>

        <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
          We noticed that students struggle with knowing what to learn, staying
          consistent, and tracking progress. CareerKraft solves this through
          AI-personalized roadmaps, gamified daily tasks, and beautiful
          progress dashboards.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          <div className="bg-card p-6 rounded-xl shadow">
            🎯
            <h3 className="font-semibold mt-3">Focused Learning</h3>
          </div>

          <div className="bg-card p-6 rounded-xl shadow">
            🔥
            <h3 className="font-semibold mt-3">Daily Consistency</h3>
          </div>

          <div className="bg-card p-6 rounded-xl shadow">
            📊
            <h3 className="font-semibold mt-3">Clear Progress</h3>
          </div>

        </div>
      </section>

    </div>
  );
}

export default About;