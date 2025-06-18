import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";

const searchlist_array = new FoodManager()

let meal_id = null;
let active_form = null;

const now = new Date();

// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");

// search dialog elements
const search_dialog = document.getElementById("search_dialog");
const search_input = document.getElementById("searchbar_input");
const searchlist = document.getElementById("searchlist");


// open search dialog events
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_id = e.target.closest("button").dataset.meal_id;
        search_dialog.style.display = "flex";
        search_dialog.showModal();
    });
});

// close search dialog event (click outside of dialog)
search_dialog.addEventListener("click", (e) => {
    const dialog_dimensions = search_dialog.getBoundingClientRect();
    if (
        e.clientX < dialog_dimensions.left  ||
        e.clientX > dialog_dimensions.right ||
        e.clientY < dialog_dimensions.top   ||
        e.clientY > dialog_dimensions.bottom
    ) {
        search_dialog.style.display = "none";
        search_input.value = "";
        searchlist.replaceChildren();
        search_dialog.close();
    }
});


search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    searchlist.replaceChildren();

    const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`);
    const data = await res.json();

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.items.length; i++) {
            searchlist_array.add(data.items[i]);
            searchlist.appendChild(FoodUI.createSearchListItem(data.items[i]));
        }
    } else {
        alert(data.errmsg);
    }
});

searchlist.addEventListener("click", async (e) => {
    console.log(e.target.closest("#searchform_submit_btn"));
    if (e.target.closest("#searchform_submit_btn")) {

        const form_data = new FormData(active_form);
        const form_obj = Object.fromEntries(form_data.entries());

        if (!active_form.checkValidity()) {
            active_form.reportValidity();
            return;
        }

        console.log(form_obj);

        const res = await fetch("api/foodlist/food/add-to-day", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify(form_obj)
        });
        const data = await res.json();
        console.log(data);
    }

    if (e.target.closest(".item__form")) return;
    if (active_form) {
        active_form.remove();
        active_form = null;
    }
    const searchlist_item = e.target.closest(".searchlist__item");
    /* if (!searchlist_item) return; */
    const searchlist_whole = e.target.closest(".searchlist__whole-item")
    if (searchlist_whole.children.length == 2) return;
    let item = searchlist_array.getFoodById(searchlist_whole.dataset.id)
    active_form = FoodUI.createSearchListItemForm(meal_id, now.toDateString(), item);
    searchlist_whole.appendChild(active_form);
})
