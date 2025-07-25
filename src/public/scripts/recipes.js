import * as api from "./api/recipesAPI.js";
import * as util from "./util/recipesUtil.js"
import * as ui from "./ui/recipesUI.js";
import * as searchbar from "../components/searchbar.js";
import { FoodManager } from "./util/shared/foodmanager.js";


let cur_category = null;
const cur_ingredients_list = new FoodManager();
let cur_steps_lists = [];
let cur_serves_val = 1;


const categorieslist = document.getElementById("categorieslist");

// recipe dialog elements
const recipe_dialog = document.getElementById("recipe_dialog");
const recipeform = document.getElementById("recipe_form");
const close_dialog_btn = document.getElementById("close_dialog_btn");
const addingredient_btn = document.getElementById("addingredient_btn");
const ingredientlist = document.getElementById("ingredientlist");
const addstep_btn = document.getElementById("addstep_btn");
const stepslist = document.getElementById("stepslist");

// recipe dialog main buttons
const addrecipe_submit_btn = document.getElementById("addrecipe_submit_btn");

// search dialog elements
const searchbar_target = document.getElementById("searchbar_target");


let CATEGORIES = {};
let RECIPES = {}
const REPORT = {
    total: {cal: 0, fat: 0, carb: 0, prot: 0},
    perserv: {cal: 0, fat: 0, carb: 0, prot: 0}
}
let CATEGORIES_UI = {};
let RECIPES_UI = {};
const REPORT_UI = Object.freeze({
    total: {
        cal:  document.getElementById("total_cal"),
        fat:  document.getElementById("total_fat"),
        carb: document.getElementById("total_carb"),
        prot: document.getElementById("total_prot")
    },
    perserv: {
        cal:  document.getElementById("perserv_cal"),
        fat:  document.getElementById("perserv_fat"),
        carb: document.getElementById("perserv_carb"),
        prot: document.getElementById("perserv_prot")
    }
});
const RECIPEFORM_UI = Object.freeze({
    spans: {
        name: document.getElementById("recipe_name_span"),
        category: document.getElementById("recipe_category_span"),
        serves: document.getElementById("recipe_serves_span"),
        servsize: document.getElementById("recipe_servsize_span"),
        unit: document.getElementById("recipe_unit_span"),
        link: document.getElementById("recipe_link_span")
    },
    inputs: {
        name: document.getElementById("recipe_name_input"),
        category: document.getElementById("recipe_category_input"),
        serves: document.getElementById("recipe_serves_input"),
        servsize: document.getElementById("recipe_servsize_input"),
        unit: document.getElementById("recipe_unit_input"),
        link: document.getElementById("recipe_link_input")
    }
});


// helpers
function calculateFood(base, info) {
    const ratio = +info.servsize / +base.servsize;
    let cal = Math.round(ratio * base.cal);
    let fat = Math.round(ratio * base.fat * 10) / 10;
    let carb = Math.round(ratio * base.carb * 10) / 10;
    let prot = Math.round(ratio * base.prot * 10) / 10;
    
    let calculated_food = {
        food_id:    info.food_id,
        date:       info.date,
        meal_type:  info.meal_type,
        name:       base.name,
        servsize:   info.servsize,
        unit:       info.unit,
        cal, fat, carb, prot       
    };
    
    return calculated_food;
}



// open recipe dialog in edit mode (adding new recipe)
categorieslist.addEventListener("click", (e) => {
    let target;
    if (target = e.target.closest(".addrecipe_btn")) { // open recipe dialog in edit mode (adding new recipe)
        let addrecipe_btn = target;

        for (const span in RECIPEFORM_UI.spans) {
            RECIPEFORM_UI.spans[span].style.display = "none";
        }
        for (const input in RECIPEFORM_UI.inputs) {
            RECIPEFORM_UI.inputs[input].style.display = "inline-block";
        }

        cur_category = addrecipe_btn.dataset.category_id;
        ui.setCategorySelect(recipe_dialog, cur_category);

        recipe_dialog.showModal();
        recipe_name_input.focus();
    } else if (target = e.target.closest(".recipe")) { // open recipe dialog in view mode
        let cur_recipe_ui = target;
        let category_id = cur_recipe_ui.dataset.category_id;
        let recipe_id = cur_recipe_ui.dataset.id;
        let cur_recipe = RECIPES[category_id][recipe_id]

        for (const span in RECIPEFORM_UI.spans) {
            RECIPEFORM_UI.spans[span].style.display = "";
        }
        for (const input in RECIPEFORM_UI.inputs) {
            RECIPEFORM_UI.inputs[input].style.display = "none";
        }
        addingredient_btn.style.display = "none";

        console.log(cur_recipe);

        RECIPEFORM_UI.spans.name.textContent = cur_recipe.info.name;
        RECIPEFORM_UI.spans.category.textContent = CATEGORIES[cur_recipe.info.category_id].name;
        RECIPEFORM_UI.spans.serves.textContent = `${cur_recipe.info.serves} servings`;
        RECIPEFORM_UI.spans.servsize.textContent = `Serving Size: ${cur_recipe.info.servsize}${cur_recipe.info.unit}`;
        // TODO: can probably remove the unit span as servsize and unit share the same area.
        RECIPEFORM_UI.spans.link.href = cur_recipe.info.link;

        cur_recipe.ingredients.forEach(ingredient => {
            addToIngredientsList(ingredient);
        })

        util.setReport(REPORT, cur_recipe.info);
        ui.setReportUI(REPORT_UI, REPORT);

        recipe_dialog.showModal();
    } else {
        return;
    }
});



// recipe dialog input event listeners
recipe_serves_input.addEventListener("input", (e) => {
    let serves_val = e.target.value;
    cur_serves_val = !serves_val || serves_val === "0" ? 1 : serves_val;
    util.updateReportPerServ(REPORT, cur_serves_val);
    ui.setReportUI(REPORT_UI, REPORT);    
});

addingredient_btn.addEventListener("click", (e) => {
    searchbar.showSearch();
});



// recipe dialog button event listeners
addrecipe_submit_btn.addEventListener("click", async (e) => {
    const recipe_data = ui.checkFormValidity(recipeform);
    if (!recipe_data) return;

    recipe_data.cur_serves_val = cur_serves_val;
    recipe_data.ingredients = cur_ingredients_list.foods;
    recipe_data.steps = cur_steps_lists;
    for (const key in REPORT.total) {
        recipe_data[key] = REPORT.total[key];
    }
    
    const data = await api.addRecipe(recipe_data);

    if (data.success) {
        RECIPES[data.recipe.info.category_id][data.recipe.info.recipe_id] = data.recipe;
        console.log(data);
        RECIPES_UI[data.recipe.info.category_id].
            appendChild(ui.createRecipe(data.recipe.info));

        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists = [];
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
});

recipe_dialog.addEventListener("click", (e) => {
    if (ui.isClickingOutside(e, recipe_dialog)) {
        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists = [];
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
})

close_dialog_btn.addEventListener("click", (e) => {
    recipeform.reset();
    cur_ingredients_list.deleteAll();
    cur_steps_lists = [];
    util.resetReport(REPORT);
    ingredientlist.replaceChildren();
    stepslist.replaceChildren();
    ui.setReportUI(REPORT_UI, REPORT);
    recipe_dialog.close();
});



function addToIngredientsList(food) {
    cur_ingredients_list.add(food);
    ingredientlist.appendChild(ui.createIngredient(food));
}


// page init functions
async function initCategories() {
    const data = await api.getCategories();

    if (data.success) {
        data.categories.forEach(category => {
            CATEGORIES[category.category_id] = category;
            RECIPES[category.category_id] = {};

            ui.addCategoryName(category);
            let category_element = ui.createCategory(category)
            categorieslist.appendChild(category_element);
            CATEGORIES_UI[category.category_id] = category_element;
            RECIPES_UI[category.category_id] = 
                category_element.querySelector(".recipeslist");
        });
    }
}

async function initRecipes() {
    const data = await api.getRecipes();

    if (data.success) {
        data.recipes.forEach(recipe => {
            RECIPES[recipe.info.category_id][recipe.info.recipe_id] = recipe;
            RECIPES_UI[recipe.info.category_id].
                appendChild(ui.createRecipe(recipe.info));
        })
    }
}



await searchbar.loadSearchbar(searchbar_target);

searchbar_target.querySelector("#search_dialog").
    addEventListener("searchbar:submit", (e) => {
    const {food, form_data} = e.detail;
    let calculated_food = calculateFood(food, form_data);
    addToIngredientsList(calculated_food);
    util.updateReport(REPORT, calculated_food, cur_serves_val);
    ui.setReportUI(REPORT_UI, REPORT);
});


initCategories();
initRecipes();