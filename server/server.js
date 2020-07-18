const app = require("express")();
const DB = require("./database/createdb");
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionStore = require("connect-sqlite3")(session);
const { SECRETS } = require("./secrets");
const sendEmail = require("./handlers/sendMail");

//import routes

const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "2mb", extended: false }));

app.use(session({
  store: new sessionStore(),
  secret: SECRETS.session_secret,
  saveUninitialized: false,
  resave: false,
}));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use("/", homeRoutes);
app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
