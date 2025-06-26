import * as GenUI from "./generalUI.js";

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
    ui_numbers.cal.classList.add("fw-b", "txt-prim-green");
    ui_numbers.fat.classList.add("fw-b", "txt-acnt-yellow");
    ui_numbers.carb.classList.add("fw-b", "txt-acnt-lightblue");
    ui_numbers.prot.classList.add("fw-b", "txt-acnt-purple");

    ui_numbers.cal.textContent = values.cal;
    ui_numbers.fat.textContent = values.fat;
    ui_numbers.carb.textContent = values.carb;
    ui_numbers.prot.textContent = values.prot;
}

function resetMealNumbers(ui_numbers) {
    ui_numbers.cal.classList.remove("fw-b", "txt-prim-green");
    ui_numbers.fat.classList.remove("fw-b", "txt-acnt-yellow");
    ui_numbers.carb.classList.remove("fw-b", "txt-acnt-lightblue");
    ui_numbers.prot.classList.remove("fw-b", "txt-acnt-purple");

    ui_numbers.cal.textContent = 0;
    ui_numbers.fat.textContent = 0;
    ui_numbers.carb.textContent = 0;
    ui_numbers.prot.textContent = 0;
}

function resetMealLists(lists) {
    lists.forEach(list => {
        list.replaceChildren();
    });
}

function resetUI(meals, mains) {
    meals.forEach(meal => {
        for (let val in meal) {
            meal[val].textContent = 0;
        }
    });

    mains.forEach(main => {
        main.textContent = 0;
    });
}

export {
    createSearchListItem,
    createSearchListItemForm,
    createEntry,
    updateMealNumbers,
    resetMealNumbers,
    resetMealLists,
    resetUI
}