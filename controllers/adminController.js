const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const superAdmin = require("../middleware/superAdmin");
const _ = require("lodash");
const {
  contractors,
  users,
  admins,
  application,
  reports,
  reviews
} = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"), {
    expiresIn: 11589000
  });
  return token;
};

router.post("/auth/login", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send({ message: "Bad Request" });

  const admin = await admins.findOne({ where: { email: req.body.email } });
  if (!admin)
    return res.status(404).send({ message: "Invalid email or password" });

  if (admin.status !== "active")
    return res.status(403).send({ message: `Admin account ${admin.status}` });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(admin);
  const Admin = await _.pick(admin, [
    "id",
    "name",
    "name",
    "phone",
    "role",
    "status"
  ]);

  res
    .status(200)
    .header("Authorization", token)
    .send({ message: "success", Admin, token });
});

router.post("/create/admin", [authToken, superAdmin], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const admin = await admins.findOne({
    where: { email: req.body.email }
  });
  if (admin) return res.status(302).send({ message: "Admin already exsits" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email },
    attributes: {
      exclude: [
        "password",
        "gender",
        "location",
        "timeIn",
        "timeOut",
        "category",
        "profileImage",
        "identity",
        "nonCriminal",
        "rating",
        "notes",
        "createdAt",
        "updatedAt"
      ]
    }
  });
  if (isContractor)
    return res.status(302).send({
      message: "Email already registered as contractor",
      contractor: isContractor
    });

  const salt = await bcrypt.genSalt(10);
  const loginPassword = await bcrypt.hash("123123", salt);

  await admins
    .create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      notes: req.body.notes,
      password: loginPassword,
      role: req.body.role,
      status: "active"
    })
    .then(async admin => {
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "phone",
        "notes",
        "role",
        "status"
      ]);

      res.status(200).send({ message: "success", result });
    })
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/create/contractor", [authToken, superAdmin], async (req, res) => {
  if (!req.body) return res.status(404).send({ message: "Bad Request" });

  const isAdmin = await admins.findOne({ where: { email: req.body.email } });
  if (isAdmin)
    return res.status(302).send({ message: "Already exsits as Admin" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email }
  });
  if (isContractor)
    return res.status(302).send({ message: "Already exsits as Contractor" });

  const isUser = await users.findOne({ where: { number: req.body.number } });
  if (isUser && isUser.status !== "active") {
    return res.status(400).send({
      message: `Already exsits as User and status is ${isUser.status}`
    });
  }
  if (isUser && isUser.applicationStatus !== "new") {
    return res.status(400).send({
      message: `Already exsits as User and application is ${isUser.applicationStatus}`
    });
  }

  if (isUser) await users.destroy({ where: { id: isUser.id } });

  const salt = await bcrypt.genSalt(10);
  const loginPassword = await bcrypt.hash("123123", salt);

  await contractors
    .create({
      name: req.body.name,
      email: req.body.email,
      number: req.body.number,
      gender: req.body.gender,
      password: loginPassword,
      location: req.body.location,
      timeIn: req.body.timeIn,
      timeOut: req.body.timeOut,
      category: req.body.category,
      profileImage: "",
      identity: "",
      nonCriminal: "",
      status: "active",
      notes: req.body.notes
    })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err }));
});

router.post("/create/user", [authToken], async (req, res) => {
  if (!req.body) return res.status(404).send({ message: "Bad Request" });

  const user = await users.findOne({ where: { email: req.body.email } });
  if (user) return res.status(302).send({ message: "User already exsists" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email }
  });
  if (isContractor)
    return res
      .status(302)
      .send({ message: "Already registered as a Contractor" });

  const salt = await bcrypt.genSalt(10);
  const loginPassword = await bcrypt.hash("123123", salt);

  await users
    .create({
      username: req.body.username,
      email: req.body.email,
      number: req.body.number,
      password: loginPassword,
      status: "active",
      applicationStatus: "new",
      notes: req.body.notes
    })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/approve/application/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  const checkUser = await users.findOne({ where: { email: applicant.email } });
  if (
    !checkUser ||
    checkUser.status !== "active" ||
    checkUser.applicationStatus == "rejected"
  ) {
    return res
      .status(403)
      .send({ UserStatus: checkUser.status, notes: checkUser.notes });
  }

  await contractors
    .create(applicant.dataValues)
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error.message }));

  await application
    .destroy({ where: { id: req.params.id } })
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error }));

  await users
    .destroy({ where: { email: applicant.email } })
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error }));

  const result = _.pick(applicant, [
    "name",
    "email",
    "number",
    "location",
    "timeIn",
    "timeOut",
    "category",
    "subCategory",
    "profileImage",
    "identity",
    "nonCriminal",
    "status"
  ]);

  res.status(200).send({ message: "success", result });
});

router.put(
  "/update/application/:applicationId",
  [authToken],
  async (req, res) => {
    if (!req.params.applicationId || !req.body) {
      return res.status(400).send({ message: "Bad Request" });
    }

    const appli = await application.findOne({
      where: { id: req.params.applicationId }
    });
    if (!appli) return res.status(404).send({ message: "Not found" });

    await application
      .update(req.body, { where: { id: req.params.applicationId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.post("/reject/application/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  await users
    .update(
      {
        applicationStatus: "rejected",
        notes: req.body.rejectedReason
      },
      { where: { email: applicant.email } }
    )
    .then(async () => {
      await applicant
        .destroy({ where: { id: req.params.id } })
        .then(() => res.status(200).send({ message: "User rejected" }));
    });
});

router.get("/contractors", [authToken], async (req, res) => {
  const Contractors = await contractors.findAll({
    attributes: {
      exclude: [
        "password",
        "email",
        "gender",
        "identity",
        "nonCriminal",
        "notes",
        "profileImage",
        "rating",
        "timeIn",
        "timeOut"
      ]
    }
  });
  res.status(200).send(Contractors);
});

router.get("/contractor/:contractorId", [authToken], async (req, res) => {
  if (!req.params.contractorId)
    return res.status(400).send({ message: "Bad Request" });

  const contractor = await contractors.findOne({
    where: { id: req.params.contractorId },
    attributes: {
      exclude: ["password"]
    }
  });
  if (!contractor) return res.status(404).send({ message: "Not found" });

  res.status(200).send(contractor);
});

router.get("/users", [authToken], async (req, res) => {
  const Users = await users.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Users);
});

router.get("/user/:userId", [authToken], async (req, res) => {
  if (!req.params.userId)
    return res.status(400).send({ message: "Bad Request" });

  const user = await users.findOne({ where: { id: req.params.userId } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const result = await _.pick(user, [
    "id",
    "username",
    "email",
    "number",
    "status",
    "applicationStatus",
    "notes",
    "createdAt",
    "updatedAt"
  ]);
  res.status(200).send(result);
});

router.get("/admins", [authToken], async (req, res) => {
  const Admins = await admins.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Admins);
});

router.get("/admin/:id", [authToken], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  const result = await _.pick(admin, [
    "id",
    "name",
    "email",
    "role",
    "notes",
    "phone",
    "status",
    "createdAt",
    "updatedAt"
  ]);

  res.status(200).send({ result });
});

router.get("/applications", [authToken], async (req, res) => {
  const Applications = await application.findAll({
    attributes: {
      exclude: [
        "password",
        "email",
        "profileImage",
        "subCategory",
        "identity",
        "nonCriminal",
        "subCategory",
        "timeIn",
        "timeOut",
        "updatedAt"
      ]
    }
  });
  res.status(200).send(Applications);
});

router.get("/application/:applicationId", [authToken], async (req, res) => {
  if (!req.params.applicationId)
    return res.status(400).send({ message: "Bad Request" });

  const Application = await application.findOne({
    where: { id: req.params.applicationId },
    attributes: { exclude: ["password"] }
  });
  if (!Application) return res.status(404).send({ message: "Not found" });

  res.status(200).send(Application);
});

router.put("/prohibit/user/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.status !== "active")
    return res.status(400).send({
      message: `User already ${User.status}`,
      notes: User.notes
    });

  const hasApplied = await application.findOne({
    where: { userId: req.params.id }
  });
  if (hasApplied) {
    await application.destroy({ where: { userId: req.params.id } });
  }

  await users
    .update(
      { status: "prohibited", notes: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/user/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.status == "active")
    return res.status(400).send({ message: "Account already active" });

  await users
    .update({ status: "active" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/prohibit/contractor/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.status !== "active")
    return res.status(400).send({
      message: `Contractor account already ${Contractor.status}`,
      notes: Contractor.notes
    });

  await contractors
    .update(
      { status: "prohibited", notes: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put(
  "/activate/contractor/:id",
  [authToken, superAdmin],
  async (req, res) => {
    if (!req.body) return res.status(400).send({ message: "Bad Request" });

    const Contractor = await contractors.findOne({
      where: { id: req.params.id }
    });
    if (!Contractor) return res.status(404).send({ message: "Not found" });

    if (Contractor.status == "active")
      return res.status(400).send({ message: "Contractor already active" });

    await contractors
      .update(
        { status: "active", notes: req.body.activationReason },
        { where: { id: req.params.id } }
      )
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.get("/reviews", [authToken], async (req, res) => {
  const Reviews = await reviews.findAll();
  res.status(200).send(Reviews);
});

router.delete("/review/:reviewId", [authToken], async (req, res) => {
  if (!req.params.reviewId)
    return res.status(400).send({ message: "Bad Request" });

  const review = await reviews.findOne({ where: { id: req.params.reviewId } });
  if (!review) return res.status(404).send({ message: "Not found" });

  await reviews
    .destroy({ where: { id: req.params.reviewId } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/update/admin/password/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send("Not found");

  const verifyPassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!verifyPassword)
    return res.status(400).send({ message: "Invalid password" });

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await admins
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put(
  "/deactivate/admin/:id",
  [authToken, superAdmin],
  async (req, res) => {
    if (!req.body) return res.status(400).send({ message: "Bad Request" });

    const admin = await admins.findOne({ where: { id: req.params.id } });
    if (!admin) return res.status(404).send({ message: "Not found" });

    if (admin.status !== "active")
      return res.status(400).send({ message: `Admin already ${admin.status}` });

    await admins
      .update(
        { status: "deactivated", notes: req.body.reason },
        { where: { id: req.params.id } }
      )
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.put("/activate/admin/:id", [authToken, superAdmin], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.status == "active")
    return res.status(400).send({ message: "Admin already active" });

  await admins
    .update({ status: "active" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put(
  "/update/admin/:adminId",
  [authToken, superAdmin],
  async (req, res) => {
    if (!req.body) return res.status(400).send({ message: "Bad Request" });

    const admin = await admins.findOne({ where: { id: req.params.adminId } });
    if (!admin) return res.status(404).send({ message: "Not found" });

    await admins
      .update(req.body, { where: { id: req.params.adminId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.messgae }));
  }
);

router.put(
  "/update/contractor/:contractorId",
  [authToken, superAdmin],
  async (req, res) => {
    if (!req.params.contractorId)
      return res.status(400).send({ message: "Bad Request" });

    const contractor = await contractors.findOne({
      where: { id: req.params.contractorId }
    });
    if (!contractor) return res.status(404).send({ message: "Not found" });

    await contractors
      .update(req.body, {
        where: { id: req.params.contractorId }
      })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.get("/reports", [authToken], async (req, res) => {
  const Reports = await reports.findAll();
  res.status(200).send(Reports);
});

router.get("/report/:reportId", [authToken], async (req, res) => {
  if (!req.params.reportId)
    return res.status(404).send({ message: "Not found" });

  const report = await reports.findOne({ where: { id: req.params.reportId } });
  if (!report) return res.status(400).send({ message: "Not found" });

  res.status(200).send(report);
});

router.put(
  "/update/report/:reportId/admin/:adminId",
  [authToken],
  async (req, res) => {
    if (!req.params.reportId || !req.params.adminId || !req.body)
      return res.status(400).send({ message: "Bad Request" });

    const report = await reports.findOne({
      where: { id: req.params.reportId }
    });
    if (!report) return res.status(404).send({ message: "Not Found" });

    const admin = await admins.findOne({ where: { id: req.params.adminId } });
    if (!admin)
      return res
        .status(404)
        .send({ message: "Bad Request, Admin id was not sent" });

    await reports
      .update(
        {
          status: req.body.status,
          notes: req.body.notes,
          adminName: admin.name
        },
        { where: { id: req.params.reportId } }
      )
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

module.exports = router;
