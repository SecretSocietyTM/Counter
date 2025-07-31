import * as ui from "./searchbarUI.js";
import { FoodManager } from "../scripts/util/shared/foodmanager.js";

const SEARCHLIST = new FoodManager();

let dialog = null;
let searchbar = null;
let input = null;
let searchlist = null;
let clear_search_btn = null;

let active_form = null;

export async function loadSearchbar(target) {
    const res = await fetch("/components/searchbar.html");
    const html = await res.text();
    target.innerHTML = html;
    attachSearchbarLogic(target);
}

export function showSearch() {
    dialog.style.display = "flex";
    dialog.showModal();
}

async function attachSearchbarLogic(root) {
    dialog = root.querySelector("#search_dialog");
    searchbar = root.querySelector("#searchbar");
    input = root.querySelector("#searchbar_input");
    searchlist = root.querySelector("#searchlist");
    clear_search_btn = root.querySelector("#clear_search_btn");

    // closing search dialog with Esc 
    dialog.addEventListener("cancel", (e) => {
        ui.closeSearchDialog(dialog);
    });
    dialog.addEventListener("click", handleDialogClick)
    input.addEventListener("input", handleSearchInput);
};


// selecting items event
async function handleDialogClick(e) {
    if (ui.isClickingOutside(e, dialog)) {
        ui.closeSearchDialog(dialog);
    }

    if (e.target.closest("form")) return;
    const searchlist_whole = e.target.closest(".searchlist__whole-item");
    if (!searchlist_whole) return;

    if (searchlist_whole && active_form) {
        let remove = (searchlist_whole.children.length > 1) ? true : false;
        active_form.remove();
        active_form = null;
        if (remove) return;
    }

    if (!searchlist_whole.querySelector("form")) {
        const food = SEARCHLIST.getFoodById(searchlist_whole.dataset.id, "food_id");
        active_form = ui.createSearchResultForm(food);
        searchlist_whole.appendChild(active_form);
        active_form.querySelector("[name='servsize']").focus();

        const form_data = await submitFormData(active_form);

        dialog.dispatchEvent(new CustomEvent("searchbar:submit", {
            detail: { food, form_data }
        }));
    }
}

// simplified search event
async function handleSearchInput(e) {
    let searchterm = e.target.value;
    searchlist.replaceChildren();
    SEARCHLIST.deleteAll();

    if (searchterm.length == 0) return;

    const res = await fetch(`api/food?last_item=0&query=${searchterm}`);
    const data = await res.json();

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.foods.length; i++) {
            SEARCHLIST.add(data.foods[i]);
            searchlist.appendChild(ui.createSearchResult(data.foods[i]));
        }
    } else {
        alert(data.errmsg);
    }
}

// mini-form is submitted
function submitFormData(form) {
    return new Promise(resolve => {
        form.addEventListener("click", async (e) => {
            if (!e.target.closest("#searchform_submit_btn")) return;
            let form_data = ui.checkFormValidity(form);
            if (!form_data) return;

            setTimeout(() => {
                input.value = "";
                searchlist.replaceChildren();
                active_form.remove();
                active_form = null;
                resolve(form_data);
            }, 0);
        });
    });
}