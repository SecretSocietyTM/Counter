export default class PubSub {
    constructor() {
        this.events = {};
    }

    subscribe(event, callback) {
        let self = this;
        
        if (!self.events.hasOwnProperty(event)) {
            self.events[event] = [];
        }
        self.events[event].push(callback);
    }

    publish(event, data = {}) {
        let self = this;
        
        if (!self.events.hasOwnProperty(event)) return;
        self.events[event].forEach(callback => callback(data));
    }
}