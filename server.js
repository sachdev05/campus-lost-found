// Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // MySQL connection
const itemRoutes = require("./routes/items"); // CRUD routes
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 1*60*1000, max: 100 })); // 100 requests per minute

// Serve frontend files
app.use(express.static("public"));

// Test database connection
db.query("SELECT 1")
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Database Connection Failed:", err));

// API routes
app.use("/api/items", itemRoutes);

// Default route for testing server
app.get("/api/test", (req, res) => {
  res.send("Campus Lost & Found Server Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});