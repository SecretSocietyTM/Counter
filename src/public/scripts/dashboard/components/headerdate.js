import * as dateUtil from "../../util/shared/date.js"

import Component from "../lib/components.js";
import store from "../store/index.js";

export default class HeaderDate extends Component {
    constructor() {
        super({ 
            store, 
            element: {
                main: document.getElementById("main_date"),
                sub: document.getElementById("sub_date"),
                week: document.getElementById("week_date")
            },
            events: {
                "dayChange": () => this.render()
            }
        });
    }

    render() {
        let NOW = store.state.NOW;
        let now = store.state.now;
        let label = dateUtil.getLabel(now, NOW);
        let range = dateUtil.formatWeekRange(now)

        if (label) {
        setMainDate(this.element.main, label);
        this.element.sub.textContent = dateUtil.formatDate(now);
        } else {
            setMainDate(this.element.main, undefined, dateUtil.dowToString(now));
            this.element.sub.textContent = dateUtil.formatDateNoDow(now);
        }
        this.element.week.textContent = `${range.start} - ${range.end}`;
    }
}


// helper ui functions
function setMainDate(ui, flag=undefined, date) {
    if (flag == "today") {
        ui.textContent = "Today";
    } else if (flag == "yest") {
        ui.textContent = "Yesterday";
    } else if (flag == "tmrw") {
        ui.textContent = "Tomorrow";
    } else {
        ui.textContent = date;
    }
}