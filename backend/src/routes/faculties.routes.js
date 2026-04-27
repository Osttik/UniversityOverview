const express = require("express");
const facultiesService = require("../services/faculties.service");
const programsService = require("../services/programs.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const faculties = await facultiesService.listFaculties();
    res.json(faculties);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const faculty = await facultiesService.createFaculty(req.body);
    res.status(201).json(faculty);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const faculty = await facultiesService.getFaculty(req.params.id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    return res.json(faculty);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const faculty = await facultiesService.updateFaculty(req.params.id, req.body);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    return res.json(faculty);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const faculty = await facultiesService.updateFaculty(req.params.id, req.body);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    return res.json(faculty);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await facultiesService.deleteFaculty(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/programs", async (req, res, next) => {
  try {
    const faculty = await facultiesService.getFaculty(req.params.id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const programs = await programsService.listPrograms({ facultyId: req.params.id });
    return res.json(programs);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
