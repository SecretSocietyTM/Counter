import store from "./store/index.js";
import * as api from "./api.js"
import * as searchbar from "../../components/searchbar.js";
import * as dateUtil from "../util/shared/date.js";

import MealList from "./uicomponents/meallists.js";
import MealStats from "./uicomponents/mealstats.js";
import CalorieStats from "./uicomponents/caloriestats.js";
import CalorieGoal from "./uicomponents/caloriegoal.js";
import Macros from "./uicomponents/macros.js";
import BarGraphs from "./uicomponents/bargraphs.js";
import Averages from "./uicomponents/averages.js";
import HeaderDate from "./uicomponents/headerdate.js";
import PageInitializer from "./component/PageInitializer.js";

const breakfast_list = new MealList("Breakfast");
const lunch_list = new MealList("Lunch");
const dinner_list = new MealList("Dinner");
const snacks_list = new MealList("Snacks");
const breakfast_stats = new MealStats("Breakfast");
const lunch_stats = new MealStats("Lunch");
const dinner_stats = new MealStats("Dinner");
const snacks_stats = new MealStats("Snacks");
const calorie_stats = new CalorieStats();
const calorie_goal = new CalorieGoal();
const macros = new Macros();
const bargraphs = new BarGraphs();
const averages = new Averages();
const headerdate = new HeaderDate();
const page = new PageInitializer();

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


/* // page init functions
async function initCalorieGoal() {
    const data = await api.getCalorieGoal();

    if (data.success) {
        store.dispatch("loadCalorieGoal", data.goal);
    } else {
        alert(data.errmsg);
    }
}

async function initDiary(date) {
    const data = await api.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.entries.length; i++) {
            store.dispatch("loadEntry", data.entries[i]);
        }
    } else {
        alert(data.errmsg);
    }
}

async function initWeeklySummary(date) {
    const data = await api.getWeeklySummary(date);
    if (data.success) {
        store.dispatch("loadSummaries", data.summaries);
    }
}
 */


headerdate.render();
page.initCalorieGoal();
page.initDiary(store.state.now);
page.initWeeklySummary(store.state.now);
