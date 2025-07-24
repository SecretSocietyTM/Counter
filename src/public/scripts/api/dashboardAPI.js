// getters
export async function getCalorieGoal() {
    const res = await fetch("api/user/calorie-goal");
    return await res.json();
}

export async function getDiary(date) {
    const res = await fetch(`api/diary?date=${date.toDateString()}`);
    return await res.json();
}

export async function getWeeklySummary(date) {
    const res = await fetch(`api/diary/summary?date=${date.toDateString()}`);
    return await res.json();
}



// updaters
export async function updateCalorieGoal(goal) {
    const res = await fetch("api/user/calorie-goal", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ goal })
    });
    return await res.json();
}

export async function addToDiary(entry) {
    const res = await fetch("api/diary", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(entry)
    });
    return await res.json();
}

export async function deleteFromDiary(entry_id) {
    const res = await fetch(`api/diary/${entry_id}`, {
        method: "DELETE"
    });
    return await res.json();
}