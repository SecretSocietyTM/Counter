import Component from "../lib/components.js";
import store from "../store/index.js";

export default class Averages extends Component {
    constructor() {
        super({ 
            store, 
            element: {
                cal:  document.getElementById("average_calories"),
                fat:  document.getElementById("average_fat"),
                carb: document.getElementById("average_carb"),
                prot: document.getElementById("average_prot"),
            },
            events: {
                "loadSummaries": () => this.render(),
                "stateChange": () => this.render()
            }
        });
    }

    render() {
        const totals = store.state.week_totals;

        const avgs = initWeeklyAverage(totals, store.state.days_logged);
        setWeeklyAveragesUI(this.element, avgs);
    }
}

function initWeeklyAverage(obj, days_logged) {
    let averages = {};
    if (days_logged === 0) days_logged = 1;
    for (const key in obj) {
        averages[key] = Math.round(obj[key] / days_logged);
    }
    return averages;
}

function setWeeklyAveragesUI(ui, obj) {
    for (const key in ui) { ui[key].textContent = obj[key]};
}