import { FoodManager } from "./foodmanager.js";

const dialog = document.querySelector("dialog");

// buttons
const addfood_btn = document.getElementById("addfood_btn");
const cancel_btn = document.getElementById("cancel_btn");

// pseudo button
const foodlist = document.getElementById("foodlist");

// dialog elements
const dlg_title = document.getElementById("dialog_title");
const delete_btn = document.getElementById("delete_btn");

addfood_btn.addEventListener("click", () => {
    dlg_title.textContent = "Add New Food";
    delete_btn.style.visibility = "hidden";
    dialog.showModal();
});

foodlist.addEventListener("click", e => {
    const editfood_btn = e.target.closest(".editfood_btn");
    if (editfood_btn) {
        dlg_title.textContent = "Edit Your Food";
        delete_btn.style.visibility = "visible";
        dialog.showModal();
    }
});

cancel_btn.addEventListener("click", () => {
    dialog.close();
    addfood_btn.blur();
});


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

/* const test_item = {
    food_id: -1,
    user_id: 1,
    name: "dot’s homestyle snacks baked cheese curls",
    serving_size: 28,
    unit: "g",
    calories: 100,
    fat: 8,
    carbs: 15,
    protein: 2
}

foodlist.appendChild(createItem(test_item)); */