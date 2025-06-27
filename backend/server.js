const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = 5000;
const auth = require("./middleware/auth");

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/urlshortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
}));

const Url = mongoose.model("Url", new mongoose.Schema({
  original: String,
  short: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
  expiry: Date,
}));

// Dummy Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({ token: "test-token" });
  }
  res.status(400).json({ message: "Invalid credentials" });
});

// Create short URL
app.post("/api/shorten", auth, async (req, res) => {
  const { originalUrl, customCode } = req.body;
  let short = customCode || Math.random().toString(36).substr(2, 6);
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const exists = await Url.findOne({ short });
  if (exists) return res.status(409).json({ message: "Shortcode already exists" });

  const newUrl = new Url({ original: originalUrl, short, expiry });
  await newUrl.save();
  res.json({ short });
});

// Get stats
app.get("/api/stats", auth, async (req, res) => {
  const urls = await Url.find();
  res.json(urls);
});

// Redirection
app.get("/:short", async (req, res) => {
  const url = await Url.findOne({ short: req.params.short });
  if (!url) return res.status(404).send("Not found");
  if (Date.now() > new Date(url.expiry)) return res.status(410).send("Link expired");
  url.clicks++;
  await url.save();
  res.redirect(url.original);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
