require("dotenv").config();
const path = require("path");

const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");

const db = require("./src/db");
const authRoutes = require("./src/routes/auth");
const appRoutes = require("./src/routes/applications");
const adminRoutes = require("./src/routes/admin");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);
app.use(flash());

// Глобальные переменные для шаблонов
app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash("success"),
    danger: req.flash("danger"),
    warning: req.flash("warning"),
    info: req.flash("info")
  };
  res.locals.session = req.session;
  next();
});

// Авто-инициализация таблиц (если их нет)
async function ensureSchema() {
  const fs = require("fs");
  const schema = fs.readFileSync(path.join(__dirname, "sql", "schema.sql"), "utf8");
  await db.query(schema);
}

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/applications");
  return res.redirect("/login");
});

app.use("/", authRoutes);
app.use("/", appRoutes);
app.use("/", adminRoutes);

// 404
app.use((req, res) => res.status(404).render("not_found"));

const PORT = process.env.PORT || 3000;

ensureSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("DB init error:", e);
    process.exit(1);
  });
