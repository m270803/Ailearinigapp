import React, { useEffect, useState } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import { FileText, BrainCircuit, BookOpen, Clock } from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalDocuments: 0,
      totalFlashcards: 0,
      totalQuizzes: 0,
    },
    recentActivity: {
      documents: [],
      quizzes: [],
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await progressService.getDashboardData();
      console.log("Dashboard data loaded:", data);

      if (data && data.data) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  /* combine activity */
  const activities = [
    ...(dashboardData.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      description: doc.title,
      timestamp: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: "document",
    })),
    ...(dashboardData.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      description: quiz.title,
      timestamp: quiz.lastAttempted,
      link: `/quizzes/${quiz._id}`,
      type: "quiz",
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <AppLayout>
      <div className="mb-8">
  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
    Dashboard
  </h1>
  <p className="text-slate-600 mt-2 text-sm">
    Track your progress, review activity, and monitor your learning journey.
  </p>
</div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[
          {
            label: "Total Documents",
            value: dashboardData?.overview?.totalDocuments || 0,
            icon: FileText,
          },
          {
            label: "Total Flashcards",
            value: dashboardData?.overview?.totalFlashcards || 0,
            icon: BookOpen,
          },
          {
            label: "Total Quizzes",
            value: dashboardData?.overview?.totalQuizzes || 0,
            icon: BrainCircuit,
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={idx}
              style={{
                background:
                  "linear-gradient(to bottom right, #6366f1, #3b82f6)",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      opacity: 0.9,
                    }}
                  >
                    {stat.label}
                  </p>

                  <p
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: "bold",
                      color: "#fff",
                      marginTop: "0.5rem",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>

                <Icon style={{ color: "#fff", opacity: 0.8 }} size={40} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-600" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-medium text-slate-900 tracking-tight">
            Recent Activity
          </h3>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="group flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {activity.type === "document"
                      ? "Accessed Document: "
                      : "Attempted Quiz: "}
                    <span>{activity.description}</span>
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>

                {activity.link && (
                  <a
                    href={activity.link}
                    className="ml-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>

            <p className="text-sm text-slate-600">No recent activity</p>
            <p className="text-xs text-slate-500 mt-1">
              Start studying to see activity here
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;