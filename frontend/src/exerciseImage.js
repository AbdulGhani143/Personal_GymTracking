// ExerciseDB image URL builder
// Images are served via the /image endpoint with the API key as a query param.
// This is the recommended approach per the ExerciseDB docs.

const EXERCISEDB_IMAGE_BASE = "https://exercisedb.p.rapidapi.com/image";
const RAPIDAPI_KEY = "7feadfe479msh8b2f15e02f110dep1c4002jsn040b02831a3c";

/**
 * Build a direct image URL for an exercise GIF.
 * @param {string} exerciseDbId  The native ExerciseDB id (e.g. "0025")
 * @param {string} resolution    "180" | "360" | "720" | "1080"  (depends on your plan)
 */
export function getExerciseImageUrl(exerciseDbId, resolution = "360") {
  if (!exerciseDbId) return null;
  return `${EXERCISEDB_IMAGE_BASE}?exerciseId=${exerciseDbId}&resolution=${resolution}&rapidapi-key=${RAPIDAPI_KEY}`;
}
