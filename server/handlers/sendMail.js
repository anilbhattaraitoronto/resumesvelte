const nodemailer = require("nodemailer");
const { emailConfig, emailSecret } = require("../secrets");
const jwt = require("jsonwebtoken");

exports.sendAccountActivationEmail = (
  senderDetail,
  userEmail,
  userPassword,
) => {
  var transporter = nodemailer.createTransport(senderDetail);
  const token = jwt.sign(
    {
      email: userEmail,
      password: userPassword,
    },
    emailSecret,
    { expiresIn: "30m" },
  );

  const url = `http://localhost:4000/users/activate/${token}`;
  var mailOptions = {
    from: "no-reply@email.com",
    to: userEmail,
    subject: "Please verify your account.",
    html:
      `Please confirm your email by clicking the link <a href=${url}>${url}</a>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
