import Component from "../lib/components.js";
import store from "../store/index.js";

import * as GenUI from "../../ui/generalUI.js";

export default class MealList extends Component {
    constructor(meal_name) {
        const id = `${meal_name.toLowerCase()}_list`;
        super({ 
            store, 
            element: document.getElementById(id),
            events: {
                [`add${meal_name}Entry`]: (data) => this.addEntry(data),
                [`delete${meal_name}Entry`]: (data) => this.deleteEntry(data)
            }
        });
    }

    addEntry(entry) {
        this.element.appendChild(createEntry(entry));
    }

    deleteEntry(entry) {
        const target_id = entry.entry_id;
        const match = Array.from(this.element.children).
            find(el => el.dataset.id == target_id);
        match.remove();
    }
}


// helper functions
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