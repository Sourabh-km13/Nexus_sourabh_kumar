const eventBus = require('../events/event-bus');

class SSEManager {
  constructor() {
    this.clients = new Set();
  }

  // Register a response object as an SSE client
  registerClient(res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const clientId = Date.now();
    const client = { id: clientId, res };
    this.clients.add(client);

    console.log(`🔌 SSE Client connected: ${clientId}. Total clients: ${this.clients.size}`);

    // Send initial connection event
    this.sendEvent(res, 'connected', { message: 'Connected to NEXUS Event Stream' });

    res.on('close', () => {
      this.clients.delete(client);
      console.log(`🔌 SSE Client disconnected: ${clientId}. Total clients: ${this.clients.size}`);
    });
  }

  sendEvent(res, eventName, data) {
    if (eventName) {
      res.write(`event: ${eventName}\n`);
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  broadcast(eventName, data) {
    this.clients.forEach(client => {
      this.sendEvent(client.res, null, {
        eventName,
        payload: data,
        timestamp: new Date().toISOString()
      });
    });
  }

  init() {
    // Listen to all events from the bus and broadcast them via SSE
    eventBus.subscribeAll(({ eventName, payload }) => {
      this.broadcast(eventName, payload);
    });
  }
}

module.exports = new SSEManager();
