const express = require("express");
const { validationResult, body } = require("express-validator");

const { adminRequired } = require("../middleware/auth");
const Application = require("../models/Application");
const { COURSES } = require("../validators");

const router = express.Router();

const STATUSES = ["Новая", "Идет обучение", "Обучение завершено"];

router.get("/admin/login", (req, res) => {
  res.render("admin_login", { values: {}, errors: {} });
});

router.post(
  "/admin/login",
  [body("login").notEmpty(), body("password").notEmpty()],
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render("admin_login", { values: {}, errors: { form: "Заполни поля" } });
    }

    const adminLogin = process.env.ADMIN_LOGIN || "Admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "KorokNET";

    if (req.body.login === adminLogin && req.body.password === adminPassword) {
      req.session.isAdmin = true;
      req.flash("success", "Админ-вход выполнен");
      return res.redirect("/admin");
    }

    req.flash("danger", "Неверные админ-данные");
    res.status(400).render("admin_login", { values: {}, errors: {} });
  }
);

router.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/admin", adminRequired, async (req, res) => {
  const status = req.query.status || "";
  const course = req.query.course || "";
  const q = (req.query.q || "").trim();

  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const perPage = 7;
  const offset = (page - 1) * perPage;

  const { total, items } = await Application.adminList({
    status: status || null,
    course: course || null,
    q: q || null,
    limit: perPage,
    offset
  });

  const pages = Math.max(Math.ceil(total / perPage), 1);

  res.render("admin_panel", {
    items,
    total,
    page,
    pages,
    perPage,
    filters: { status, course, q },
    statuses: STATUSES,
    courses: COURSES
  });
});

router.post("/admin/applications/:id/status", adminRequired, async (req, res) => {
  const newStatus = req.body.status || "";
  if (!STATUSES.includes(newStatus)) {
    req.flash("danger", "Некорректный статус");
    return res.redirect("/admin");
  }
  const id = Number(req.params.id);
  await Application.updateStatus(id, newStatus);
  req.flash("success", `Статус заявки #${id} обновлен: ${newStatus}`);
  res.redirect(req.get("referer") || "/admin");
});

module.exports = router;
