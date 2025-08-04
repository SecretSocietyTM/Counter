import Component from "../lib/components.js";
import store from "../store/index.js";

export default class PageInitializer extends Component {
    constructor() {
        super({ 
            store, 
            events: {
                "stateChange": () => this.initialize()
            }
        });
    }

    initialize() {
        let now = store.state.now;
        let week_range = store.state.week_range;

        if (!(week_range.start <= now && now <= week_range.end)) {
            
        }
    }


    async initCalorieGoal() {
        const data = await api.getCalorieGoal();

        if (data.success) {
            store.dispatch("loadCalorieGoal", data.goal);
        } else {
            alert(data.errmsg);
        }
    }

    async initDiary(date) {
        const data = await api.getDiary(date);

        if (data.success) {
            for (let i = 0; i < data.entries.length; i++) {
                store.dispatch("loadEntry", data.entries[i]);
            }
        } else {
            alert(data.errmsg);
        }
    }

    async initWeeklySummary(date) {
        const data = await api.getWeeklySummary(date);
        if (data.success) {
            store.dispatch("loadSummaries", data.summaries);
        }
    }

}