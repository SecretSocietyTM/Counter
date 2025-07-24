import * as api from "./api/recipesAPI.js";
import * as util from "./util/recipesUtil.js"
import * as ui from "./ui/recipesUI.js";
import * as searchbar from "../components/searchbar.js";
import { FoodManager } from "./util/shared/foodmanager.js";


// below are UI elements. Need STATE objects as well
let CATEGORIES = {};
let CATEGORY_RECIPESLISTS = {}
const RECIPES = new FoodManager();

const INGREDIENTSLIST = new FoodManager();
let STEPSLIST = [];

let active_category = null;
let serves = 1;

const REPORT = {
    total: {
        cal: 0,
        fat: 0,
        carb: 0,
        prot: 0
    },
    perserv: {
        cal: 0,
        fat: 0,
        carb: 0,
        prot: 0
    }
}
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

const categories = document.getElementById("categories");

// recipe dialog elements
const recipe_dialog = document.getElementById("recipe_dialog");
const recipeform = document.getElementById("recipe_form");
const recipe_name = document.getElementById("recipe_name");
const close_dialog_btn = document.getElementById("close_dialog_btn");
const addingredient_btn = document.getElementById("addingredient_btn");
const ingredientlist = document.getElementById("ingredientlist");
const addstep_btn = document.getElementById("addstep_btn");
const stepslist = document.getElementById("stepslist");

// recipe dialog main buttons
const addrecipe_submit_btn = document.getElementById("addrecipe_submit_btn");

// recipe dialog inputs
const recipe_name_input = document.getElementById("recipe_name_input");
const recipe_serves_input = document.getElementById("serves");

// search dialog elements
const searchbar_target = document.getElementById("searchbar_target");

// helper functions
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
categories.addEventListener("click", (e) => {
    const addrecipe_btn = e.target.closest(".addrecipe_btn");
    if(!addrecipe_btn) return;
    
    recipe_name.style.display = "none";
    recipe_name_input.style.display = "inline-block";
    active_category = addrecipe_btn.dataset.category_id;
    ui.setCategorySelect(recipe_dialog, active_category);

    recipe_dialog.showModal();
    recipe_name_input.focus();
});


// recipe dialog input event listeners
recipe_serves_input.addEventListener("input", (e) => {
    let value = e.target.value;
    serves = !value || value === "0" ? 1 : value;
    util.updateReportPerServ(REPORT, serves);
    ui.setReportUI(REPORT_UI, REPORT);    
});

addingredient_btn.addEventListener("click", (e) => {
    searchbar.showSearch();
});



// recipe dialog button event listeners
addrecipe_submit_btn.addEventListener("click", async (e) => {
    const recipe_data = ui.checkFormValidity(recipeform);
    if (!recipe_data) return;

    recipe_data.serves = serves;
    recipe_data.ingredients = INGREDIENTSLIST.foods;
    recipe_data.steps = STEPSLIST;
    for (const key in REPORT.total) {
        recipe_data[key] = REPORT.total[key];
    }
    
    const data = await api.addRecipe(recipe_data);

    if (data.success) {
        RECIPES.add(data.recipe);
        CATEGORY_RECIPESLISTS[data.recipe.category_id].
            appendChild(ui.createRecipe(data.recipe));

        recipeform.reset();
        INGREDIENTSLIST.deleteAll();
        STEPSLIST = [];
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
        INGREDIENTSLIST.deleteAll();
        STEPSLIST = [];
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
})

close_dialog_btn.addEventListener("click", (e) => {
    recipeform.reset();
    INGREDIENTSLIST.deleteAll();
    STEPSLIST = [];
    util.resetReport(REPORT);
    ingredientlist.replaceChildren();
    stepslist.replaceChildren();
    ui.setReportUI(REPORT_UI, REPORT);
    recipe_dialog.close();
});



function addToIngredientsList(food) {
    INGREDIENTSLIST.add(food);
    ingredientlist.appendChild(ui.createIngredient(food));
}


// page init functions
async function initCategories() {
    const data = await api.getCategories();

    if (data.success) {
        data.categories.forEach(category => {
            ui.addCategoryName(category);
            let category_element = ui.createCategory(category)
            categories.appendChild(category_element);
            CATEGORIES[category.category_id] = category_element;
            CATEGORY_RECIPESLISTS[category.category_id] = 
                category_element.querySelector(".recipeslist");
        });
    }
}



await searchbar.loadSearchbar(searchbar_target);

searchbar_target.querySelector("#search_dialog").
    addEventListener("searchbar:submit", (e) => {
    const {food, form_data} = e.detail;
    let calculated_food = calculateFood(food, form_data);
    addToIngredientsList(calculated_food);
    util.updateReport(REPORT, calculated_food, serves);
    ui.setReportUI(REPORT_UI, REPORT);
});

initCategories();