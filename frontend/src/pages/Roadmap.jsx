import RoadmapGenerator from "@/comps/ui/RoadmapGenerator";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Saved Roadmap
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View your personalized roadmap, progress, milestones and daily tasks.
          </p>
        </div>
        <RoadmapGenerator />
      </div>
    </div>
  );
}
