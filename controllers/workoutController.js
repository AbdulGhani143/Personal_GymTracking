const mongoose = require("mongoose");

const Template = require("../models/Template");
const WorkoutSession = require("../models/WorkoutSession");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const sanitizeSets = (sets, exerciseIndex) => {
  if (!Array.isArray(sets)) {
    throw new ApiError(400, `Exercise ${exerciseIndex + 1} must include a sets array.`);
  }

  return sets.map((set, setIndex) => {
    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps < 0) {
      throw new ApiError(
        400,
        `Exercise ${exerciseIndex + 1}, set ${setIndex + 1} must include valid weight and reps values.`
      );
    }

    return { weight, reps };
  });
};

const sanitizeWorkoutExercises = (exercises) => {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new ApiError(400, "At least one exercise is required.");
  }

  return exercises.map((exercise, index) => {
    if (!exercise || !exercise.exerciseId || !exercise.name) {
      throw new ApiError(400, `Exercise ${index + 1} must include exerciseId and name.`);
    }

    return {
      exerciseId: String(exercise.exerciseId).trim(),
      name: String(exercise.name).trim(),
      sets: sanitizeSets(exercise.sets, index),
    };
  });
};

const serializeSession = (session) => ({
  id: session._id,
  templateId: session.templateId,
  templateName: session.templateName,
  status: session.status,
  startedAt: session.startedAt,
  completedAt: session.completedAt,
  date: session.date,
  exercises: session.exercises,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

const startWorkout = asyncHandler(async (req, res) => {
  const { templateId } = req.body;

  if (!templateId || !mongoose.Types.ObjectId.isValid(templateId)) {
    throw new ApiError(400, "A valid templateId is required.");
  }

  const template = await Template.findOne({
    _id: templateId,
    user: req.user._id,
  })
    .select("name exercises")
    .lean();

  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  const session = await WorkoutSession.create({
    user: req.user._id,
    templateId: templateId,
    templateName: template.name,
    exercises: template.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      sets: [],
    })),
    status: "draft",
    startedAt: new Date(),
  });

  res.status(201).json(serializeSession(session));
});

const saveWorkout = asyncHandler(async (req, res) => {
  const { sessionId, date, exercises } = req.body;

  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "A valid sessionId is required.");
  }

  const session = await WorkoutSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found.");
  }

  if (session.status === "completed") {
    throw new ApiError(400, "This workout session has already been completed.");
  }

  const workoutDate = date ? new Date(date) : new Date();
  if (Number.isNaN(workoutDate.getTime())) {
    throw new ApiError(400, "A valid date is required.");
  }

  session.exercises = sanitizeWorkoutExercises(exercises);
  session.date = workoutDate;
  session.status = "completed";
  session.completedAt = new Date();

  await session.save();

  res.json(serializeSession(session));
});

const getWorkoutHistory = asyncHandler(async (req, res) => {
  const sessions = await WorkoutSession.find({
    user: req.user._id,
    status: "completed",
  })
    .select("templateId templateName status startedAt completedAt date exercises createdAt updatedAt")
    .sort({ date: -1, createdAt: -1 })
    .lean();

  res.json(sessions.map(serializeSession));
});

const deleteWorkoutSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid session id.");
  }

  const session = await WorkoutSession.findOneAndDelete({
    _id: id,
    user: req.user._id,
  }).select("_id");

  if (!session) {
    throw new ApiError(404, "Workout session not found.");
  }

  res.json({
    message: "Workout session deleted successfully.",
    id: session._id,
  });
});

module.exports = {
  startWorkout,
  saveWorkout,
  getWorkoutHistory,
  deleteWorkoutSession,
};
