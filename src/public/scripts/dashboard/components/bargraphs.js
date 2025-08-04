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
                "totalsChange": () => this.renderAllBars(),
                "goalChange": () => this.renderAllBars(),
                // TODO: can probably do diaryChange now
                "addEntry": () => this.renderBar(),
                "deleteEntry": () => this.renderBar(),
            }
        });

        this.element.cal_bars = getDayBars(this.element.cal_bargraph);
        this.element.macro_bars = getDayBars(this.element.macro_bargraph);
    }

    renderAllBars() {
        let WEEK_RANGE = store.state.WEEK_RANGE;
        let NOW = store.state.NOW;

        let dates = getWeek(store.state.week_range);

        for (const day of dates) {
            let summary = store.state.daily_summaries[day.getDay()];
            setBar(this.element, day, summary, NOW, WEEK_RANGE);
        }
    }

    renderBar() {
        let WEEK_RANGE = store.state.WEEK_RANGE;
        let NOW = store.state.NOW;
        let now = store.state.now;
        let summary = store.state.daily_summaries[now.getDay()];

        setBar(this.element, store.state.now, summary, NOW, WEEK_RANGE);
    }
}


// helper util functions
function getWeek(range) {
    const dateList = [];
    const current = new Date(range.start); // clone to avoid mutating original

    while (current <= range.end) {
        dateList.push(new Date(current)); // clone again to store
        current.setDate(current.getDate() + 1);
    }

    return dateList;
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


// helper ui functions
function setBar(ui, day, summary, NOW, WEEK_RANGE) {
    resetCalorieGraphBar(ui.cal_bars[day.getDay()], ui.dashoffsets);
    resetMacroGraphBar(ui.macro_bars[day.getDay()], ui.dashoffsets);
    if (!summary) {
        if (day < WEEK_RANGE.start ||
        (!(day >WEEK_RANGE.end) && day < NOW.getDay())) {
            setCalorieBarNull(ui.cal_bars[day.getDay()]);
            setMacroBarNull(ui.macro_bars[day.getDay()]);
            return;
        }
        return;
    }

    let macro_percentages = generatePercentagesObj(summary);
    let value = summary.cal / store.state.caloriestats.goal * 100;
    setCalorieGraphBar(ui.cal_bars[day.getDay()], value, ui.dashoffsets);
    setMacroGraphBar(ui.macro_bars[day.getDay()], macro_percentages);
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

export function resetMacroGraphBar(bar, dashoffsets) {
    const nill = bar.querySelector(".null-progress-bar");
    nill.style.strokeDashoffset = dashoffsets.null;
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