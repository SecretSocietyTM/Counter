function createItem(item) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = item.food_id;

    const name = document.createElement("p");
    name.className = "name";
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


function updateItem(item, li_item) {
    li_item.querySelector(".name").textContent = item.name;
    li_item.querySelector(".servsize").textContent = item.serving_size;
    li_item.querySelector(".unit").textContent = item.unit;
    li_item.querySelector(".cal").textContent = item.calories;
    li_item.querySelector(".fat").textContent = item.fat;
    li_item.querySelector(".carb").textContent = item.carbs;
    li_item.querySelector(".prot").textContent = item.protein;
}
export { 
    createItem,
    updateItem
}