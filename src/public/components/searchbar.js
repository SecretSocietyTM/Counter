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

    input.addEventListener("input", handleSearchInput);

    // closing search dialog with Esc 
    dialog.addEventListener("cancel", () => ui.closeSearchDialog(dialog));
    dialog.addEventListener("click", (e) => {
        if (ui.isClickingOutside(e, dialog)) {
            ui.closeSearchDialog(dialog);
        }
    });
};

// simplified search event
async function handleSearchInput(e) {
    let searchterm = e.target.value;
    SEARCHLIST.deleteAll();
    removeSearchResults();

    if (searchterm.length == 0) return;

    const res = await fetch(`api/food?last_item=0&query=${searchterm}`);
    const data = await res.json();

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.foods.length; i++) {
            SEARCHLIST.add(data.foods[i]);
            let result_ui = ui.createSearchResult(data.foods[i]);
            result_ui.addEventListener("click", selectSearchResult);
            result_ui.addEventListener("keydown", selectSearchResult);
            searchlist.appendChild(result_ui);
        }
    } else {
        alert(data.errmsg);
    }
}

function selectSearchResult(e) {
    if (e.type === "keydown") {
        if (e.key !== "Enter" && e.key !== " ") return;
    }

    let search_result_element = e.target.closest("li");
    if (e.target.closest("form")) return;

    if (active_form) {
        let do_remove = (search_result_element.children.length > 1) ? true : false;
        active_form.remove();
        active_form = null;
        if (do_remove) return;
    }

    const food = SEARCHLIST.getFoodById(search_result_element.dataset.id, "food_id");
    active_form = ui.createSearchResultForm(food);
    active_form.addEventListener("submit", submitEntryForm);
    search_result_element.appendChild(active_form);
    setTimeout(() => {
        active_form.querySelector("[name='servsize']").focus();
    }, 0); 
}


function submitEntryForm(e) {
    e.preventDefault();

    let form = e.target;

    const data = new FormData(form);
    const form_data = Object.fromEntries(data.entries());
    const food = SEARCHLIST.getFoodById(form_data.food_id, "food_id");    

    SEARCHLIST.deleteAll();
    removeSearchResults();
    input.value = "";
    active_form.removeEventListener("submit", submitEntryForm);
    active_form.remove();
    active_form = null;

    dialog.dispatchEvent(new CustomEvent("searchbar:submit", {
        detail: { food, form_data }
    }));
}

function removeSearchResults() {
    Array.from(searchlist.children).forEach(child => {
        child.removeEventListener("click", selectSearchResult);
        child.removeEventListener("keydown", selectSearchResult);
        child.remove();
    });    
}