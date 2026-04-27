const express = require("express");
const universityService = require("../services/universityService");

const router = express.Router();

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const universities = await universityService.list({
      search: req.query.search,
      country: req.query.country,
      city: req.query.city,
      program: req.query.program
    });

    res.json({
      data: universities,
      count: universities.length
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const university = await universityService.getById(req.params.id);

    if (!university) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json({ data: university });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const university = await universityService.create(req.body);
    res.status(201).json({ data: university });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const university = await universityService.update(req.params.id, req.body);

    if (!university) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json({ data: university });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const university = await universityService.patch(req.params.id, req.body);

    if (!university) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.json({ data: university });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await universityService.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "University not found." });
      return;
    }

    res.status(204).send();
  })
);

module.exports = router;
