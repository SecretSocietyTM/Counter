const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");

router.post("/", async (req, res) => {
    const recipe_info = req.body;
    const uid = req.session.user.id;
    let result, _result, __result;
    try {
        result = await db.recipesDB.addRecipe(uid, recipe_info);
        _result = await db.recipesDB.
            addRecipeIngredients(result.recipe_id, recipe_info.ingredients);
        // TODO: implement in the future __result = await db.recipesDB.
        //    addRecipeSteps(result.recipe_id, recipe_info.steps);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, errmsg: "Something went wrong, please try again" });
    }

    console.log(result);
    console.log(_result);
    /* return res.json({ success: true, }) */
});

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