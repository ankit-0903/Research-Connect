const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const recordRoutes = require("./routes/recordRoutes");

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "12345",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    },
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

connectDB();

app.get("/", (req, res) => {
  res.render("homepage", { title: "Welcome to Alum Connect" });
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use("/settings", settingsRoutes);
app.use(recordRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;
