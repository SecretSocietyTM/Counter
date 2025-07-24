import * as GenUI from "./generalUI.js";

const COLORS = {
    1: "--clr-primary-blue",
    2: "--clr-primary-green",
    3: "--clr-primary-red",
    4: "--clr-accent-yellow",
    5: "--clr-accent-lightblue",
    6: "--clr-accent-purple",
    7: "--clr-accent-orange"
}

const EMOJIS = {
    1: "../assets/recipes/meat.svg",
    2: "../assets/recipes/bowl.svg"
}

let category_names = {};

export function addCategoryName(category) {
    category_names[category.category_id] = category.name;
}

export function setCategorySelect(dialog, category_id) {
    const category_select = dialog.querySelector("[name='category']");

    let option = document.createElement("option");
    option.value = category_id;
    option.textContent = category_names[category_id];
    category_select.appendChild(option);

    for (const category in category_names) {
        if (category == category_id) continue;
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category_names[category];
        category_select.appendChild(option);
    }   
}

export function createCategory(category) {
    const main_container = document.createElement("div");
    main_container.className = "category shadow";
    main_container.dataset.id = category.category_id;
    main_container.style.outline = `2px solid var(${COLORS[category.color]})` 

    const header = document.createElement("div");
    header.className = "category__header";

    const header_title = document.createElement("div");
    header_title.className = "header__title";

    const icon_div = document.createElement("div");
    icon_div.className = "flex gap-1_0 ai-cntr";

    const buttons_div = document.createElement("div");
    buttons_div.className = "flex gap-1_25 ai-cntr";

    const emoji = document.createElement("img");
    emoji.src = EMOJIS[category.emoji];

    const name = document.createElement("p");
    name.className = "fs-24 fw-b";
    name.textContent = category.name;

    const kebab_button = document.createElement("button");
    kebab_button.className = "kebab_btn icon_button";
    kebab_button.type = "button";

    const add_button = document.createElement("button");
    add_button.className = "addrecipe_btn icon_button";
    add_button.dataset.category_id = category.category_id;
    add_button.type = "button";

    const kebab_image = document.createElement("img");
    kebab_image.src = "../assets/shared/icons/x-kebab.svg";
    kebab_button.appendChild(kebab_image);

    const add_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    add_svg.setAttribute("width", "24");
    add_svg.setAttribute("height", "24");
    add_svg.setAttribute("viewBox", "0 0 24 24");
    add_svg.style.color = `var(${COLORS[category.color]})`
    add_button.appendChild(add_svg);

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "../assets/icons.svg#plus");
    add_svg.appendChild(use);

    const blurb = document.createElement("p");
    blurb.className = "fs-14 txt-ntrl-60";
    blurb.textContent = category.blurb;

    const list = document.createElement("ul");
    list.className = "recipeslist";

    main_container.appendChild(header);
    header.appendChild(header_title);
    header_title.append(icon_div, buttons_div);
    icon_div.append(emoji, name);
    buttons_div.append(kebab_button, add_button);
    header.appendChild(blurb);
    main_container.appendChild(list)
    return main_container;
}

export function createIngredient(food) {
    const li = document.createElement("li");
    li.className = "ingredient";
    li.dataset.id = food.food_id;

    const name_div = document.createElement("div");
    name_div.className = "ingredient__name-section";

    const servsize_div = document.createElement("div");
    servsize_div.className = "ingredient__servsize-section";

    const name = document.createElement("p");
    name.className = "ingredient__name truncate"
    name.textContent = food.name;

    const trash_button = document.createElement("button");
    trash_button.type = "button";
    trash_button.classList.add("delete_btn", "icon_button");

    const trash_image = document.createElement("img");
    trash_image.src = "../assets/dashboard/trash.svg";
    trash_button.appendChild(trash_image);

    const servsizeunit = GenUI.createServingUnit(
        food.servsize, food.unit, ["txt-ntrl-10"], ["txt-ntrl-40"]);

    const edit_button = document.createElement("button");
    edit_button.type = "button";
    edit_button.className = "editfood_btn icon_button";

    const edit_image = document.createElement("img");
    edit_image.src = "../assets/shared/icons/edit.svg";
    edit_button.appendChild(edit_image);

    const cal = document.createElement("span");
    cal.className = "ingredient__info txt-prim-green";
    cal.textContent = food.cal;

    const fat = document.createElement("span");
    fat.className = "ingredient__info txt-acnt-yellow";
    fat.textContent = food.fat;

    const carb = document.createElement("span");
    carb.className = "ingredient__info txt-acnt-lightblue";
    carb.textContent = food.carb;

    const prot = document.createElement("span");
    prot.className = "ingredient__info txt-acnt-purple";
    prot.textContent = food.prot;

    li.append(name_div, servsize_div, cal, fat, carb, prot);
    name_div.append(name, trash_button);
    servsize_div.append(servsizeunit, edit_button);
    return li;
}




// setters
export function setReportUI(ui, obj) {
    for (const key of ["cal", "fat", "carb", "prot"]) {
        ui.total[key].textContent = obj.total[key];
        ui.perserv[key].textContent = obj.perserv[key];
    }
}

export function setReportPerServUI(ui, obj) {
    for (const key of ["cal", "fat", "carb", "prot"]) {
        ui.perserv[key].textContent = obj.perserv[key];
    } 
}