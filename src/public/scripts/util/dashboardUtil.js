

// maybe be more descriptive of the obj and ui elements? cal_ui, cal_obj?
export function updateCalorieInfo(ui, obj, entry, flag="add") {
    if (flag === "sub") obj.main -= entry.cal;
    else obj.main += entry.cal;
    // previously the progressBar update was here.
    if (obj.main <= obj.goal) {
        obj.remaining = obj.goal - obj.main;
        obj.over = 0;
    } else {
        obj.over = obj.main - obj.goal;
        obj.remaining = 0;
    }
    ui.remaining.textContent = obj.remaining;
    ui.over.textContent = obj.over;
}

// likewise maybe be more descriptive of the obj and ui elements
export function updateWeeklyAverages(avg_ui, totals_obj, entry, days_logged, flag="add") {
    let averages = {};
    if (days_logged === 0) days_logged = 1;

    const sign = flag === "sub" ? -1 : 1;
    for (const key in totals_obj) {
        totals_obj[key] += sign * entry[key];
        averages[key] = Math.round(totals_obj[key] / days_logged);
    }
    
    for (const key in avg_ui) { avg_ui[key].textContent = averages[key]};
}