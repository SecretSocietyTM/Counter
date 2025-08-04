import PubSub from "../lib/pubsub.js";

export default class Store {
    constructor(params) {
        let self = this;

        self.events = new PubSub();
        self.state = (params.hasOwnProperty("state")) ? params.state : {};
        self.actions = (params.hasOwnProperty("actions")) ? params.actions : {};
        self.mutations = (params.hasOwnProperty("mutations")) ? params.mutations : {};
    }

    dispatch(action_key, payload) {
        let self = this;
        const action = self.actions[action_key]; 

        if (typeof action !== "function") {
            console.error(`Action "${action_key} doesn't exist.`);
            return false;
        }

        action(self, payload);
        return true;
    }

    commit(mutation_key, payload) {
        let self = this;
        const mutation = self.mutations[mutation_key];

        if (typeof mutation !== "function") {
            console.error(`Mutation "${mutation_key} doesn't exist.`);
            return false;
        }

        const { events, data } = mutation(self.state, payload);
        for (const event of events) {
            self.events.publish(event, data);
        }
        return true;
    }
}