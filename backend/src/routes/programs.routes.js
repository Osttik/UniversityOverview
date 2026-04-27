const express = require("express");
const programsService = require("../services/programs.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const programs = await programsService.listPrograms({ facultyId: req.query.facultyId });
    res.json(programs);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const program = await programsService.createProgram(req.body);
    res.status(201).json(program);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const program = await programsService.getProgram(req.params.id);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.json(program);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const program = await programsService.updateProgram(req.params.id, req.body);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.json(program);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const program = await programsService.updateProgram(req.params.id, req.body);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.json(program);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await programsService.deleteProgram(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
