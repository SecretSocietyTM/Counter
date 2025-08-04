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
                "stateChange": () => this.render()
            }
        });
    }

    render() {
        let now = store.state.now;

        let range = dateUtil.formatWeekRange(now)

        this.element.sub.textContent = dateUtil.formatDate(now)
        this.element.week.textContent = `${range.start} - ${range.end}`;
    }
}