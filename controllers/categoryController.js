const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const superAdmin = require("../middleware/superAdmin");
const { categories } = require("../models");
const _ = require("lodash");

router.post("/add/category", [authToken, superAdmin], async (req, res) => {
  const isFound = await categories.findOne({
    where: { category: req.body.category }
  });

  if (isFound) return res.status(302).send({ message: "already exsits" });

  const Category = {
    category: req.body.category,
    subCategory: JSON.stringify(req.body.subCategories)
  };

  await categories
    .create(Category)
    .then(() => res.status(201).send({ message: "sucess", category: Category }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.get("/all", [authToken], async (req, res) => {
  const category = await categories.findAll();

  res.status(200).send({ Categories: category });
});

router.get("/category/:id", [authToken], async (req, res) => {
  const category = await categories.findOne({ where: { id: req.params.id } });
  if (!category) return res.status(404).send({ message: "Not found" });

  res.status(200).send({ Category: category });
});

router.put(
  "/update/category/status/:id",
  [authToken, superAdmin],
  async (req, res) => {
    const category = await categories.findOne({ where: { id: req.params.id } });
    if (!category) return res.status(404).send({ message: "Not found" });

    await categories
      .update(req.body, { where: { id: req.params.id } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.put(
  "/add/subcategory/:id",
  [authToken, superAdmin],
  async (req, res) => {
    const category = await categories.findOne({ where: { id: req.params.id } });
    if (!category) return res.status(404).send({ message: "Not found" });

    const sub = JSON.parse(category.subCategory);
    if (sub.includes(req.body.subCategory))
      return res.status(302).send({ message: "Category already exsits" });

    sub.push(req.body.subCategory);
    await categories
      .update(
        { subCategory: JSON.stringify(sub) },
        { where: { id: req.params.id } }
      )
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.put(
  "/remove/subcategory/:id",
  [authToken, superAdmin],
  async (req, res) => {
    const category = await categories.findOne({ where: { id: req.params.id } });
    if (!category) return res.status(404).send({ message: "Not found" });

    const sub = JSON.parse(category.subCategory);
    if (!sub.includes(req.body.subCategory))
      return res.status(404).send({ message: "Category not found" });

    sub.splice(sub.indexOf(req.body.subCategory), 1);
    await categories
      .update(
        { subCategory: JSON.stringify(sub) },
        { where: { id: req.params.id } }
      )
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.get("/subcategories/:id", [authToken], async (req, res) => {
  const category = await categories.findOne({
    where: { id: req.params.id }
  });
  if (!category) return res.status(404).send({ message: "Not found" });

  const subCategories = JSON.parse(category.subCategory);

  res.status(200).send({ subCategories: subCategories });
});

router.get("/read/show", [authToken], async (req, res) => {
  const Categories = await categories.findAll({where: {status: 'show'}});
  
  res.status(200).send(Categories);
});

router.get('/read/hide', [authToken], async (req, res) => {
  const Categories = await categories.findAll({where: {status: 'hide'}});
  
  res.status(200).send(Categories);
})

module.exports = router;
