const express = require("express");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password");
const { registerValidation, loginValidation } = require("../validators");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { values: {}, errors: {} });
});

router.post("/register", registerValidation, async (req, res) => {
  const result = validationResult(req);
  const values = {
    login: req.body.login,
    fullName: req.body.fullName,
    phone: req.body.phone,
    email: req.body.email
  };

  if (!result.isEmpty()) {
    return res.status(400).render("register", { values, errors: mapErrors(result.array()) });
  }

  const existing = await User.findByLogin(req.body.login);
  if (existing) {
    return res.status(400).render("register", {
      values,
      errors: { login: "Такой логин уже занят" }
    });
  }

  const passwordHash = await hashPassword(req.body.password);
  await User.create({
    login: req.body.login,
    passwordHash,
    fullName: req.body.fullName.trim(),
    phone: req.body.phone.trim(),
    email: req.body.email.trim().toLowerCase()
  });

  req.flash("success", "Готово! Теперь можно войти.");
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login", { values: {}, errors: {} });
});

router.post("/login", loginValidation, async (req, res) => {
  const result = validationResult(req);
  const values = { login: req.body.login };

  if (!result.isEmpty()) {
    return res.status(400).render("login", { values, errors: mapErrors(result.array()) });
  }

  const user = await User.findByLogin(req.body.login);
  if (!user) {
    req.flash("danger", "Неверный логин или пароль");
    return res.status(400).render("login", { values, errors: {} });
  }

  const ok = await verifyPassword(req.body.password, user.password_hash);
  if (!ok) {
    req.flash("danger", "Неверный логин или пароль");
    return res.status(400).render("login", { values, errors: {} });
  }

  req.session.userId = user.id;
  req.flash("success", "Ты в системе 👌");
  res.redirect("/applications");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

function mapErrors(arr) {
  const out = {};
  for (const e of arr) out[e.path] = e.msg;
  return out;
}

module.exports = router;
