export async function getFoods(last_food_id, searchterm) {
    const res = await fetch(`api/food?last_item=${last_food_id}&query=${searchterm}`);
    return await res.json();
}

export async function addFood(food) {
    const res = await fetch("api/food", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(food)
    });
    return await res.json();
}

export async function editFood(food_id, food) {
    const res = await fetch(`api/food/${food_id}`, {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(food)
    });
    return await res.json();    
}

export async function deleteFood(food_id) {
    const res = await fetch(`api/food/${food_id}`, {
        method: "DELETE"
    });
    return await res.json();    
}