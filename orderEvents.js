const EventEmitter = require('events');

class OrderEvents extends EventEmitter {}

// Singleton emitter for order events across the app
const orderEvents = new OrderEvents();

module.exports = orderEvents;


