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