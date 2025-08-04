import Store from "../store/store.js";

export default class Component {
    constructor(props = {}) {
        if(props.store instanceof Store) {
            for (const event in props.events) {
                props.store.events.subscribe(event, props.events[event]);
            }
        }
        
        if(props.hasOwnProperty("element")) {
            this.element = props.element;
        }
    }
}