import Component from "../lib/components.js";
import store from "../store/index.js";

export default class BarGraphs extends Component {
    constructor() {
        super({ 
            store, 
            element: {
                cal_bargraph: document.getElementById("calorie-bar-graph"),
                macro_bargraph: document.getElementById("macro-bar-graph"),
                dashoffsets: { null: 84, goal: 56, over: 9},
                cal_bars: [],
                macro_bars: []
            },
            events: {
                "loadSummaries": () => this.loadSummaries(), // do something to all graphs
                "goalChange": () => this.loadSummaries(),
                "addEntry": () => this.stateChange("addEntry"),   // do something to one graph (of specific day)
                "deleteEntry": () => this.stateChange("deleteEntry"),
            }
        });

        this.element.cal_bars = getDayBars(this.element.cal_bargraph);
        this.element.macro_bars = getDayBars(this.element.macro_bargraph);
    }

    loadSummaries() {
        let summaries = store.state.daily_summaries;
        let WEEK_RANGE = store.state.WEEK_RANGE;
        let NOW = store.state.NOW;
        let now = store.state.now;

        for (let i = 0; i < summaries.length; i++) {
            if (!summaries[i]) {
                if (now < WEEK_RANGE.start ||
                   (!(now >WEEK_RANGE.end) && i < NOW.getDay())) {
                    setCalorieBarNull(this.element.cal_bars[i]);
                    setMacroBarNull(this.element.macro_bars[i]);
                }
            } else {
                let macro_percentages = generatePercentagesObj(summaries[i]);
                let value = summaries[i].cal / store.state.caloriestats.goal * 100;
                setCalorieGraphBar(this.element.cal_bars[i], value, this.element.dashoffsets)
                setMacroGraphBar(this.element.macro_bars[i], macro_percentages);                
            }
        }
    }

    stateChange(flag) {
        let summaries = store.state.daily_summaries;
        let WEEK_RANGE = store.state.WEEK_RANGE;
        let NOW = store.state.NOW;
        let now = store.state.now;

        if (flag === "deleteEntry") {
            if (!summaries[now.getDay()]) {
                if (now < WEEK_RANGE.start ||
                (!(now >WEEK_RANGE.end) && now < NOW.getDay())) {
                    setCalorieBarNull(this.element.cal_bars[now.getDay()]);
                    setMacroBarNull(this.element.macro_bars[now.getDay()]);
                }
                resetCalorieGraphBar(this.element.cal_bars[now.getDay()], this.element.dashoffsets);
                resetMacroGraphBar(this.element.macro_bars[now.getDay()]);
                return;
            }
        }

        let macro_percentages = generatePercentagesObj(summaries[now.getDay()]);
        let value = summaries[now.getDay()].cal / store.state.caloriestats.goal * 100;
        setCalorieGraphBar(this.element.cal_bars[now.getDay()], value, this.element.dashoffsets);
        setMacroGraphBar(this.element.macro_bars[now.getDay()], macro_percentages);
    }
}

function generatePercentagesObj(summary) {
    const macros_sum = summary.fat + summary.carb + summary.prot;
    if (!macros_sum) macros_sum = 1;
    const macro_percentages = {};
    for (const key of ["fat", "carb", "prot"]) {
        macro_percentages[key] = summary[key] / macros_sum;
    }
    
    return macro_percentages;
}

function getDayBars(parent) {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(
        day => parent.querySelector(`.${day}-bar`)
    );
}

function setCalorieBarNull(bar) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");

    goal.style.stroke = "var(--clr-neutral-40)";
    goal.style.strokeDashoffset = 0;
    over.style.stroke = "var(--clr-neutral-40)";
    over.style.strokeDashoffset = 0;
}

function setMacroBarNull(bar) {
    const nill = bar.querySelector(".null-progress-bar");
    nill.style.strokeDashoffset = 0;
}

function setCalorieGraphBar(bar, value, dashoffsets) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");

    if (value > 100) {
        value -= 100;
        goal.style.strokeDashoffset = 0;
        over.style.strokeDashoffset = dashoffsets.over * (100 - value) / 100;
    } else {
        over.style.strokeDashoffset = dashoffsets.over;
        goal.style.strokeDashoffset = dashoffsets.goal * (100 - value) / 100;
    }
}

function setMacroGraphBar(bar, percentages) {
    const macros = {
        fat: bar.querySelector(".fat-progress-bar"),
        carb: bar.querySelector(".carb-progress-bar"),
        prot: bar.querySelector(".prot-progress-bar")
    }
    const macros_keys = Object.keys(macros);
    const usable_space = 84 - (2 * 16); // subject to change
    let cur_start = 92;
    let cur_end = cur_start - (usable_space * percentages[macros_keys[0]]);
    for (let i = 1; i < macros_keys.length+1; i++) {
        macros[macros_keys[i-1]].setAttribute("y1", cur_start);
        macros[macros_keys[i-1]].setAttribute("y2", cur_end);
        macros[macros_keys[i-1]].style.opacity = "1";
        macros[macros_keys[i-1]].style.strokeDasharray = Math.ceil(cur_start - cur_end);
        macros[macros_keys[i-1]].style.strokeDashoffset = 0;

        if (i === macros_keys.length) break;
        cur_start = cur_end - 16;
        cur_end = cur_start - (usable_space * percentages[macros_keys[i]]);         
    }
}

export function resetCalorieGraphBar(bar, dashoffsets) {
    const goal = bar.querySelector(".goal-progress-bar");
    const over = bar.querySelector(".over-progress-bar");
    
    goal.style.stroke = "var(--clr-primary-green)";
    goal.style.strokeDashoffset = dashoffsets.goal;
    over.style.stroke = "var(--clr-primary-red)";
    over.style.strokeDashoffset = dashoffsets.over;
}

export function resetMacroGraphBar(bar) {
    const macros = {
        fat: bar.querySelector(".fat-progress-bar"),
        carb: bar.querySelector(".carb-progress-bar"),
        prot: bar.querySelector(".prot-progress-bar")
    }
    for (const key in macros) {
        macros[key].setAttribute("y1", 0);
        macros[key].setAttribute("y2", 0);
        macros[key].style.opacity = "0";
        macros[key].style.strokeDasharray = 0;
        macros[key].style.strokeDashoffset = 0;
    }
}