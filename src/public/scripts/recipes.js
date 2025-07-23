import * as api from "./api/recipesAPI.js";
import * as ui from "./ui/recipesUI.js";

const categories = document.getElementById("categories");

async function initCategories() {
    const data = await api.getCategories();

    if (data.success) {
        data.categories.forEach(category => {
            categories.appendChild(ui.createCategory(category));
        });
    }
}

initCategories();