export function updateCalorieInfo(obj, entry, flag="add") {
    if (flag === "sub") obj.main -= entry.cal;
    else obj.main += entry.cal;
    // previously the progressBar update was here.
    if (obj.main <= obj.total) {
        obj.remaining = obj.total - obj.main;
        obj.over = 0;
    } else {
        obj.over = obj.main - obj.total;
        obj.remaining = 0;
    }
}

export function updateWeeklyAverages(obj, entry, days_logged, flag="add") {
    let averages = {};
    const sign = flag === "sub" ? -1 : 1;
    if (days_logged === 0) days_logged = 1;
    for (const key in obj) {
        obj[key] += sign * entry[key];
        averages[key] = Math.round(obj[key] / days_logged);
    }
    return averages;
}

export function initWeeklyAverage(obj, days_logged) {
    let averages = {};
    if (days_logged === 0) days_logged = 1;
    for (const key in obj) {
        averages[key] = Math.round(obj[key] / days_logged);
    }
    return averages;
}

export function dayIsEmpty(day) {
    return !day.cal && !day.fat && !day.carb && !day.prot
}