import Component from "../lib/components.js";
import store from "../store/index.js";

export default class CalorieGoal extends Component {
    constructor() {
        super({ 
            store, 
            element: document.getElementById("goal_calories"),
            events: {
                "goalChange": () => this.render()
            }
        });
    }

    render() {
        const stats = store.state.caloriestats;
        this.element.textContent = stats.goal;
    }
}