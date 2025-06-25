export async function getFoods(searchterm) {
    const res = await fetch(`api/food?last_item=0&query=${searchterm}`);
    return await res.json();
}

export async function getCalorieGoal() {
    const res = await fetch("api/user/calorie-goal");
    return await res.json();
}

export async function updateCalorieGoal(goal) {
    const res = await fetch("api/user/calorie-goal", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ goal })
    });
    return await res.json();
}

export async function getDiary(date) {
    const res = await fetch(`api/diary?date=${date.toDateString()}`);
    return await res.json();
}

export async function addToDiary(item) {
    const res = await fetch("api/diary", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(item)
    });
    return await res.json();
}

export async function deleteFromDiary(id) {
    const res = await fetch(`api/diary/${id}`, {
        method: "DELETE"
    });
    return await res.json();
}

export async function getWeeklySummary(date) {
    const res = await fetch(`api/diary/summary?date=${date.toDateString()}`);
    return await res.json();
}