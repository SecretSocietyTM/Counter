import * as GenUI from "./generalUI.js";

// helpers



// element creators
export function createListItem(food) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = food.food_id;

    const name = document.createElement("p");
    name.classList.add("name", "truncate", "max-w-55");
    name.textContent = food.name;

    const div = document.createElement("div");
    div.className = "item__info";

    const div_numbers = document.createElement("div");
    div_numbers.className = "info__numbers";

    const servsizeunit = GenUI.createServingUnit(
        food.servsize, food.unit, ["servsize"], ["unit"]);

    const cal = GenUI.createMacro(food.cal, "cal", ["cal"]);
    const fat = GenUI.createMacro(food.fat, undefined, ["fat"]);
    const carb = GenUI.createMacro(food.carb, undefined, ["carb"]);
    const prot = GenUI.createMacro(food.prot, undefined, ["prot"]);

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



// element actions
export function showDialogAddMode(obj) {
    obj.title.textContent = "Add New Food";
    obj.delete_btn.style.visibility = "hidden";
    obj.edit_btn.style.display = "none";
    obj.add_btn.style.display = "";
    obj.dialog.showModal();
}

export function showDialogEditMode(obj) {
    obj.title.textContent = "Edit Your Food";
    obj.delete_btn.style.visibility = "visible";
    obj.edit_btn.style.display = "";
    obj.add_btn.style.display = "none";
    obj.dialog.showModal();    
}

export function closeDialog(obj) {
    obj.dialog.close();
    obj.form.reset();
    obj.err_msg.textContent = "";
    obj.open_btn.blur();
}

export const isClickingOutside = GenUI.isClickingOutside;

export const checkFormValidity = GenUI.checkFormValidity;


// setters
export function setFoodUI(food_ui, food) {
    let keys = ["name", "servsize", "unit", "cal", "fat", "carb", "prot"];
    for (const key of keys) {
        food_ui.querySelector(`.${key}`).textContent = food[key];
    }
}

export function setFormUI(form_ui, food) {
    let keys = ["name", "servsize", "unit", "cal", "fat", "carb", "prot"]
    for (const key of keys) {
        form_ui.querySelector(`[name='${key}']`).value = food[key];
    }
}



// resetters



// getters