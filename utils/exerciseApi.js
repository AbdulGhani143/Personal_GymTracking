const axios = require("axios");
const ApiError = require("./ApiError");

const apiClient = axios.create({
  baseURL: process.env.EXERCISEDB_BASE_URL || "https://exercisedb.p.rapidapi.com",
  timeout: 10000,
});

const searchCache = new Map();
const inFlightSearches = new Map();
const DEFAULT_CACHE_TTL_MS = Number(process.env.EXERCISE_SEARCH_CACHE_TTL_MS) || 10 * 60 * 1000;
const MAX_SEARCH_RESULTS = 15;

const normalizeSearchQuery = (query) =>
  String(query || "").trim().toLowerCase().replace(/\s+/g, " ");

const readCachedSearch = (cacheKey) => {
  const entry = searchCache.get(cacheKey);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(cacheKey);
    return null;
  }
  return entry.data;
};

const writeCachedSearch = (cacheKey, data) => {
  searchCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + DEFAULT_CACHE_TTL_MS,
  });
};

const ensureApiKey = () => {
  if (!process.env.EXERCISEDB_API_KEY) {
    throw new ApiError(500, "ExerciseDB API key is not configured.");
  }
};

const rapidApiHeaders = () => ({
  "X-RapidAPI-Key": process.env.EXERCISEDB_API_KEY,
  "X-RapidAPI-Host": process.env.EXERCISEDB_API_HOST || "exercisedb.p.rapidapi.com",
});

const handleApiError = (error, fallbackData = null) => {
  if (fallbackData) return fallbackData;
  if (error.response) {
    if (error.response.status === 429) {
      throw new ApiError(429, "Exercise search is temporarily rate limited. Please try again soon.");
    }
    const status = error.response.status >= 500 ? 502 : error.response.status;
    throw new ApiError(status, "Failed to fetch exercise data from the external provider.");
  }
  throw new ApiError(502, "Unable to reach the external exercise provider.");
};

/**
 * Search exercises by name using ExerciseDB
 * GET /exercises/name/{name}?limit=15
 */
const searchExercises = async (query) => {
  ensureApiKey();

  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return [];

  const cached = readCachedSearch(normalizedQuery);
  if (cached) return cached;

  if (inFlightSearches.has(normalizedQuery)) {
    return inFlightSearches.get(normalizedQuery);
  }

  const requestPromise = (async () => {
    const stale = searchCache.get(normalizedQuery)?.data || null;
    try {
      const response = await apiClient.get(
        `/exercises/name/${encodeURIComponent(normalizedQuery)}`,
        {
          headers: rapidApiHeaders(),
          params: { limit: MAX_SEARCH_RESULTS, offset: 0 },
        }
      );
      const results = Array.isArray(response.data) ? response.data : [];
      writeCachedSearch(normalizedQuery, results);
      return results;
    } catch (error) {
      return handleApiError(error, stale);
    } finally {
      inFlightSearches.delete(normalizedQuery);
    }
  })();

  inFlightSearches.set(normalizedQuery, requestPromise);
  return requestPromise;
};

/**
 * Fetch a single exercise by its ExerciseDB ID
 * GET /exercises/exercise/{id}
 */
const getExerciseByExerciseDbId = async (exerciseDbId) => {
  ensureApiKey();
  try {
    const response = await apiClient.get(`/exercises/exercise/${exerciseDbId}`, {
      headers: rapidApiHeaders(),
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

module.exports = {
  MAX_SEARCH_RESULTS,
  normalizeSearchQuery,
  searchExercises,
  getExerciseByExerciseDbId,
};
