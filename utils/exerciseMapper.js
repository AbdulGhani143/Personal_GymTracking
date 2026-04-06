const { encodeExerciseId } = require("./exerciseId");

/**
 * Map an ExerciseDB exercise to the search result shape returned by our API.
 * ExerciseDB shape: { id, name, bodyPart, target, equipment, secondaryMuscles, instructions, description }
 * Note: gifUrl is NOT returned by the API; images are accessed via a separate /image endpoint.
 */
const mapExerciseSearchResult = (exercise) => ({
  exerciseId: encodeExerciseId(exercise),
  id: exercise.id,
  name: exercise.name,
  targetMuscle: exercise.target || exercise.bodyPart || null,
  bodyPart: exercise.bodyPart || null,
  equipment: exercise.equipment || null,
});

/**
 * Map an ExerciseDB exercise to the full detail shape.
 */
const mapExerciseDetail = (exercise) => ({
  exerciseId: encodeExerciseId(exercise),
  id: exercise.id,
  name: exercise.name,
  description: exercise.description || null,
  instructions: Array.isArray(exercise.instructions)
    ? exercise.instructions
    : typeof exercise.instructions === "string"
    ? exercise.instructions.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : [],
  muscles: {
    primary: exercise.target || null,
    secondary: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : [],
  },
  bodyPart: exercise.bodyPart || null,
  equipment: exercise.equipment || null,
  difficulty: exercise.difficulty || null,
  category: exercise.category || null,
});

module.exports = {
  mapExerciseSearchResult,
  mapExerciseDetail,
};
