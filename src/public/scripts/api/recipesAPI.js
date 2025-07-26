// getters
export async function getCategories() {
    const res = await fetch("api/recipes/categories");
    return await res.json();
}

export async function getRecipes() {
    const res = await fetch("api/recipes");
    return await res.json();
}

// updaters
export async function addRecipe(recipe) {
    const res = await fetch("api/recipes", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(recipe)
    });
    return await res.json();
}

export async function editRecipe(recipe) {
    const res = await fetch("api/recipes", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(recipe)
    });
    return await res.json();
}

export async function deleteRecipe(recipe_id) {
    const res = await fetch(`api/recipes/${recipe_id}`, {
        method: "DELETE"
    });
    return await res.json();
}