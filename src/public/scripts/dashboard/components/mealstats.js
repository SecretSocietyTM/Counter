import Component from "../lib/components.js";
import store from "../store/index.js";

export default class MealStats extends Component {
    constructor(meal_name) {
        const id = `${meal_name.toLowerCase()}_numbers`;
        super({ 
            store, 
            element: document.getElementById(id),
            events: {
                [`add${meal_name}Entry`]: (data) => this.render(data),
                [`delete${meal_name}Entry`]: (data) => this.render(data),
                "dayChange": () => this.clear()
            }
        });
    }

    render(entry) {
        let meal_type = entry.meal_type;
        const stats = store.state.meal_stats[meal_type];

        setMealStatsUI(this.element, stats);
    }

    clear() {
        setMealStatsUI(this.element, {cal: 0, fat: 0, carb: 0, prot: 0});
    }
}


// helper ui functions
function setMealStatsUI(ui, obj) {
    const text_colors = {
        cal: "txt-prim-green",
        fat: "txt-acnt-yellow",
        carb: "txt-acnt-lightblue",
        prot: "txt-acnt-purple"
    }

    const meal_stats = {
        cal: ui.querySelector(".cal"),
        fat: ui.querySelector(".fat"),
        carb: ui.querySelector(".carb"),
        prot: ui.querySelector(".prot")
    }

    const is_active = obj.cal > 0 || obj.fat > 0 || obj.carb > 0 || obj.prot > 0;
    
    for (const key in meal_stats) {
        meal_stats[key].classList.toggle("fw-b", is_active);
        meal_stats[key].classList.toggle(text_colors[key], is_active);
        meal_stats[key].textContent = obj[key];
    }
}