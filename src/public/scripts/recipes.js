import * as api from "./api/recipesAPI.js";
import * as util from "./util/recipesUtil.js"
import * as ui from "./ui/recipesUI.js";
import * as searchbar from "../components/searchbar.js";
import { FoodManager } from "./util/shared/foodmanager.js";


let cur_category = null;
const cur_ingredients_list = new FoodManager();
const cur_steps_lists = new FoodManager();
let cur_serves_val = 1;
let cur_recipe_ui = null;
let cur_recipe = null;

let recipe_mode = null;
let is_editing_step = false;
let cur_step_ui = null;


const categorieslist = document.getElementById("categorieslist");

// recipe dialog elements
const recipe_dialog = document.getElementById("recipe_dialog");
const recipeform = document.getElementById("recipe_form");
const close_dialog_btn = document.getElementById("close_dialog_btn");
const editrecipe_btn = document.getElementById("editrecipe_btn");
const addingredient_btn = document.getElementById("addingredient_btn");
const ingredientlist = document.getElementById("ingredientlist");
const addstep_btn = document.getElementById("addstep_btn");
const stepslist = document.getElementById("stepslist");

// recipe dialog main buttons
const deleterecipe_btn = document.getElementById("deleterecipe_btn");
const editrecipe_submit_btn = document.getElementById("editrecipe_submit_btn");
const addrecipe_submit_btn = document.getElementById("addrecipe_submit_btn");

// search dialog elements
const searchbar_target = document.getElementById("searchbar_target");

// steps dialog elements
const steps_dialog = document.getElementById("steps_dialog");
const steps_input = document.getElementById("steps_input");
const submit_step_btn = document.getElementById("submit_step_btn")


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



categorieslist.addEventListener("click", (e) => {
    let target;
    if (target = e.target.closest(".addrecipe_btn")) { // open recipe dialog in edit mode (adding new recipe)
        recipe_mode = "add"
        let addrecipe_btn = target;

        for (const span in RECIPEFORM_UI.spans) {
            RECIPEFORM_UI.spans[span].style.display = "none";
        }
        for (const input in RECIPEFORM_UI.inputs) {
            RECIPEFORM_UI.inputs[input].style.display = "inline-block";
        }

        editrecipe_btn.style.display = "none";
        deleterecipe_btn.style.display = "none";
        editrecipe_submit_btn.style.display = "none"
        addrecipe_submit_btn.style.display = "";
        addingredient_btn.style.display = "";
        addstep_btn.style.display = "";

        cur_category = addrecipe_btn.dataset.category_id;
        ui.setCategorySelect(recipe_dialog, cur_category);

        recipe_dialog.showModal();
        RECIPEFORM_UI.inputs.name.focus();
    } else if (target = e.target.closest(".recipe")) { // open recipe dialog in view mode
        cur_recipe_ui = target;
        let category_id = cur_recipe_ui.dataset.category_id;
        let recipe_id = cur_recipe_ui.dataset.id;
        cur_recipe = RECIPES[category_id][recipe_id]

        for (const span in RECIPEFORM_UI.spans) {
            RECIPEFORM_UI.spans[span].style.display = "";
        }
        for (const input in RECIPEFORM_UI.inputs) {
            RECIPEFORM_UI.inputs[input].style.display = "none";
        }

        RECIPEFORM_UI.spans.name.textContent = cur_recipe.info.name;
        RECIPEFORM_UI.spans.category.textContent = CATEGORIES[cur_recipe.info.category_id].name;
        RECIPEFORM_UI.spans.serves.textContent = `${cur_recipe.info.serves} servings`;
        RECIPEFORM_UI.spans.servsize.textContent = `Serving Size: ${cur_recipe.info.servsize}${cur_recipe.info.unit}`;
        RECIPEFORM_UI.spans.link.href = cur_recipe.info.link;
        cur_serves_val = cur_recipe.info.serves;

        editrecipe_btn.style.display = "";
        deleterecipe_btn.style.display = "none";
        editrecipe_submit_btn.style.display = "none"
        addrecipe_submit_btn.style.display = "none";
        addingredient_btn.style.display = "none";
        addstep_btn.style.display = "none";

        cur_recipe.ingredients.forEach(ingredient => {
            cur_ingredients_list.add(ingredient);
            ingredientlist.appendChild(ui.createIngredient(ingredient, "view"));
        });
        cur_recipe.steps.forEach(step => {
            cur_steps_lists.add(step);
            stepslist.appendChild(ui.createStep(step, "view"));
        });

        util.setReport(REPORT, cur_recipe.info);
        ui.setReportUI(REPORT_UI, REPORT);

        recipe_dialog.showModal();
    } else {
        return;
    }
});



// recipe dialog input event listeners
editrecipe_btn.addEventListener("click", (e) => {
    recipe_mode = "edit"
    editrecipe_btn.style.display = "none";
    deleterecipe_btn.style.display = "";
    editrecipe_submit_btn.style.display = "";
    addingredient_btn.style.display = "";
    addstep_btn.style.display = "";

    for (const span in RECIPEFORM_UI.spans) {
        RECIPEFORM_UI.spans[span].style.display = "none";
    }
    for (const input in RECIPEFORM_UI.inputs) {
        RECIPEFORM_UI.inputs[input].style.display = "inline-block";
    }

    document.querySelectorAll(".edit_ingr_btn").forEach(btn => {
        btn.style.display = "";
    })
    document.querySelectorAll(".delete_ingr_btn").forEach(btn => {
        btn.style.display = "";
    })
    document.querySelectorAll(".edit_step_btn").forEach(btn => {
        btn.style.display = "";
    })
    document.querySelectorAll(".delete_step_btn").forEach(btn => {
        btn.style.display = "";
    })

    RECIPEFORM_UI.inputs.name.value = cur_recipe.info.name;
    ui.setCategorySelect(recipe_dialog, cur_recipe.info.category_id);
    cur_serves_val = cur_recipe.info.serves;
    RECIPEFORM_UI.inputs.serves.value = cur_recipe.info.serves;
    RECIPEFORM_UI.inputs.servsize.value = cur_recipe.info.servsize
    RECIPEFORM_UI.inputs.unit.value = cur_recipe.info.unit;
    RECIPEFORM_UI.inputs.link.href = cur_recipe.info.link;

    RECIPEFORM_UI.inputs.name.focus();
})

addingredient_btn.addEventListener("click", (e) => {
    searchbar.showSearch();
});

addstep_btn.addEventListener("click", (e) => {
    is_editing_step = false;
    steps_dialog.showModal();
})

submit_step_btn.addEventListener("click", (e) => {
    let step = {};
    step.description = steps_input.value;
    cur_steps_lists.add(step);
    if (is_editing_step) {
        cur_step_ui.querySelector("p").textContent = step.description;
        steps_dialog.close();
    } else {
        stepslist.appendChild(ui.createStep(step));
    }
    steps_input.value = "";
});

steps_dialog.addEventListener("click", (e) => {
    if (ui.isClickingOutside(e, steps_dialog)) {
        steps_dialog.close();
    }
});

recipe_serves_input.addEventListener("input", (e) => {
    let serves_val = e.target.value;
    cur_serves_val = !serves_val || serves_val === "0" ? 1 : serves_val;
    util.updateReportPerServ(REPORT, cur_serves_val);
    ui.setReportUI(REPORT_UI, REPORT);    
});



// recipe dialog main button event listeners
addrecipe_submit_btn.addEventListener("click", async (e) => {
    const recipe_data = ui.checkFormValidity(recipeform);
    if (!recipe_data) return;

    recipe_data.cur_serves_val = cur_serves_val;
    recipe_data.ingredients = cur_ingredients_list.foods;
    recipe_data.steps = cur_steps_lists.foods;
    for (const key in REPORT.total) {
        recipe_data[key] = REPORT.total[key];
    }
    
    const data = await api.addRecipe(recipe_data);

    if (data.success) {
        RECIPES[data.recipe.info.category_id][data.recipe.info.recipe_id] = data.recipe;
        RECIPES_UI[data.recipe.info.category_id].
            appendChild(ui.createRecipe(data.recipe.info));

        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists.deleteAll();
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
});

// edit recipe
editrecipe_submit_btn.addEventListener("click", async (e) => {
    const recipe_data = ui.checkFormValidity(recipeform);
    if (!recipe_data) return;

    recipe_data.recipe_id = cur_recipe.info.recipe_id;
    recipe_data.servsize = RECIPEFORM_UI.inputs.servsize.value;
    recipe_data.cur_serves_val = cur_serves_val;
    recipe_data.ingredients = cur_ingredients_list.foods;
    recipe_data.steps = cur_steps_lists.foods;
    for (const key in REPORT.total) {
        recipe_data[key] = REPORT.total[key];
    }

    const data = await api.editRecipe(recipe_data);

    if (data.success) {
        RECIPES[data.recipe.info.category_id][data.recipe.info.recipe_id] = data.recipe;
        cur_recipe_ui.remove();
        RECIPES_UI[data.recipe.info.category_id].
            appendChild(ui.createRecipe(data.recipe.info));

        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists.deleteAll();
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
});


// delete recipe
deleterecipe_btn.addEventListener("click", async (e) => {
    let recipe_id = cur_recipe.info.recipe_id;

    const data = await api.deleteRecipe(recipe_id);

    if (data.success) {
        delete RECIPES[cur_recipe.info.category_id][cur_recipe.info.recipe_id];
        cur_recipe_ui.remove();
        cur_recipe = null;
        cur_recipe_ui = null;

        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists.deleteAll();
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    }
});




// closing recipe dialog events
recipe_dialog.addEventListener("cancel", (e) => {
    recipeform.reset();
    cur_ingredients_list.deleteAll();
    cur_steps_lists.deleteAll();
    util.resetReport(REPORT);
    ingredientlist.replaceChildren();
    stepslist.replaceChildren();
    ui.setReportUI(REPORT_UI, REPORT);
    recipe_dialog.close();
});

recipe_dialog.addEventListener("click", (e) => {
    let target;
    if (ui.isClickingOutside(e, recipe_dialog)) {
        recipeform.reset();
        cur_ingredients_list.deleteAll();
        cur_steps_lists.deleteAll();
        util.resetReport(REPORT);
        ingredientlist.replaceChildren();
        stepslist.replaceChildren();
        ui.setReportUI(REPORT_UI, REPORT);
        recipe_dialog.close();
    } else if (target = e.target.closest(".ingredient")) {
        let ingr_ui = target;
        let ingr = cur_ingredients_list.getFoodById(ingr_ui.dataset.id, "ingredient_id");
        if (e.target.closest(".edit_ingr_btn")) {
            const servsection = ingr_ui.querySelector(".ingredient__servsize-section");
            const input = servsection.querySelector("input");
            const spans = servsection.querySelectorAll("span");
            const info = ingr_ui.querySelectorAll(".ingredient__info");
            const servsizespan = spans[0];
            spans.forEach(span => {
                span.style.display = "none";
            })
            input.style.display = "";
            input.value = ingr.servsize;
            input.focus();

            input.addEventListener("keydown", async (e) => {
                if (e.key === "Enter") {
                    input.blur();
                }
            });

            input.addEventListener("blur", async (e) => {
                if (input.style.display == "none") {
                    return;
                }
                if (input.value < 1 || input.value % 1 > 1) {
                    input.style.display = "none";
                    input.value = "";
                    spans.forEach(span => {
                        span.style.display = "";
                    })
                    return;
                }
                util.updateReport(REPORT, ingr, cur_serves_val, "sub");

                // calulate:
                let ratio = +input.value / ingr.servsize;
                ingr.cal = ratio * ingr.cal;
                ingr.fat = ratio * ingr.fat;
                ingr.carb = ratio * ingr.carb;
                ingr.prot = ratio * ingr.prot;

                util.roundMacros(ingr);

                ingr.servsize = +input.value;
                util.updateReport(REPORT, ingr, cur_serves_val);
                ui.setReportUI(REPORT_UI, REPORT);

                input.style.display = "none";
                input.value = "";
                spans.forEach(span => {
                    span.style.display = "";
                });
                servsizespan.textContent = ingr.servsize;
                info[0].textContent = ingr.cal;
                info[1].textContent = ingr.fat;
                info[2].textContent = ingr.carb;
                info[3].textContent = ingr.prot;
            });

        } else if (e.target.closest(".delete_ingr_btn")) {
            cur_ingredients_list.delete(ingr_ui.dataset.id, "ingredient_id");
            ingr_ui.remove();
            util.updateReport(REPORT, ingr, cur_serves_val, "sub");
            ui.setReportUI(REPORT_UI, REPORT);
        }
    } else if (target = e.target.closest(".step")){
        let step_ui = target;
        let step = cur_steps_lists.getFoodById(step_ui.dataset.id, "step_id");
        if (e.target.closest(".edit_step_btn")) {
            cur_step_ui = step_ui;
            is_editing_step = true;
            steps_dialog.showModal();
            steps_input.value = step.description;
        } else if (e.target.closest(".delete_step_btn")) {
            cur_steps_lists.delete(step_ui.dataset.id, "step_id");
            step_ui.remove();
        }        
    }

});

close_dialog_btn.addEventListener("click", (e) => {
    recipeform.reset();
    cur_ingredients_list.deleteAll();
    cur_steps_lists.deleteAll();
    util.resetReport(REPORT);
    ingredientlist.replaceChildren();
    stepslist.replaceChildren();
    ui.setReportUI(REPORT_UI, REPORT);
    recipe_dialog.close();
});



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
    cur_ingredients_list.add(calculated_food);
    ingredientlist.appendChild(ui.createIngredient(calculated_food));
    util.updateReport(REPORT, calculated_food, cur_serves_val);
    ui.setReportUI(REPORT_UI, REPORT);
});


initCategories();
initRecipes();