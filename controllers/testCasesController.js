const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const superAuth = require("../middleware/superAdmin");
const { TestCases, categories } = require("../models");

router.post("/test/:categoryId", [authToken], async (req, res) => {
  const category = await categories.findOne({
    where: { id: req.params.categoryId }
  });
  if (!category) return res.status(404).send({ message: "Not Found" });

  if (category.status !== "show")
    return res.status(403).send({
      message: `Category status ${category.status}`,
      notes: category.notes
    });

  await TestCases.create(req.body)
    .then(async () => {
      res.status(201).send({ messgae: "success", Testing: req.body });
      await categories.update(
        { status: "hide", notes: req.body.reason },
        { where: { id: req.params.categoryId } }
      );
    })
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/finish/:categoryId/:caseId", [authToken], async (req, res) => {
  const category = await categories.findOne({
    where: { id: req.params.categoryId }
  });
  if (!category) return res.status(404).send({ message: "Not Found" });

  await categories
    .update(
      { status: "show", notes: null },
      { where: { id: req.params.categoryId } }
    )
    .then(async () => {
      await TestCases.update(
        { outcome: req.body.outcome },
        { where: { id: req.params.caseId } }
      )
        .then(() => res.status(200).send({ message: "succes" }))
        .catch(err =>
          res
            .status(500)
            .send({ error: `Error updating test case: ${err.message}` })
        );
    })
    .catch(err =>
      res.status(500).send({ error: `Error updating category: ${err}` })
    );
});

router.put("/update/case/:caseId", [authToken], async (req, res) => {
  const testCase = await TestCases.findOne({
    where: { id: req.params.caseId }
  });
  if (!testCase) return res.status(404).send({ message: "Not Found" });

  await TestCases.update(req.body, { where: { id: req.params.caseId } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.delete("/case/:caseId", [authToken, superAuth], async (req, res) => {
  const testCase = await TestCases.findOne({
    where: { id: req.params.caseId }
  });
  if (!testCase) return res.status(404).send({ message: "Not Found" });

  await TestCases.destroy({ where: { id: req.params.caseId } })
    .then(() => res.status(200).send({ message: "succes" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

module.exports = router;
