import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api";

// ─── Exercise Info Modal ────────────────────────────────────────────────────
function ExerciseInfoModal({ exerciseId, exerciseName, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/exercises/${encodeURIComponent(exerciseId)}`);
        setDetail(res.data);
      } catch {
        setError("Could not load exercise details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [exerciseId]);

  const imgUrl = detail?.imageUrl ? `${api.defaults.baseURL}${detail.imageUrl}` : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-surface-container-low w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl md:rounded-2xl border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-container-low z-10 flex justify-between items-center px-5 py-4 border-b border-outline-variant/10">
          <h3 className="font-headline font-bold text-white uppercase text-sm tracking-wide truncate pr-4">
            {exerciseName}
          </h3>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-white">close</button>
        </div>
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined animate-spin text-[#4d8eff]">refresh</span>
              <span className="text-on-surface-variant text-sm">Loading...</span>
            </div>
          )}
          {error && <p className="text-error text-sm text-center py-8">{error}</p>}
          {detail && (
            <>
              {imgUrl ? (
                <div className="mb-5 flex justify-center bg-surface-container rounded-xl overflow-hidden">
                  <img src={imgUrl} alt={detail.name} className="w-full max-w-xs h-auto object-contain" loading="lazy" />
                </div>
              ) : (
                <div className="mb-5 flex items-center justify-center h-40 bg-surface-container rounded-xl text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-4xl text-outline mr-2">fitness_center</span>
                  No animation available
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {detail.muscles?.primary && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#4d8eff]/10 text-[#4d8eff] px-3 py-1.5 rounded-full">{detail.muscles.primary}</span>
                )}
                {detail.bodyPart && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full">{detail.bodyPart}</span>
                )}
                {detail.equipment && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full">{detail.equipment}</span>
                )}
                {detail.muscles?.secondary?.map((m, i) => (
                  <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full">{m}</span>
                ))}
              </div>

              {detail.description && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{detail.description}</p>
                </div>
              )}

              {detail.instructions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Instructions</h4>
                  <ol className="space-y-2">
                    {detail.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4d8eff]/10 text-[#4d8eff] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-on-surface-variant leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Workout Session ───────────────────────────────────────────────────
export default function WorkoutSession() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSession = location.state?.session || null;
  const [session] = useState(initialSession);
  const [exercises, setExercises] = useState(() =>
    initialSession
      ? initialSession.exercises.map((ex) => ({
          ...ex,
          sets:
            ex.sets && ex.sets.length > 0
              ? ex.sets.map((s) => ({ ...s, completed: false }))
              : [{ weight: "", reps: "", completed: false }],
        }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [infoModal, setInfoModal] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!initialSession) navigate("/");
  }, [initialSession, navigate]);

  if (!session) return null;

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const updateSet = (exIdx, setIdx, field, value) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, [field]: value })) }
      )
    );

  const toggleSet = (exIdx, setIdx) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, completed: !s.completed })) }
      )
    );

  const addSet = (exIdx) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: [...ex.sets, { weight: "", reps: "", completed: false }] }
      )
    );

  const removeSet = (exIdx, setIdx) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
      )
    );

  const handleFinish = async () => {
    if (!exercises.some((ex) => ex.sets.some((s) => s.completed))) {
      alert("Check off at least one set before finishing.");
      return;
    }
    setLoading(true);
    try {
      const payload = exercises
        .map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: ex.sets.filter((s) => s.completed).map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })),
        }))
        .filter((ex) => ex.sets.length > 0);

      await api.post("/workouts/save", { sessionId: session.id, date: new Date().toISOString(), exercises: payload });
      navigate("/history");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save workout.");
    } finally {
      setLoading(false);
    }
  };

  const totalDone = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0);
  const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0);

  return (
    <>
      {infoModal && (
        <ExerciseInfoModal exerciseId={infoModal.exerciseId} exerciseName={infoModal.name} onClose={() => setInfoModal(null)} />
      )}

      <div className="pb-36 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pt-2">
          <div>
            <span className="text-[#4d8eff] font-headline font-bold text-xs tracking-widest uppercase mb-1 block">ACTIVE SESSION</span>
            <h2 className="text-4xl font-headline font-bold tracking-tighter text-white">{session.templateName}</h2>
          </div>
          <div className="text-right">
            <div className="text-[#4d8eff] font-headline font-bold text-lg tabular-nums">{fmt(elapsed)}</div>
            <div className="text-xs text-on-surface-variant font-label mt-1">{totalDone}/{totalSets} sets</div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((ex, exIdx) => (
            <section key={exIdx} className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden">
              {/* Exercise title + info */}
              <div className="px-5 py-4 bg-surface-container/40 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-base font-headline font-bold text-white uppercase tracking-tight flex-1 pr-2">{ex.name}</h3>
                <button
                  onClick={() => setInfoModal({ exerciseId: ex.exerciseId, name: ex.name })}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-[#4d8eff] transition-colors px-2 py-1 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-base">info</span>
                  <span className="hidden sm:inline">Info</span>
                </button>
              </div>

              {/* Sets */}
              <div className="px-4 pt-3 pb-1">
                <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_2.5rem] gap-2 mb-2 px-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Set</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Prev</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Weight</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Reps</span>
                  <span className="text-center"><span className="material-symbols-outlined text-sm text-on-surface-variant">done_all</span></span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {ex.sets.map((set, si) => (
                    <div
                      key={si}
                      className={`grid grid-cols-[2.5rem_1fr_1fr_1fr_2.5rem] gap-2 items-center py-1.5 px-1 rounded-lg transition-colors ${
                        set.completed ? "bg-[#4d8eff]/10" : "bg-surface-container-high/40"
                      }`}
                    >
                      <button onClick={() => removeSet(exIdx, si)} className="font-headline font-bold text-[#4d8eff] text-center text-sm hover:text-error transition-colors" title="Remove set">{si + 1}</button>
                      <span className="text-on-surface-variant/40 text-center text-xs">—</span>
                      <input type="number" inputMode="decimal" className="w-full bg-surface-container border-none rounded text-center text-white font-headline text-sm focus:ring-1 focus:ring-primary py-1.5 disabled:opacity-60" placeholder="kg" value={set.weight} disabled={set.completed} onChange={(e) => updateSet(exIdx, si, "weight", e.target.value)} />
                      <input type="number" inputMode="numeric" className="w-full bg-surface-container border-none rounded text-center text-white font-headline text-sm focus:ring-1 focus:ring-primary py-1.5 disabled:opacity-60" placeholder="reps" value={set.reps} disabled={set.completed} onChange={(e) => updateSet(exIdx, si, "reps", e.target.value)} />
                      <button onClick={() => toggleSet(exIdx, si)} className={`flex justify-center items-center h-8 w-8 rounded-lg transition-all ${set.completed ? "bg-[#4d8eff] text-white shadow" : "bg-surface-container text-[#4d8eff] hover:bg-[#4d8eff]/20"}`}>
                        <span className="material-symbols-outlined text-sm" style={set.completed ? { fontVariationSettings: "'FILL' 1" } : {}}>check</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => addSet(exIdx)} className="w-full mb-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> Add Set
                </button>
              </div>
            </section>
          ))}
        </div>

        {/* Finish */}
        <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-6 pt-3 bg-[#131318] border-t border-white/5">
          <button onClick={handleFinish} disabled={loading} className="w-full max-w-2xl mx-auto flex bg-[#4d8eff] hover:bg-primary h-14 rounded-xl items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <span className="text-white font-headline font-black uppercase tracking-widest">{loading ? "Saving..." : "Finish Workout"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
