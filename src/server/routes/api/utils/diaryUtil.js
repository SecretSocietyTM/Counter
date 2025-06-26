function createEntry(base, info) {
    const ratio = +info.servsize / +base.serving_size;
    let cal = Math.round(ratio * base.calories);
    let fat = Math.round(ratio * base.fat * 10) / 10;
    let carb = Math.round(ratio * base.carbs * 10) / 10;
    let prot = Math.round(ratio * base.protein * 10) / 10;
    
    let entry = {
        food_id:    info.food_id,
        date:       info.date,
        meal_type:  info.meal_type,
        name:       base.name,
        servsize:   info.servsize,
        unit:       info.unit,
        cal, fat, carb, prot       
    };
    
    return entry;
}

function negateEntry(entry) {
    const copy = { ...entry };
    ['calories', 'fat', 'carbs', 'protein'].forEach(key => {
        copy[key] = -copy[key];
    });
    return copy;
}

function getWeek(date) {
    let dates = [];

    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    dates.push(start.toDateString());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(0, 0, 0, 0);

    for (let i = 1; i < 6; i++) {
        const mid = new Date(start);
        mid.setDate(start.getDate() + i);
        mid.setHours(0, 0, 0, 0);
        dates.push(mid.toDateString());
    }
    dates.push(end.toDateString()); 
    
    return dates;
}

module.exports = { 
    createEntry,
    negateEntry,
    getWeek
};