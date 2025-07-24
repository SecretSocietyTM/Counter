import * as GenUI from "../scripts/ui/generalUI.js";


// helpers
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

export function createSearchResultForm(food, meal = null, _date = null) {
    const form = document.createElement("form");
    form.className = "item__form";

    const inputs = document.createElement("div");
    inputs.className = "form__inputs";

    const buttons = document.createElement("div");
    buttons.className = "form__buttons";

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

    if (meal && _date) {
        const meal_type = document.createElement("input");
        meal_type.type = "hidden";
        meal_type.name = "meal_type";
        meal_type.value = meal;

        const date = document.createElement("input");
        date.type = "hidden";
        date.name = "date";
        date.value = _date;

        inputs.append(meal_type, date, food_id, servsize, unit);
    } else {
        inputs.append(food_id, servsize, unit);
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

    form.append(inputs, buttons);
    return form;
}


// element actions
export function closeSearchDialog(search_dialog) {
    search_dialog.style.display = "none";
    search_dialog.querySelector("#searchbar_input").style.value="";
    search_dialog.querySelector("#searchlist").replaceChildren();
    search_dialog.close();
}

export const isClickingOutside = GenUI.isClickingOutside;

export const checkFormValidity = GenUI.checkFormValidity;