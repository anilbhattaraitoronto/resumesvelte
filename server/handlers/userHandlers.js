const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const sqlite3 = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const { emailConfig, emailSecret } = require("../secrets");

const { sendAccountActivationEmail } = require("./sendMail");
const senderInfo = require("../secrets");

const { userValidationResult, userValidator } = require(
  "./validators/userValidators",
);
const DB = require("../database/createdb");

const signup = (req, res) => {
  //check if email is already used
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;

  if (password === confirmPassword) {
    const DB = new sqlite3("./db.sqlite");
    let getUserStmt = DB.prepare(`SELECT * FROM users WHERE email =?;`);
    const user = getUserStmt.get(email);

    if (!user) {
      //send email after adding user to the database
      sendAccountActivationEmail(senderInfo.emailConfig, email, password);
      //send message to the screeen
      res.status(200).json(
        {
          successMessage:
            "User signed up. We have sent an email to your email address. Please activate your account.",
        },
      );
      //close database
      DB.close();
    } else {
      res.status(400).json(
        { message: "The email already exists. Please use another email" },
      );
      DB.close();
    }
  } else {
    res.status(400).json(
      { errorMsg: "The password and confirmPassword should match" },
    );
  }
};

const activateUser = (req, res) => {
  const token = req.params.token;
  if (token) {
    jwt.verify(token, emailSecret, (err, decodedToken) => {
      if (err) {
        return res.status(400).json(
          { success: false, error: "Incorrect or expired Link" },
        );
      } else {
        const { email, password } = decodedToken;
        const hashedPassword = bcrypt.hashSync(password, salt);
        const DB = new sqlite3("./db.sqlite");
        let addUserStmt = DB.prepare(
          `INSERT INTO users (email, password) VALUES(?,?);`,
        );

        addUserStmt.run(email, hashedPassword);
        DB.close();
        res.status(200).json(
          { success: true, messate: "User is activated. Please login now" },
        );
      }
    });
  } else {
    res.status(400).json(
      {
        success: false,
        message: "Something went wrong in activating account.",
      },
    );
  }
};
const logUsersIn = async (req, res) => {
  if (!req.session.user && !req.session.isLoggedIn) {
    const { email, password } = req.body;
    if (email && password) {
      const DB = new sqlite3("./db.sqlite");
      const getUserStmt = DB.prepare(`SELECT * FROM users WHERE email = ?;`);
      const user = getUserStmt.get(email);
      if (!user) {
        res.status(400).json(
          { success: false, message: "User does not exist." },
        );
      } else {
        let hashedPassword = user.password;
        //compare password
        bcrypt.compare(password, hashedPassword, (err, result) => {
          if (result === true) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.status(200).json(
              { success: true, message: `Thank you ${email} for signing in.` },
            );
            DB.close();
          } else {
            res.status(400).json(
              {
                success: false,
                message: "Credetials do not match. Please try again.",
              },
            );
          } //
        });
      }
    } else {
      res.status(400).json(
        {
          success: false,
          errMsg:
            "Wrong credentials. Both email and password are required. Please try again.",
        },
      );
      DB.close();
    }
  } else {
    res.status(400).json(
      { success: false, message: "you are already logged in!" },
    );
  }
};

const logUsersOut = (req, res) => {
  if (req.session.user && req.session.isLoggedIn) {
    req.session.destroy();
    req.session.user = null;
    res.status(200).json(
      { success: true, message: "You have successfully logged out" },
    );
  } else {
    res.status(400).json(
      { success: false, message: "you are not logged in" },
    );
  }
};

module.exports = {
  signup,
  activateUser,
  logUsersIn,
  logUsersOut,
};
