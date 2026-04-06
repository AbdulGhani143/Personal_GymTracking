import { useState, useEffect } from "react";
import api from "./api";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // session id to confirm

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/workouts/history");
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Group sessions by template name
  const groupByTemplate = () => {
    const grouped = {};
    sessions.forEach((session) => {
      const key = session.templateName || "Untitled";
      if (!grouped[key]) {
        grouped[key] = {
          templateName: key,
          templateId: session.templateId,
          sessions: [],
        };
      }
      grouped[key].sessions.push(session);
    });
    Object.values(grouped).forEach((g) =>
      g.sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    return Object.values(grouped);
  };

  const templateGroups = groupByTemplate();

  const toggleTemplate = (name) => {
    if (expandedTemplate === name) {
      setExpandedTemplate(null);
      setExpandedSession(null);
    } else {
      setExpandedTemplate(name);
      setExpandedSession(null);
    }
  };

  const toggleSession = (id) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/workouts/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setConfirmDelete(null);
      setExpandedSession(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete session.");
      setConfirmDelete(null);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDuration = (session) => {
    if (!session.startedAt || !session.completedAt) return null;
    const ms = new Date(session.completedAt) - new Date(session.startedAt);
    const mins = Math.round(ms / 60000);
    return mins > 0 ? `${mins} min` : "<1 min";
  };

  const getTotalVolume = (session) => {
    let total = 0;
    session.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        total += (s.weight || 0) * (s.reps || 0);
      });
    });
    return total;
  };

  const getTotalSets = (session) => {
    return session.exercises?.reduce((n, ex) => n + (ex.sets?.length || 0), 0) || 0;
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={() => setConfirmDelete(null)}>
          <div
            className="bg-surface-container-low w-full max-w-sm mx-4 rounded-2xl border border-outline-variant/20 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">delete_forever</span>
              </div>
              <h3 className="font-headline font-bold text-white text-lg">Delete Session?</h3>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              This will permanently remove this workout session from your history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface-variant font-headline font-bold text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(confirmDelete)}
                className="flex-1 py-3 rounded-xl bg-error text-white font-headline font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="font-headline text-[#4d8eff] font-bold tracking-widest uppercase text-xs mb-2 block">
            Performance Archive
          </span>
          <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tighter text-white mb-3">
            History
          </h2>
          <div className="h-1 w-20 bg-[#4d8eff] rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-16 justify-center">
            <span className="material-symbols-outlined animate-spin text-[#4d8eff]">refresh</span>
            <span className="text-on-surface-variant">Loading archive...</span>
          </div>
        ) : templateGroups.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">history</span>
            <p className="text-on-surface-variant font-medium">No workout history yet.</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">Complete a workout to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templateGroups.map((group) => {
              const isOpen = expandedTemplate === group.templateName;
              const latestSession = group.sessions[0];

              return (
                <div
                  key={group.templateName}
                  className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden"
                >
                  {/* Template Header */}
                  <button
                    onClick={() => toggleTemplate(group.templateName)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors text-left"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen ? "bg-[#4d8eff] text-white" : "bg-[#4d8eff]/10 text-[#4d8eff]"
                    }`}>
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-white text-base uppercase tracking-tight truncate">
                        {group.templateName}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}
                        <span className="mx-1.5 text-outline-variant">·</span>
                        Last: {formatDate(latestSession.date)}
                      </p>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Sessions List */}
                  {isOpen && (
                    <div className="border-t border-outline-variant/10">
                      {group.sessions.map((session) => {
                        const sesOpen = expandedSession === session.id;
                        const duration = getDuration(session);
                        const volume = getTotalVolume(session);
                        const sets = getTotalSets(session);

                        return (
                          <div key={session.id} className="border-b border-outline-variant/5 last:border-b-0">
                            {/* Session Row */}
                            <div className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container/60 transition-colors">
                              <button
                                onClick={() => toggleSession(session.id)}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-headline font-bold text-white">
                                    {formatDate(session.date)}
                                  </span>
                                  <span className="text-xs text-on-surface-variant">{formatTime(session.date)}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {duration && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">timer</span>
                                      {duration}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">123</span>
                                    {sets} sets
                                  </span>
                                  {volume > 0 && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4d8eff] flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">monitoring</span>
                                      {volume.toLocaleString()} kg
                                    </span>
                                  )}
                                </div>
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => setConfirmDelete(session.id)}
                                className="material-symbols-outlined text-outline hover:text-error text-lg p-1 flex-shrink-0 transition-colors"
                                title="Delete session"
                              >
                                delete
                              </button>

                              <button
                                onClick={() => toggleSession(session.id)}
                                className="flex-shrink-0"
                              >
                                <span className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform ${sesOpen ? "rotate-180" : ""}`}>
                                  expand_more
                                </span>
                              </button>
                            </div>

                            {/* Session Detail */}
                            {sesOpen && session.exercises && (
                              <div className="px-5 pb-4 space-y-3">
                                {session.exercises.map((ex, exIdx) => (
                                  <div key={exIdx} className="bg-surface-container rounded-xl p-3">
                                    <div className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                                      {ex.name}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                      {ex.sets.map((set, si) => (
                                        <div key={si} className="bg-surface-container-high py-1.5 px-3 rounded-lg flex justify-between items-baseline">
                                          <span className="text-[10px] text-on-surface-variant font-bold uppercase">S{si + 1}</span>
                                          <span className="text-sm font-headline font-bold text-white">
                                            {set.weight}<span className="text-[#4d8eff]">×{set.reps}</span>
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
