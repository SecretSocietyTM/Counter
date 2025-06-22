import * as GenUI from "./generalUI.js";

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

    const servsizeunit = GenUI.createServingUnit(
        item.serving_size, item.unit, ["servsize"], ["unit"]);

    const cal = GenUI.createMacro(item.calories, "cal", ["cal"]);
    const fat = GenUI.createMacro(item.fat, undefined, ["fat"]);
    const carb = GenUI.createMacro(item.carbs, undefined, ["carb"]);
    const prot = GenUI.createMacro(item.protein, undefined, ["prot"]);

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

export { 
    createListItem,
    updateListItem,
    updateForm
}