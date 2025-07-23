// getters
export async function getCategories() {
    const res = await fetch("api/recipes/categories");
    return await res.json();
}