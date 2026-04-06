import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

export default function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null); // templateId being started
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (templateId) => {
    setStarting(templateId);
    try {
      const res = await api.post("/workouts/start", { templateId });
      // initialise one set per exercise so user sees rows immediately
      const session = {
        ...res.data,
        exercises: res.data.exercises.map((ex) => ({
          ...ex,
          sets: [{ weight: "", reps: "", completed: false }],
        })),
      };
      navigate(`/session/${res.data.id}`, { state: { session } });
    } catch (err) {
      console.error("Failed to start workout", err);
      alert(err.response?.data?.message || "Failed to start workout");
    } finally {
      setStarting(null);
    }
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${templateId}`);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const colorAccents = [
    { icon: "text-primary", bg: "bg-surface-container-high", hover: "hover:bg-primary hover:text-surface-dim" },
    { icon: "text-tertiary", bg: "bg-surface-container-high", hover: "hover:bg-tertiary hover:text-surface-dim" },
    { icon: "text-secondary", bg: "bg-surface-container-high", hover: "hover:bg-secondary hover:text-surface-dim" },
  ];

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter text-white mb-2">
          Dashboard
        </h1>
        <p className="text-on-surface-variant font-medium tracking-wide border-l-2 border-primary pl-3">
          SYSTEM STATUS: OPTIMIZED
        </p>
      </div>

      {/* Section: Workout Templates */}
      <section>
        <div className="mb-8">
          <h2 className="text-xs font-label font-bold uppercase tracking-[0.3em] text-primary mb-2">
            Technical Core
          </h2>
          <h3 className="text-3xl font-headline font-bold text-white">Workout Templates</h3>
        </div>

        {loading ? (
          <p className="text-on-surface-variant">Loading templates...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, idx) => {
              const accent = colorAccents[idx % colorAccents.length];
              const isStarting = starting === template.id;

              return (
                <div
                  key={template.id}
                  className="bg-surface-container-low rounded-[22px] p-6 flex flex-col justify-between border border-outline-variant/10 hover:border-outline-variant/30 transition-all duration-300"
                >
                  {/* Card Top */}
                  <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-surface-container rounded-2xl">
                        <span className={`material-symbols-outlined ${accent.icon}`}>
                          fitness_center
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/edit/${template.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="material-symbols-outlined text-outline hover:text-[#4d8eff] transition-colors p-1"
                          title="Edit template"
                        >
                          edit
                        </Link>
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          className="material-symbols-outlined text-outline hover:text-error transition-colors p-1"
                          title="Delete template"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                    <h4 className="text-4xl font-headline font-bold text-white mb-1">
                      {template.name}
                    </h4>
                    <p className="text-on-surface-variant text-sm font-medium">
                      {template.exercises.length}{" "}
                      {template.exercises.length === 1 ? "Exercise" : "Exercises"}
                    </p>
                  </div>

                  {/* Card Bottom */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {template.exercises.slice(0, 3).map((ex, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1 rounded-md"
                        >
                          {ex.name}
                        </span>
                      ))}
                      {template.exercises.length > 3 && (
                        <span className="text-[10px] font-label font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                          +{template.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleStartWorkout(template.id)}
                      disabled={isStarting}
                      className={`w-full ${accent.bg} text-white py-4 rounded-xl font-headline font-bold text-sm tracking-widest uppercase ${accent.hover} transition-all active:scale-95 disabled:opacity-50`}
                    >
                      {isStarting ? "Starting..." : "Start Workout"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block text-outline">fitness_center</span>
            <p className="font-headline font-bold text-xl text-white mb-2">No Templates Yet</p>
            <p className="text-sm">Use the <b>Build</b> tab in the navigation to create your first template.</p>
          </div>
        )}
      </section>

    </>
  );
}
