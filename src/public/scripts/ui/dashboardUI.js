import * as GenUI from "./generalUI.js";

const text_colors = {
    cal: "txt-prim-green",
    fat: "txt-acnt-yellow",
    carb: "txt-acnt-lightblue",
    prot: "txt-acnt-purple"
}

function createSearchListItem(item) {
    const li = document.createElement("li");
    li.className = "searchlist__whole-item";
    li.dataset.id = item.food_id;

    const div = document.createElement("div");
    div.className = "searchlist__item";

    const name = document.createElement("p");
    name.className = "truncate";
    name.textContent = item.name;

    div.appendChild(name);
    li.appendChild(div);
    return li;
}

function createSearchListItemForm(meal, date_in, item) {
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
    date.value = date_in;

    const food_id = document.createElement("input");
    food_id.type = "hidden";
    food_id.name = "food_id";
    food_id.value = item.food_id;

    const servsize = document.createElement("input");
    servsize.type = "number";
    servsize.name = "servsize"
    servsize.placeholder = "0";
    servsize.step = "0.01";
    servsize.required = true;

    const unit = document.createElement("select");
    unit.name = "unit";
    if (item.unit == "g") {
        unit.innerHTML = `
            <option value="g">g</option>
            <option value="x">x</option>
            <option value="oz">oz</option>
            <option value="ml">mL</option>
        `;
    } else if (item.unit == "x") {
        unit.innerHTML = `
            <option value="x">x</option>
            <option value="g">g</option>
            <option value="oz">oz</option>
            <option value="ml">mL</option>
        `;        
    } else if (item.unit == "oz") {
        unit.innerHTML = `
            <option value="oz">oz</option>
            <option value="x">x</option>
            <option value="g">g</option>
            <option value="ml">mL</option>
        `;        
    } else if (item.unit == "ml") {
        unit.innerHTML = `
            <option value="ml">mL</option>
            <option value="x">x</option>
            <option value="g">g</option>
            <option value="oz">oz</option>
        `;        
    }

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

function createEntry(entry) {
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

function updateMealNumbers(ui_numbers, values) {
    for (const key in ui_numbers) {
        if (values[key] > 0) {
            ui_numbers[key].classList.toggle("fw-b", true);
            ui_numbers[key].classList.toggle(text_colors[key], true);
        } else {
            ui_numbers[key].classList.toggle("fw-b");
            ui_numbers[key].classList.toggle(text_colors[key]);
        }
        ui_numbers[key].textContent = values[key];
    }
}

function updateMacrosNumbers(macros, macros_obj) {
    const macros_obj_values = Object.values(macros_obj);
    for (let i = 0; i < macros.length; i++) {
        if (macros_obj_values[i] > 0) macros[i].className = "card__value on";
        else macros[i].className = "card__value off";
        macros[i].textContent = macros_obj_values[i];
    }
}

function resetMealLists(lists) {
    lists.forEach(list => {
        list.replaceChildren();
    });
}

function resetUI(meals, cal_type, macros) {
    meals.forEach(meal => {
        for (let val in meal) {
            meal[val].textContent = 0;
        }
    });

    cal_type.forEach(type => {
        type.textContent = 0;
    });

    macros.forEach(macro => {
        macro.textContent = 0;
    });
}

export {
    createSearchListItem,
    createSearchListItemForm,
    createEntry,
    updateMealNumbers,
    updateMacrosNumbers,
    resetMealLists,
    resetUI
}