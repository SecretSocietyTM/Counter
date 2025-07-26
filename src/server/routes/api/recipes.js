const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");
const mapper  = require("./utils/mapper.js");

router.route("/")
    .get(async (req, res) => {
        const uid = req.session.user.id;
        let results;
        try {
            results = await db.recipesDB.getRecipesInfo(uid);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });           
        }

        return res.json({ success: true, recipes: results });
    })
    .post(async (req, res) => {
        const recipe = req.body;
        const uid = req.session.user.id;
        let result, _result, __result;
        try {
            result = await db.recipesDB.addRecipe(uid, recipe);
            _result = await db.recipesDB.
                addRecipeIngredients(result.recipe_id, recipe.ingredients);
            __result = await db.recipesDB.
                addRecipeSteps(result.recipe_id, recipe.steps);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        let info = mapper.mapRecipe(result);
        let ingredients = mapper.mapRecipeIngredients(_result);
        let steps = mapper.mapRecipeSteps(__result);

        return res.json({ success: true, recipe: {info, ingredients, steps} });
    })
    .patch(async (req, res) => {
        const recipe = req.body;
        const uid = req.session.user.id;
        let result, _result, __result;
        try {
            result = await db.recipesDB.editRecipeInfo(uid, recipe);
            _result = await db.recipesDB.
                editRecipeIngredients(result.recipe_id, recipe.ingredients);
            __result = await db.recipesDB.
                editRecipeSteps(result.recipe_id, recipe.steps);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        let info = mapper.mapRecipe(result);
        let ingredients = mapper.mapRecipeIngredients(_result);
        let steps = mapper.mapRecipeSteps(__result);

        return res.json({ success: true, recipe: {info, ingredients, steps} });
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