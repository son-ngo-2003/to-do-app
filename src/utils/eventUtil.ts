import { EventEmitter } from "expo-modules-core";

export enum EventNames {
    DismissKeyboard = 'dismissKeyboard',
}

type EventData = any;

class MyEventEmitter {
    private emitter: any;

    constructor() {
        this.emitter = new EventEmitter();
    }

    emit(eventName: EventNames, data?: EventData) {
        this.emitter.emit(eventName, data);
    }

    on(eventName: EventNames, listener: (data: EventData) => void) {
        this.emitter.addListener(eventName, listener);
        return listener;
    }

    remove(eventName: EventNames, listener: (data: EventData) => void) {
        this.emitter.removeListener(eventName, listener);
    }
}

export const eventEmitter = new MyEventEmitter();


