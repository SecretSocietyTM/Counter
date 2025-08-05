import Component from "../lib/components.js";
import store from "../store/index.js";

export default class CalorieStats extends Component {
    constructor() {
        super({ 
            store, 
            element: {
                dial: {
                    bar:     document.getElementById("progress_bar"),
                    pointer: document.getElementById("indicator_pointer"),
                    text:    document.getElementById("indicator_text"),
                    dashoffset: 189.5,
                    rotation: -128,
                },
                stats: {
                    remaining: document.getElementById("remaining_calories"),
                    over:      document.getElementById("over_calories"),
                }

            },
            events: {
                // TODO: can probably do diaryChange now
                "addEntry": () => this.render(),
                "deleteEntry": () => this.render(),
                "loadEntry": () => this.render(),
                "dayChange": () => this.render(),
                "goalChange": () => this.render()
            }
        });
    }

    render() {
        const stats = store.state.calorie_stats;
        renderCalorieDial(this.element.dial, stats);
        renderCalorieStats(this.element.stats, stats);
    }
}


// helper ui functions
function renderCalorieStats(ui, obj) {
    for (const key in ui) {
        ui[key].textContent = obj[key];
    }
}

function renderCalorieDial(ui, obj) {
    let normalize = obj.total / obj.goal * 100;
    if (normalize > 100) normalize = 100;
    const stroke_dashoffset_value = ui.dashoffset * (100 - normalize) / 100;
    const rotate_zvalue = (ui.rotation) * (50 - normalize) / 50;

    ui.bar.style.strokeDashoffset = stroke_dashoffset_value;
    ui.pointer.style.transform = `rotateZ(${rotate_zvalue}deg)`;
    ui.text.firstChild.textContent = obj.total;
}