const { body, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* CREATE ITEM */
router.post("/",
[
  body("title").notEmpty().trim().escape(),
  body("description").notEmpty().trim().escape(),
  body("category").isIn(["Lost","Found"]),
  body("location").notEmpty().trim().escape(),
  body("contact").notEmpty().trim().escape()
],
async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, category, location, date, contact } = req.body;

  try {
    await db.execute(
      "INSERT INTO items (title, description, category, location, date, contact) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, category, location, date, contact]
    );

    res.json({ message: "Item added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }

});

/* READ ALL ITEMS */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM items ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/* UPDATE STATUS */
router.put("/:id", async (req, res) => {

  const { status } = req.body;

  try {

    const [result] = await db.execute(
      "UPDATE items SET status=? WHERE id=?",
      [status, req.params.id]
    );

    res.json({
      message:"Status updated",
      affected:result.affectedRows
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({error:"Update failed"});

  }

});

/* DELETE ITEM */
router.delete("/:id", async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM items WHERE id=?",
      [req.params.id]
    );

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;