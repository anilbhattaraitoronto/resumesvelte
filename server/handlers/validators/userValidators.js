const { check, validationResult } = require("express-validator");

exports.userValidationResult = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = result.array()[0].msg;
    return res.status(422).json({ success: false, error: error });
  }
  next();
};

exports.userValidator = [
  check("email").trim().not().isEmpty().withMessage("Email is required").not()
    .isEmail().withMessage(
      "Please provide a valide email. You need to confirm your registration later.",
    ),
  check("password").trim().not().isEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage(
      "Password must be at least 8 characters long",
    ),
];
