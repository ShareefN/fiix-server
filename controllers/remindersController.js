const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const { reminders, users, contractors } = require("../models");

router.post("/reminder/:type/:typeId", [authToken], async (req, res) => {
  if (!req.params.type || !req.params.typeId || !req.body.reminder)
    return res.status(400).send({ message: "Bad Request" });

  if (req.params.type === "user") {
    const user = await users.findOne({ where: { id: req.params.typeId } });
    if (!user) return res.status(404).send({ message: "user not found" });

    await reminders
      .create({
        userId: user.id,
        status: "new",
        item: req.body.reminder
      })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err }));
  }

  if (req.params.type === "contractor") {
    const contractor = await contractors.findOne({
      where: { id: req.params.typeId }
    });
    if (!contractor)
      return res.status(404).send({ message: "Contractor not found" });

    await reminders
      .create({
        contractorId: contractor.id,
        status: "new",
        item: req.body.reminder
      })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err }));
  }
});

router.put(
  "/update/reminder/:reminderId/:type/:typeId",
  [authToken],
  async (req, res) => {
    if (
      !req.params.reminderId ||
      !req.params.typeId ||
      !req.params.type ||
      !req.body.status
    )
      return res.status(400).send({ message: "Bad request" });

    if (req.params.type === "user") {
      const reminder = await reminders.findOne({
        where: { id: req.params.reminderId }
      });
      if (!reminder)
        return res.status(404).send({ message: "reminder not found" });

      if (reminder.userId == req.params.typeId) {
        await reminders
          .update(
            { status: req.body.status },
            { where: { id: req.params.reminderId } }
          )
          .then(() => res.status(200).send({ message: "success" }));
      } else {
        res.status(302).send({ message: "forbbiden" });
      }
    }

    if (req.params.type === "contractor") {
      const reminder = await reminders.findOne({
        where: { id: req.params.reminderId }
      });
      if (!reminder)
        return res.status(404).send({ message: "reminder not found" });

      if (reminder.contractorId == req.params.typeId) {
        await reminders
          .update(
            { status: req.body.status },
            { where: { id: req.params.reminderId } }
          )
          .then(() => res.status(200).send({ message: "success" }));
      } else {
        res.status(302).send({ message: "forbbiden" });
      }
    }
  }
);

router.get("/:type/:typeId", [authToken], async (req, res) => {
  if (!req.params.type || !req.params.typeId)
    return res.status(400).send({ message: "Bad Request" });

  if (req.params.type === "user") {
    const reminder = await reminders.findAll({
      where: { userId: req.params.typeId }
    });
    res.status(200).send(reminder);
  }

  if (req.params.type === "contractor") {
    const reminder = await reminders.findAll({
      where: { contractorId: req.params.typeId }
    });
    res.status(200).send(reminder);
  }
});

router.delete(
  "/reminder/:reminderId/:type/:typeId",
  [authToken],
  async (req, res) => {
    if (!req.params.type || !req.params.typeId || !req.params.reminderId)
      return res.status(400).send({ message: "Bad Request" });

    if (req.params.type === "user") {
      const reminder = await reminders.findOne({
        where: { id: req.params.reminderId }
      });

      if (!reminder)
        return res.status(404).send({ message: "reminder not found" });

      if (reminder.userId == req.params.typeId) {
        await reminders
          .destroy({ where: { id: req.params.reminderId } })
          .then(() => res.status(200).send({ message: "success" }))
          .catch(err => res.status(500).send({ error: err }));
      }
    }

    if (req.params.type === "contractor") {
      const reminder = await reminders.findOne({
        where: { id: req.params.reminderId }
      });

      if (!reminder)
        return res.status(404).send({ message: "reminder not found" });

      if (reminder.contractorId == req.params.typeId) {
        await reminders
          .destroy({ where: { id: req.params.reminderId } })
          .then(() => res.status(200).send({ message: "success" }))
          .catch(err => res.status(500).send({ error: err }));
      }
    }
  }
);

module.exports = router;
