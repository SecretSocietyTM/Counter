const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");

router.get("/categories", async (req, res) => {
    const uid = req.session.user.id;
    let result;
    try {
        result = await db.recipesDB.getCategories(uid);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, pleasy try again" });
    }

    return res.json({ success: true, categories: result });
});

module.exports = router;