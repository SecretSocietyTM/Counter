import store from "./store/index.js";
import components from "./components/index.js";

import * as searchbar from "../../components/searchbar.js";
import * as dateUtil from "../util/shared/date.js";

const diary = document.getElementById("diary");
const add_food_btns = document.querySelectorAll(".addfood_btn");
const searchbar_target = document.getElementById("searchbar_target");
const date_input = document.getElementById("date_input");
const date_left_btn = document.getElementById("date_arrow_l");
const date_right_btn = document.getElementById("date_arrow_r");


let meal_type = null;

add_food_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_type = e.target.closest("button").dataset.meal_type;
        searchbar.showSearch();
    });
});


await searchbar.loadSearchbar(searchbar_target);

searchbar_target.querySelector("#search_dialog").
    addEventListener("searchbar:submit", (e) => {
        const entry = e.detail.form_data;
        entry.meal_type = meal_type;
        entry.date = store.state.now.toDateString();

        store.dispatch("addEntry", entry);
});

diary.addEventListener("click", (e) => {
    if (!e.target.closest(".delete_btn")) return;

    const entry_id = e.target.closest("li").dataset.id;
    
    store.dispatch("deleteEntry", entry_id);
});


// date change events
date_input.addEventListener("change", (e) => {
    store.dispatch("dateChange", dateUtil.inputToDate(date_input.value));
});

date_left_btn.addEventListener("click", (e) => {
    if (!e.target.closest("#date_arrow_l")) return;
    let new_now = new Date(store.state.now);
    new_now.setDate(new_now.getDate() - 1);

    store.dispatch("dateChange", new_now);
});

date_right_btn.addEventListener("click", (e) => {
    if (!e.target.closest("#date_arrow_r")) return;
    let new_now = new Date(store.state.now);
    new_now.setDate(new_now.getDate() + 1);

    store.dispatch("dateChange", new_now);
});


components.headerdate.render();
components.dashboard.initCalorieGoal();
components.dashboard.initDiary();
components.dashboard.initWeeklySummary();
