const ApiError = require("./ApiError");

const EXERCISE_ID_PREFIX = "edb_";

const toBase64Url = (value) =>
  Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

/**
 * Encode an ExerciseDB exercise object into a stable exerciseId string.
 * We store the native ExerciseDB id plus the name for display fallback.
 */
const encodeExerciseId = (exercise) => {
  const payload = JSON.stringify({ id: exercise.id, name: exercise.name });
  return `${EXERCISE_ID_PREFIX}${toBase64Url(payload)}`;
};

/**
 * Decode an exerciseId back to { id, name }
 */
const decodeExerciseId = (exerciseId) => {
  if (!exerciseId || typeof exerciseId !== "string") {
    throw new ApiError(400, "Invalid exerciseId.");
  }

  // Support both old prefix (ext_) and new prefix (edb_) gracefully
  const raw = exerciseId.startsWith(EXERCISE_ID_PREFIX)
    ? exerciseId.slice(EXERCISE_ID_PREFIX.length)
    : exerciseId.startsWith("ext_")
    ? exerciseId.slice(4)
    : exerciseId;

  try {
    const decoded = JSON.parse(fromBase64Url(raw));
    return {
      id: decoded.id || null,
      name: decoded.n || decoded.name || "",
    };
  } catch {
    throw new ApiError(400, "Invalid exerciseId.");
  }
};

module.exports = {
  EXERCISE_ID_PREFIX,
  encodeExerciseId,
  decodeExerciseId,
};
