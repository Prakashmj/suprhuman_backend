const dotenv = require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Database is not working", err));

// Define CORS options
const corsOptions = {
  origin: "http://www.suprhuman.tech", // Make sure this matches the origin of your requests
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Parse incoming requests with JSON payloads
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/upgrade.routes"));
app.use("/", require("./routes/restrint.routes"));
app.use("/", require("./routes/supergrade.routes"));

// Start the server
app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
