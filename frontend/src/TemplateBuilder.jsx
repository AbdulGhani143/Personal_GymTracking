import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./api";

// ─── Exercise Info Modal ────────────────────────────────────────────────────
function ExerciseInfoModal({ exerciseId, nativeId, exerciseName, onClose }) {
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

  // Full-quality GIF (360p) only in the info modal
  const gifUrl = detail?.imageUrl
    ? `${api.defaults.baseURL}${detail.imageUrl}`
    : nativeId
    ? `${api.defaults.baseURL}/exercises/image/${nativeId}`
    : null;

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
              {/* Full GIF in modal */}
              {gifUrl ? (
                <div className="mb-5 flex justify-center bg-surface-container rounded-xl overflow-hidden">
                  <img src={gifUrl} alt={detail.name} className="w-full max-w-xs h-auto object-contain" />
                </div>
              ) : (
                <div className="mb-5 flex items-center justify-center h-40 bg-surface-container rounded-xl text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-4xl text-outline mr-2">fitness_center</span>
                  No animation available
                </div>
              )}

              {/* Tags */}
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

// ─── Template Builder ───────────────────────────────────────────────────────
export default function TemplateBuilder() {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await api.get(`/exercises/search?q=${encodeURIComponent(searchQuery)}`);
      const results = res.data.results || [];
      if (results.length === 0) setError("No exercises found. Try a different term.");
      setSearchResults(results);
    } catch (err) {
      setError("Failed to search. Check your connection.");
      console.error(err);
    }
    setIsSearching(false);
  };

  const isAlreadyAdded = (exerciseId) => exercises.some((ex) => ex.exerciseId === exerciseId);

  const addExercise = (exercise) => {
    if (isAlreadyAdded(exercise.exerciseId)) return;
    setExercises((prev) => [...prev, { exerciseId: exercise.exerciseId, name: exercise.name }]);
  };

  const removeExercise = (index) => setExercises((prev) => prev.filter((_, i) => i !== index));

  const saveTemplate = async () => {
    if (!name.trim() || exercises.length === 0) return;
    setSaving(true);
    try {
      await api.post("/templates", { name, exercises });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {infoModal && (
        <ExerciseInfoModal
          exerciseId={infoModal.exerciseId}
          nativeId={infoModal.nativeId}
          exerciseName={infoModal.name}
          onClose={() => setInfoModal(null)}
        />
      )}

      <div className="max-w-2xl mx-auto py-4 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">arrow_back</Link>
          <div>
            <h1 className="text-4xl font-headline font-bold text-white">Build Template</h1>
            <p className="text-on-surface-variant text-sm mt-1">Search exercises and build your workout plan.</p>
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="material-symbols-outlined text-base ml-2">close</button>
          </div>
        )}

        {/* Template Name */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Template Name</label>
          <input type="text" placeholder="e.g. Push Day A"
            className="w-full bg-surface-container-high border border-outline-variant/20 focus:border-primary rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Search Exercise Catalog</label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" placeholder='"bench press", "squat", "curl"...'
              className="flex-1 bg-surface-container-high border border-outline-variant/20 focus:border-primary rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isSearching || !searchQuery.trim()}
              className="bg-[#4d8eff] text-white px-6 py-3 rounded-lg font-headline font-bold uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50"
            >
              {isSearching ? "..." : "Search"}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-surface-container-low border border-outline-variant/10 rounded-xl overflow-hidden max-h-[28rem] overflow-y-auto">
              {searchResults.map((ex) => {
                const added = isAlreadyAdded(ex.exerciseId);
                // Small 180p thumbnail (fast, static-like) — NOT the full GIF
                const thumbUrl = ex.imageUrl
                  ? `${api.defaults.baseURL}${ex.imageUrl}?resolution=180`
                  : null;

                return (
                  <div
                    key={ex.exerciseId}
                    className="flex items-center gap-3 px-3 py-3 border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container transition-colors"
                  >
                    {/* Thumbnail (small static image) */}
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={ex.name}
                        className="w-12 h-12 rounded-lg object-cover bg-surface-container flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-outline text-xl">fitness_center</span>
                      </div>
                    )}

                    {/* Name + muscle */}
                    <div className="flex-1 min-w-0">
                      <div className="font-headline font-bold text-white text-sm uppercase truncate">{ex.name}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5 capitalize">
                        {ex.targetMuscle}{ex.equipment ? ` · ${ex.equipment}` : ""}
                      </div>
                    </div>

                    {/* Info button */}
                    <button
                      onClick={() => setInfoModal({ exerciseId: ex.exerciseId, nativeId: ex.id, name: ex.name })}
                      className="material-symbols-outlined text-on-surface-variant hover:text-[#4d8eff] text-xl p-1 flex-shrink-0 transition-colors"
                      title="View details & animation"
                    >
                      info
                    </button>

                    {/* Add button */}
                    <button
                      onClick={() => addExercise(ex)}
                      disabled={added}
                      className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${
                        added ? "bg-surface-container text-on-surface-variant cursor-default" : "bg-[#4d8eff]/10 text-[#4d8eff] hover:bg-[#4d8eff]/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{added ? "check" : "add"}</span>
                      {added ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Exercises */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            Exercises in Template ({exercises.length})
          </h3>
          {exercises.length === 0 ? (
            <div className="text-center p-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-3xl mb-2 block text-outline">add_circle</span>
              Search and add exercises above
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant/10 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-headline font-bold text-on-surface-variant w-5 text-right">{i + 1}</span>
                    <span className="font-headline font-bold text-white uppercase text-sm">{ex.name}</span>
                  </div>
                  <button onClick={() => removeExercise(i)} className="material-symbols-outlined text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={saveTemplate}
          disabled={!name.trim() || exercises.length === 0 || saving}
          className="w-full bg-[#4d8eff] text-white font-headline font-bold py-4 rounded-xl tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : `Save Template (${exercises.length} exercises)`}
        </button>
      </div>
    </>
  );
}
