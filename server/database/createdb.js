const sqlite3 = require("better-sqlite3");
const schema = require("./schema");

const DB = new sqlite3("./db.sqlite");

DB.exec(schema);

module.exports = DB;
