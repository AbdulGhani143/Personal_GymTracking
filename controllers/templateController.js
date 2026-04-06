const mongoose = require("mongoose");

const Template = require("../models/Template");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const sanitizeTemplateExercises = (exercises) => {
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
    };
  });
};

const getTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find({ user: req.user._id })
    .select("name exercises createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    templates.map((template) => ({
      id: template._id,
      name: template.name,
      exercises: template.exercises,
      createdAt: template.createdAt,
    }))
  );
});

const createTemplate = asyncHandler(async (req, res) => {
  const { name, exercises } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "Template name is required.");
  }

  const template = await Template.create({
    user: req.user._id,
    name: String(name).trim(),
    exercises: sanitizeTemplateExercises(exercises),
  });

  res.status(201).json({
    id: template._id,
    name: template.name,
    exercises: template.exercises,
    createdAt: template.createdAt,
  });
});

const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, exercises } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid template id.");
  }

  const template = await Template.findOne({ _id: id, user: req.user._id });

  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw new ApiError(400, "Template name cannot be empty.");
    }
    template.name = String(name).trim();
  }

  if (exercises !== undefined) {
    template.exercises = sanitizeTemplateExercises(exercises);
  }

  await template.save();

  res.json({
    id: template._id,
    name: template.name,
    exercises: template.exercises,
    createdAt: template.createdAt,
  });
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid template id.");
  }

  const template = await Template.findOneAndDelete({
    _id: id,
    user: req.user._id,
  }).select("_id");

  if (!template) {
    throw new ApiError(404, "Template not found.");
  }

  res.json({
    message: "Template deleted successfully.",
    id: template._id,
  });
});

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
