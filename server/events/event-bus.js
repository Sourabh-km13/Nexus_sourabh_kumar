const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.eventLog = [];
  }

  publish(eventName, payload) {
    console.log(`[EventBus] Publishing ${eventName}:`, payload);
    this.emit(eventName, payload);
    this.emit('all', { eventName, payload, timestamp: new Date() });
  }

  subscribe(eventName, callback) {
    this.on(eventName, callback);
  }

  subscribeAll(callback) {
    this.on('all', callback);
  }
}

module.exports = new EventBus();
