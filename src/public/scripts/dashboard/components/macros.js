import Component from "../lib/components.js";
import store from "../store/index.js";

export default class Macros extends Component {
    constructor() {
        super({ 
            store, 
            element: {
                fat:  document.getElementById("main_fat"),
                carb: document.getElementById("main_carb"),
                prot: document.getElementById("main_prot")
            },
            events: {
                // TODO: can probably do diaryChange now
                "addEntry": () => this.render(),
                "deleteEntry": () => this.render(),
                "loadEntry": () => this.render(),
            }
        });
    }

    render() {
        const stats = store.state.macrostats;
        renderMacroStats(this.element, stats);
    }
}


// helper ui functions
function renderMacroStats(ui, obj) {
    const is_active = obj.fat > 0 || obj.carb > 0 || obj.prot > 0;

    for (const key in ui) {
        if (is_active) ui[key].className = "card__value on";
        else ui[key].className = "card__value off";
        ui[key].textContent = obj[key];
    }
}
