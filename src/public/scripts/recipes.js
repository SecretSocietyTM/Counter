import * as api from "./api/recipesAPI.js";
import * as ui from "./ui/recipesUI.js";
import * as searchbar from "../components/searchbar.js";


let categories_list = [];

const categories = document.getElementById("categories");

let active_category = null;

// recipe dialog elements
const recipe_dialog = document.getElementById("recipe_dialog");
const recipe_name_input = document.getElementById("recipe_name_input");
const recipe_name = document.getElementById("recipe_name");
const close_dialog_btn = document.getElementById("close_dialog_btn");
const addingredient_btn = document.getElementById("addingredient_btn");
const ingredientlist = document.getElementById("ingredientlist");
const addstep_btn = document.getElementById("addstep_btn");
const stepslist = document.getElementById("stepslist");

// search dialog elements
const searchbar_target = document.getElementById("searchbar_target");



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


// recipe dialog event listeners
close_dialog_btn.addEventListener("click", (e) => {
    recipe_dialog.close();
});

addingredient_btn.addEventListener("click", (e) => {
    searchbar.showSearch();
});


function addToIngredientsList(food) {
    ingredientlist.appendChild(ui.createIngredient(food));
}


// page init functions
async function initCategories() {
    const data = await api.getCategories();

    if (data.success) {
        data.categories.forEach(category => {
            categories_list.push(category);
            ui.addCategoryName(category);
            categories.appendChild(ui.createCategory(category));
        });
    }
}



await searchbar.loadSearchbar(searchbar_target);

searchbar_target.querySelector("#search_dialog").
    addEventListener("searchbar:submit", (e) => {
    console.log(e.detail);
    const {food, form_data} = e.detail;
    addToIngredientsList(food);
});

initCategories();