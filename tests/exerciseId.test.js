const assert = require("node:assert/strict");

const { encodeExerciseId, decodeExerciseId } = require("../utils/exerciseId");
const { normalizeSearchQuery } = require("../utils/exerciseApi");

const exercise = {
  name: "Bench Press",
  muscle: "chest",
  type: "strength",
  equipment: "barbell",
};

const encoded = encodeExerciseId(exercise);
const decoded = decodeExerciseId(encoded);

assert.deepEqual(decoded, {
  name: "Bench Press",
  muscle: "chest",
  type: "strength",
  equipment: "barbell",
});

assert.equal(normalizeSearchQuery("  Bench    Press  "), "bench press");
assert.throws(() => decodeExerciseId("bad-id"));

console.log("exerciseId and query normalization smoke tests passed");
