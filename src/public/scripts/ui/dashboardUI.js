import * as GenUI from "./generalUI.js";

const text_colors = {
    cal: "txt-prim-green",
    fat: "txt-acnt-yellow",
    carb: "txt-acnt-lightblue",
    prot: "txt-acnt-purple"
}

// helpers
function createEntryInfo(entry) {
    const div = document.createElement("div");
    div.className = "item__subinfo";

    const cal = GenUI.createMacro(entry.cal, "cal", ["txt-prim-green"]);
    const fat = GenUI.createMacro(entry.fat, undefined, ["txt-acnt-yellow"]);
    const carb = GenUI.createMacro(entry.carb, undefined, ["txt-acnt-lightblue"]);
    const prot = GenUI.createMacro(entry.prot, undefined, ["txt-acnt-purple2"]);

    div.append(cal, fat, carb, prot);
    return div;
}

function setUnitSelect(select, unit) {
    select.replaceChildren();
    const units = ["g", "x", "oz", "ml"];

    units
    .sort((a, b) => (a === unit ? -1 : b === unit ? 1 : 0))
    .forEach(u => {
        const option = document.createElement("option");
        option.value = u;
        option.textContent = u === "ml" ? "mL" : u;
        select.appendChild(option);
    });    
}


// element creators
export function createSearchResult(food) {
    const li = document.createElement("li");
    li.className = "searchlist__whole-item";
    li.dataset.id = food.food_id;

    const div = document.createElement("div");
    div.className = "searchlist__item";

    const name = document.createElement("p");
    name.className = "truncate";
    name.textContent = food.name;

    div.appendChild(name);
    li.appendChild(div);
    return li;
}

export function createSearchResultForm(meal, _date, food) {
    const form = document.createElement("form");
    form.className = "item__form";

    const inputs = document.createElement("div");
    inputs.className = "form__inputs";

    const buttons = document.createElement("div");
    buttons.className = "form__buttons";

    const meal_type = document.createElement("input");
    meal_type.type = "hidden";
    meal_type.name = "meal_type";
    meal_type.value = meal;

    const date = document.createElement("input");
    date.type = "hidden";
    date.name = "date";
    date.value = _date;

    const food_id = document.createElement("input");
    food_id.type = "hidden";
    food_id.name = "food_id";
    food_id.value = food.food_id;

    const servsize = document.createElement("input");
    servsize.type = "number";
    servsize.name = "servsize"
    servsize.placeholder = "0";
    servsize.step = "0.01";
    servsize.required = true;

    const unit = document.createElement("select");
    unit.name = "unit";
    setUnitSelect(unit, food.unit);

    const check_button = document.createElement("button");
    check_button.type = "button";
    check_button.id = "searchform_submit_btn";
    check_button.className = "icon_button";

    const check_image = document.createElement("img");
    check_image.src = "../assets/dashboard/check.svg";
    check_image.width = 20;

    check_button.appendChild(check_image);

    buttons.appendChild(check_button);
    inputs.append(meal_type, date, food_id, servsize, unit);

    form.append(inputs, buttons);
    return form;
}

export function createEntry(entry) {
    const li = document.createElement("li");
    li.className = "whole-item";
    li.dataset.id = entry.entry_id;

    const div1 = document.createElement("div");
    div1.className = "item";

    const name = document.createElement("p");
    name.classList.add("truncate", "max-w-75");
    name.textContent = entry.name;

    const div2 = document.createElement("div");
    div2.className = "item__info";

    const servsizeunit = GenUI.createServingUnit(
        entry.servsize, entry.unit, ["servsize"], ["unit"]);

    const trash_button = document.createElement("button");
    trash_button.type = "button";
    trash_button.classList.add("delete_btn", "icon_button");

    const trash_image = document.createElement("img");
    trash_image.src = "../assets/dashboard/trash.svg";

    trash_button.appendChild(trash_image);
    
    div2.append(servsizeunit, trash_button);
    div1.append(name, div2);
    li.append(div1, createEntryInfo(entry));
    return li;
}



// setters
export function setCalorieStatsUI(ui, obj) {
    for (const key in ui) {
        ui[key].textContent = obj[key];
    }
}

export function setMacroStatsUI(ui, obj) {
    for (const key in ui) {
        if (obj[key] > 0) ui[key].className = "card__value on";
        else ui[key].className = "card__value off";
        ui[key].textContent = obj[key];
    }
}

export function setMealStatsUI(ui, obj) {
    const mealstats = {
        cal: ui.querySelector(".cal"),
        fat: ui.querySelector(".fat"),
        carb: ui.querySelector(".carb"),
        prot: ui.querySelector(".prot")
    }
    for (const key in mealstats) {
        if (obj[key] > 0) {
            mealstats[key].classList.toggle("fw-b", true);
            mealstats[key].classList.toggle(text_colors[key], true);
        } else {
            mealstats[key].classList.toggle("fw-b", false);
            mealstats[key].classList.toggle(text_colors[key], false);
        }
        mealstats[key].textContent = obj[key];
    }
}

export function setActiveDate(ui, date) {
    ui.textContent = date;
}

export function setWeekDate(ui, date) {
    ui.textContent = `${date.start} - ${date.end}`;
}

export function setWeeklyAveragesUI(ui, obj) {
    for (const key in ui) { ui[key].textContent = obj[key]};
}

export function setCalDial(ui, obj) {
    let normalize = obj.total / obj.goal * 100;
    if (normalize > 100) normalize = 100;
    const stroke_dashoffset_value = ui.dashoffset * (100 - normalize) / 100;
    const rotate_zvalue = (ui.rotation) * (50 - normalize) / 50;

    ui.bar.style.strokeDashoffset = stroke_dashoffset_value;
    ui.pointer.style.transform = `rotateZ(${rotate_zvalue}deg)`;
    ui.text.firstChild.textContent = obj.total;
}

export function setCalorieGraphBar(bar, value, dashoffsets) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");

    if (value > 100) {
        value -= 100;
        goal.style.strokeDashoffset = 0;
        over.style.strokeDashoffset = dashoffsets.over * (100 - value) / 100;
    } else {
        over.style.strokeDashoffset = dashoffsets.over;
        goal.style.strokeDashoffset = dashoffsets.goal * (100 - value) / 100;
    }
}

export function setMacroGraphBar(bar, percentages) {
    const macros = {
        fat: bar.querySelector(".fat-progress-bar"),
        carb: bar.querySelector(".carb-progress-bar"),
        prot: bar.querySelector(".prot-progress-bar")
    }
    const macros_keys = Object.keys(macros);
    const usable_space = 84 - (2 * 16); // subject to change
    let cur_start = 92;
    let cur_end = cur_start - (usable_space * percentages[macros_keys[0]]);
    for (let i = 1; i < macros_keys.length+1; i++) {
        macros[macros_keys[i-1]].setAttribute("y1", cur_start);
        macros[macros_keys[i-1]].setAttribute("y2", cur_end);
        macros[macros_keys[i-1]].style.opacity = "1";
        macros[macros_keys[i-1]].style.strokeDasharray = Math.ceil(cur_start - cur_end);
        macros[macros_keys[i-1]].style.strokeDashoffset = 0;

        if (i === macros_keys.length) break;
        cur_start = cur_end - 16;
        cur_end = cur_start - (usable_space * percentages[macros_keys[i]]);         
    }
}

export function setCalorieBarNull(bar) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");

    goal.style.stroke = "var(--clr-neutral-40)";
    goal.style.strokeDashoffset = 0;
    over.style.stroke = "var(--clr-neutral-40)";
    over.style.strokeDashoffset = 0;
}

export function setMacroBarNull(bar) {
    const nill = bar.querySelector(".null-progress-bar");
    nill.style.strokeDashoffset = 0;
}

export function setAllCalorieGraphBars(graphs, values) {
    for (let i = 0; i < 7; i++) {
        values[i] != undefined ? 
        setCalorieGraphBar(graphs.cal_bars[i], values[i], graphs.dashoffsets)
        : setCalorieBarNull(graphs.cal_bars[i]);
    }
}


// resetters
export function resetDiaryUI(meallists, mealstats) {
    for (const key in meallists) {
        meallists[key].replaceChildren();
        setMealStatsUI(mealstats[key], {cal: 0, fat: 0, carb: 0, prot: 0});
    }
}

export function resetCalDial(dial) {
    dial.bar.style.strokeDashoffset = dial.dashoffset;
    dial.pointer.style.transform = `rotateZ(${dial.rotation}deg)`;
    dial.text.firstChild.textContent = 0;    
}

export function resetCalorieGraphBar(bar, dashoffsets) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");
    
    goal.style.stroke = "var(--clr-primary-green)";
    goal.style.strokeDashoffset = dashoffsets.goal;
    over.style.stroke = "var(--clr-primary-red)";
    over.style.strokeDashoffset = dashoffsets.over;
}

export function resetMacroGraphBar(bar) {
    const macros = {
        fat: bar.querySelector(".fat-progress-bar"),
        carb: bar.querySelector(".carb-progress-bar"),
        prot: bar.querySelector(".prot-progress-bar")
    }
    for (const key in macros) {
        macros[key].setAttribute("y1", 0);
        macros[key].setAttribute("y2", 0);
        macros[key].style.opacity = "0";
        macros[key].style.strokeDasharray = 0;
        macros[key].style.strokeDashoffset = 0;
    }
}

export function resetMacroBarNull(bar, dashoffsets) {
    const nill = bar.querySelector(".null-progress-bar");
    nill.style.strokeDashoffset = dashoffsets.null;
}

export function resetGraphs(graphs) {
    for (let i = 0; i < 7; i++) {
        resetCalorieGraphBar(graphs.cal_bars[i], graphs.dashoffsets);
        resetMacroGraphBar(graphs.macro_bars[i]);
        resetMacroBarNull(graphs.macro_bars[i], graphs.dashoffsets);
    }
}

export function resetAllUI(meallists, mealstats, dial, calstats, macros) {
    resetDiaryUI(meallists, mealstats);
    setCalorieStatsUI(calstats, {goal: 0, remaining: 0, over: 0});
    setMacroStatsUI(macros, {fat: 0, carb: 0, prot: 0});
    resetCalDial(dial);
}




// getters
export function getDayBars(parent) {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(
        day => parent.querySelector(`.${day}-bar`)
    );
}