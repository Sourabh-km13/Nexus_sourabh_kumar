const eventBus = require('../events/event-bus');
const db = require('../../models');

class EventService {
  async logEvent(type, subjectType, subjectId, message, metadata = {}) {
    try {
      const event = await db.Event.create({
        type,
        subjectType,
        subjectId,
        message,
        metadata
      });
      
      // Publish to the in-memory bus for live SSE updates
      eventBus.publish(type, {
        eventId: event.id,
        type,
        subjectType,
        subjectId,
        message,
        timestamp: event.createdAt
      });

      return event;
    } catch (error) {
      console.error('❌ EventService Error:', error);
    }
  }
}

module.exports = new EventService();
