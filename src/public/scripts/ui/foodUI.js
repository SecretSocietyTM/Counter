
// TODO: rename functions? create classes for each section??? 
// example: foodListPageClass, dashboardSearchListClass, dashboardEatenClass
function createListItem(item) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = item.food_id;

    const name = document.createElement("p");
    name.classList.add("name", "truncate", "max-w-55");
    name.textContent = item.name;

    const div = document.createElement("div");
    div.className = "item__info";

    const div_numbers = document.createElement("div");
    div_numbers.className = "info__numbers";

    const servsizeunit = createServingUnit(
        item.serving_size, item.unit, ["servsize"], ["unit"]);

    const cal = createMacro(item.calories, "cal", ["cal"]);
    const fat = createMacro(item.fat, undefined, ["fat"]);
    const carb = createMacro(item.carbs, undefined, ["carb"]);
    const prot = createMacro(item.protein, undefined, ["prot"]);

    const dot = document.createElement("p");
    dot.className = "dot";
    dot.innerHTML = "&#9679;";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "editfood_btn icon_button";

    const image = document.createElement("img");
    image.src = "../assets/shared/icons/edit.svg";

    button.appendChild(image);
    div_numbers.append(servsizeunit, dot, cal, fat, carb, prot);
    div.append(div_numbers, button);
    li.append(name, div);
    return li;
}

function createSpan(text, classes = []) {
    const span = document.createElement("span");
    span.textContent = text;
    span.classList.add(...classes);
    return span;
}

function createServingUnit(value, unit, value_classes = [], unit_classes = []) {
    const p = document.createElement("p");
    const span1 = createSpan(value, value_classes);
    const span2 = createSpan(unit, unit_classes);
    p.appendChild(span1);
    p.appendChild(span2);
    return p;
}

function createMacro(value, unit = "g", span_classes = []) {
    const p = document.createElement("p");
    const span = createSpan(value, span_classes);
    p.appendChild(span);
    p.append(unit);
    return p;
}

function updateListItem(item, listitem) {
    listitem.querySelector(".name").textContent = item.name;
    listitem.querySelector(".servsize").textContent = item.serving_size;
    listitem.querySelector(".unit").textContent = item.unit;
    listitem.querySelector(".cal").textContent = item.calories;
    listitem.querySelector(".fat").textContent = item.fat;
    listitem.querySelector(".carb").textContent = item.carbs;
    listitem.querySelector(".prot").textContent = item.protein;
}

function updateForm(form, item) {
    form.querySelector("[name='name']").value = item.name;
    form.querySelector("[name='servsize']").value = item.serving_size;
    form.querySelector("[name='unit']").value = item.unit;
    form.querySelector("[name='cal']").value = item.calories;
    form.querySelector("[name='fat']").value = item.fat;
    form.querySelector("[name='carb']").value = item.carbs;
    form.querySelector("[name='prot']").value = item.protein;
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
    meal_type.name = "meal_id";
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

function createMealListItem(item) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = item.food_id;

    const name = document.createElement("p");
    name.classList.add("truncate", "max-w-75");
    name.textContent = item.name;

    const div = document.createElement("div");
    div.className = "item__info";

    const servsizeunit = createServingUnit(
        item.serving_size, item.unit, ["servsize"], ["unit"]);

    const trash_button = document.createElement("button");
    trash_button.type = "button";
    trash_button.className = "icon_button";

    const trash_image = document.createElement("img");
    trash_image.src = "../assets/dashboard/trash.svg";

    trash_button.appendChild(trash_image);
    
    div.append(servsizeunit, trash_button);
    li.append(name, div);
    return li;
}

export { 
    createListItem,
    updateListItem,
    updateForm,
    createSearchListItem,
    createSearchListItemForm,
    createMealListItem
}