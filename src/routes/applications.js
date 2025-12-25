const express = require("express");
const { validationResult } = require("express-validator");

const { userRequired } = require("../middleware/auth");
const Application = require("../models/Application");
const Feedback = require("../models/Feedback");
const { applicationValidation, feedbackValidation, COURSES } = require("../validators");

const router = express.Router();

router.get("/applications", userRequired, async (req, res) => {
  const apps = await Application.listForUser(req.session.userId);
  res.render("applications", { apps, courses: COURSES, errors: {}, values: {} });
});

router.get("/applications/new", userRequired, (req, res) => {
  res.render("new_application", {
    values: { courseName: "", desiredStartDate: "", paymentMethod: "" },
    errors: {},
    courses: COURSES
  });
});

router.post("/applications/new", userRequired, applicationValidation, async (req, res) => {
  const result = validationResult(req);
  const values = {
    courseName: req.body.courseName,
    desiredStartDate: req.body.desiredStartDate,
    paymentMethod: req.body.paymentMethod
  };

  if (!result.isEmpty()) {
    return res.status(400).render("new_application", {
      values,
      errors: mapErrors(result.array()),
      courses: COURSES
    });
  }

  // DD.MM.YYYY -> YYYY-MM-DD
  const [dd, mm, yyyy] = values.desiredStartDate.split(".");
  const iso = `${yyyy}-${mm}-${dd}`;

  await Application.create({
    userId: req.session.userId,
    courseName: values.courseName,
    desiredStartDateISO: iso,
    paymentMethod: values.paymentMethod
  });

  req.flash("success", "Заявка отправлена админу ✅");
  res.redirect("/applications");
});

router.post("/applications/feedback", userRequired, feedbackValidation, async (req, res) => {
  const result = validationResult(req);
  const values = {
    applicationId: req.body.applicationId,
    rating: req.body.rating,
    comment: req.body.comment
  };

  if (!result.isEmpty()) {
    const apps = await Application.listForUser(req.session.userId);
    return res.status(400).render("applications", {
      apps,
      courses: COURSES,
      values,
      errors: mapErrors(result.array())
    });
  }

  const appId = Number(values.applicationId);
  const app = await Application.findByIdForUser(appId, req.session.userId);
  if (!app) {
    req.flash("danger", "Заявка не найдена");
    return res.redirect("/applications");
  }

  if (app.status !== "Обучение завершено") {
    req.flash("warning", "Отзыв можно оставить только после завершения обучения");
    return res.redirect("/applications");
  }

  const exists = await Feedback.existsForApplication(appId);
  if (exists) {
    req.flash("info", "Ты уже оставлял(а) отзыв по этой заявке");
    return res.redirect("/applications");
  }

  await Feedback.create({
    applicationId: appId,
    rating: Number(values.rating),
    comment: values.comment.trim()
  });

  req.flash("success", "Спасибо за отзыв! ❤️");
  res.redirect("/applications");
});

function mapErrors(arr) {
  const out = {};
  for (const e of arr) out[e.path] = e.msg;
  return out;
}

module.exports = router;
