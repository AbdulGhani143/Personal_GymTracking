const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { decodeExerciseId } = require("../utils/exerciseId");
const { searchExercises, getExerciseByExerciseDbId } = require("../utils/exerciseApi");
const { mapExerciseDetail, mapExerciseSearchResult } = require("../utils/exerciseMapper");
const axios = require("axios");

const searchExerciseCatalog = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    throw new ApiError(400, "Query parameter q is required.");
  }

  const exercises = await searchExercises(query);

  const results = exercises.map((ex) => {
    const base = mapExerciseSearchResult(ex);
    return {
      ...base,
      // Use the proxy route which handles auth headers
      imageUrl: `/exercises/image/${ex.id}`,
    };
  });

  res.json({ results });
});

/**
 * Proxy for ExerciseDB images to avoid CORS and exposing API keys in the frontend.
 */
const getExerciseImageProxy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resolution = req.query.resolution || "360";

  const targetUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(id)}&resolution=${resolution}`;

  try {
    const response = await axios({
      method: "get",
      url: targetUrl,
      responseType: "stream",
      headers: {
        "X-RapidAPI-Key": process.env.EXERCISEDB_API_KEY,
        "X-RapidAPI-Host": process.env.EXERCISEDB_API_HOST || "exercisedb.p.rapidapi.com",
      },
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "image/gif");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.data.pipe(res);
  } catch (error) {
    console.error(`Image proxy failed for ${id}:`, error.message);
    res.status(502).json({ message: "Unable to retrieve exercise animation." });
  }
});

const getExerciseById = asyncHandler(async (req, res) => {
  const decoded = decodeExerciseId(req.params.id);

  if (decoded.id) {
    const exercise = await getExerciseByExerciseDbId(decoded.id);
    if (!exercise) {
      throw new ApiError(404, "Exercise not found.");
    }
    const result = mapExerciseDetail(exercise);
    return res.json({
      ...result,
      imageUrl: `/exercises/image/${exercise.id}`,
    });
  }

  const candidates = await searchExercises(decoded.name);
  const match = candidates.find(
    (ex) => ex.name.toLowerCase() === decoded.name.toLowerCase()
  );

  if (!match) {
    throw new ApiError(404, "Exercise not found.");
  }

  const result = mapExerciseDetail(match);
  res.json({
    ...result,
    imageUrl: `/exercises/image/${match.id}`,
  });
});

module.exports = {
  searchExerciseCatalog,
  getExerciseById,
  getExerciseImageProxy,
};
