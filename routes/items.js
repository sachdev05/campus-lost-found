const express = require("express");
const router = express.Router();
const db = require("../config/db");


/* ================================
GET ALL ITEMS
================================ */

router.get("/", async (req, res) => {

  try {

    const [rows] = await db.query(
      "SELECT * FROM items ORDER BY id DESC"
    );

    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify(rows, null, 2));

  } catch (error) {

    console.error("GET items error:", error);
    res.status(500).json({ error: "Database error" });

  }

});


/* ================================
ADD ITEM
================================ */

router.post("/", async (req, res) => {

  const { title, description, category, location, date, contact } = req.body;

  try {

    await db.query(
      "INSERT INTO items (title, description, category, location, date, contact, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')",
      [title, description, category, location, date, contact]
    );

    res.json({ message: "Item added successfully" });

  } catch (error) {

    console.error("POST item error:", error);
    res.status(500).json({ error: "Insert failed" });

  }

});


/* ================================
MARK RESOLVED
================================ */

router.put("/:id", async (req, res) => {

  const id = req.params.id;

  try {

    await db.query(
      "UPDATE items SET status='Resolved' WHERE id=?",
      [id]
    );

    res.json({ message: "Item resolved" });

  } catch (error) {

    console.error("PUT error:", error);
    res.status(500).json({ error: "Update failed" });

  }

});


/* ================================
DELETE ITEM
================================ */

router.delete("/:id", async (req, res) => {

  const id = req.params.id;

  try {

    await db.query(
      "DELETE FROM items WHERE id=?",
      [id]
    );

    res.json({ message: "Item deleted" });

  } catch (error) {

    console.error("DELETE error:", error);
    res.status(500).json({ error: "Delete failed" });

  }

});


module.exports = router;