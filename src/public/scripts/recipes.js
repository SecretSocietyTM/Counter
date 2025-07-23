import * as api from "./api/recipesAPI.js";

async function initCategories() {
    const data = api.getCategories();

    if (data.success) {
        console.log("render categories");
    }
}

initCategories();