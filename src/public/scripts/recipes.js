import * as api from "./api/recipesAPI.js";
import * as ui from "./ui/recipesUI.js";


let categories_list = [];

const categories = document.getElementById("categories");

// recipe dialog elements
const recipe_dialog = document.getElementById("recipe_dialog");
const recipe_name_input = document.getElementById("recipe_name_input");
const recipe_name = document.getElementById("recipe_name");


categories.addEventListener("click", (e) => {
    const addrecipe_btn = e.target.closest(".addrecipe_btn");
    if(!addrecipe_btn) return;
    
    recipe_name.style.display = "none";
    recipe_name_input.style.display = "inline-block";
    ui.setCategorySelect(recipe_dialog, addrecipe_btn.dataset.category_id);
    recipe_dialog.showModal();
    recipe_name_input.focus();
});


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

initCategories();