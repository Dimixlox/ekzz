const { body } = require("express-validator");

const LOGIN_RE = /^[A-Za-z0-9]{6,}$/;
const FULLNAME_RE = /^[А-Яа-яЁё\s]+$/;
const PHONE_RE = /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/;

const COURSES = [
  "Основы алгоритмизации и программирования",
  "Основы веб-дизайна",
  "Основы проектирования баз данных"
];

const PAYMENTS = ["cash", "phone_transfer"];

const registerValidation = [
  body("login")
    .trim()
    .notEmpty().withMessage("Введите логин")
    .custom(v => LOGIN_RE.test(v)).withMessage("Логин: латиница+цифры, минимум 6 символов"),
  body("password")
    .notEmpty().withMessage("Введите пароль")
    .isLength({ min: 8 }).withMessage("Пароль должен быть минимум 8 символов"),
  body("fullName")
    .trim()
    .notEmpty().withMessage("Введите ФИО")
    .custom(v => FULLNAME_RE.test(v)).withMessage("ФИО: только кириллица и пробелы"),
  body("phone")
    .trim()
    .notEmpty().withMessage("Введите телефон")
    .custom(v => PHONE_RE.test(v)).withMessage("Телефон в формате 8(XXX)XXX-XX-XX"),
  body("email")
    .trim()
    .notEmpty().withMessage("Введите email")
    .isEmail().withMessage("Некорректный email")
];

const loginValidation = [
  body("login").trim().notEmpty().withMessage("Введите логин"),
  body("password").notEmpty().withMessage("Введите пароль")
];

const applicationValidation = [
  body("courseName")
    .notEmpty().withMessage("Выберите курс")
    .custom(v => COURSES.includes(v)).withMessage("Некорректный курс"),
  body("desiredStartDate")
    .trim()
    .notEmpty().withMessage("Введите дату")
    .custom(v => DATE_RE.test(v)).withMessage("Дата в формате ДД.ММ.ГГГГ")
    .custom(v => {
      const [dd, mm, yyyy] = v.split(".").map(Number);
      const d = new Date(yyyy, mm - 1, dd);
      return d && d.getFullYear() === yyyy && d.getMonth() === (mm - 1) && d.getDate() === dd;
    }).withMessage("Некорректная дата"),
  body("paymentMethod")
    .notEmpty().withMessage("Выберите способ оплаты")
    .custom(v => PAYMENTS.includes(v)).withMessage("Некорректный способ оплаты")
];

const feedbackValidation = [
  body("applicationId").notEmpty(),
  body("rating")
    .notEmpty().withMessage("Выберите оценку")
    .isInt({ min: 1, max: 5 }).withMessage("Оценка 1..5"),
  body("comment")
    .trim()
    .notEmpty().withMessage("Напишите отзыв")
    .isLength({ min: 5 }).withMessage("Слишком коротко")
];

module.exports = {
  LOGIN_RE, FULLNAME_RE, PHONE_RE, DATE_RE,
  COURSES, PAYMENTS,
  registerValidation,
  loginValidation,
  applicationValidation,
  feedbackValidation
};
