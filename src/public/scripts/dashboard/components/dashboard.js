import Component from "../lib/components.js";
import store from "../store/index.js";

export default class Dashboard extends Component {
    constructor() {
        super({ 
            store, 
            events: {
                "dayChange": () => this.initDiary(),
                "weekChange": () => this.initWeeklySummary()
            }
        });
    }

    initDiary() {
        store.dispatch("loadEntries", store.state.now);
    }

    initWeeklySummary() {
        store.dispatch("loadSummaries", store.state.now);
    }

    initCalorieGoal() {
        store.dispatch("loadCalorieGoal");
    }
}