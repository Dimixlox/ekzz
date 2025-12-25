function userRequired(req, res, next) {
  if (!req.session.userId) {
    req.flash("warning", "Сначала войди в аккаунт");
    return res.redirect("/login");
  }
  next();
}

function adminRequired(req, res, next) {
  if (!req.session.isAdmin) {
    req.flash("warning", "Нужен вход админа");
    return res.redirect("/admin/login");
  }
  next();
}

module.exports = { userRequired, adminRequired };
