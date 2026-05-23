import {
    Brain,
    BookOpen,
    Flame,
    BarChart3,
    Sparkles,
    MessageCircle,
} from "lucide-react";
 
const features = [
    {
        title: "Daily Tasks & Quizzes",
        description:
            "Receive 3 focused tasks and a quiz every day designed for your chosen career path.",
        icon: BookOpen,
        badge: "Core Feature",
        badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
    {
        title: "Streak & XP Rewards",
        description:
            "Maintain daily streaks and earn XP for completed tasks and quizzes. Unlock badges and level up.",
        icon: Flame,
        badge: "Gamification",
        badgeColor: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    },
    {
        title: "Progress Analytics",
        description:
            "Track completed tasks, quiz scores, streaks, and overall skill development with dashboards.",
        icon: BarChart3,
        badge: "Analytics",
        badgeColor: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    },
    {
        title: "AI-Personalized Roadmaps",
        description:
            "Get a learning path tailored to your career goals, current skill level, and learning pace. Our AI adapts your roadmap as you progress.",
        icon: Brain,
        badge: "Core Feature",
        badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
    {
        title: "NLP Chatbot Mentorship",
        description:
            "Get instant answers to career and learning questions from our AI-powered mentor.",
        icon: MessageCircle,
        badge: "Coming Soon",
        badgeColor: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    },
    {
        title: "Adaptive Learning Engine",
        description:
            "AI analyzes performance, adjusts difficulty, and recommends resources for improvement.",
        icon: Sparkles,
        badge: "Coming Soon",
        badgeColor: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300",
    },
];
 
export default function Features() {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
 
                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        Platform <span className="text-indigo-600 dark:text-indigo-400">Features</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Everything you need to transform your academic journey into career success
                    </p>
                </div>
 
                {/* Feature Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
 
                        return (
                            <div
                                key={index}
                                className="relative bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl shadow-md p-8 hover:shadow-xl transition duration-300"
                            >
                                {/* Badge */}
                                <span
                                    className={`absolute top-6 right-6 text-xs font-semibold px-3 py-1 rounded-full ${feature.badgeColor}`}
                                >
                                    {feature.badge}
                                </span>
 
                                {/* Icon */}
                                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900 mb-6">
                                    <Icon className="text-indigo-600 dark:text-indigo-400" size={28} />
                                </div>
 
                                {/* Title */}
                                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                                    {feature.title}
                                </h3>
 
                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
 