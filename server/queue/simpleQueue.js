const { Queue } = require('../../models');
const db = require('../../models');

class SimpleQueue {
  /**
   * Enqueue a message into the database
   * @param {string} queueName - Name of the queue
   * @param {object} payload - Message data
   */
  async enqueue(queueName, payload) {
    try {
      const message = await db.Queue.create({
        queue_name: queueName,
        payload: JSON.stringify(payload),
        status: 'pending'
      });
      return message;
    } catch (error) {
      console.error('❌ Queue Enqueue Error:', error);
      throw error;
    }
  }

  /**
   * Dequeue the next available message for a specific queue
   * @param {string} queueName - Name of the queue
   */
  async dequeue(queueName) {
    try {
      const message = await db.Queue.findOne({
        where: {
          queue_name: queueName,
          status: 'pending'
        },
        order: [['createdAt', 'ASC']],
        lock: true // Use for concurrency if supported by DB
      });

      if (message) {
        await message.update({ status: 'processing' });
        return {
          id: message.id,
          payload: JSON.parse(message.payload)
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Queue Dequeue Error:', error);
      throw error;
    }
  }

  /**
   * Mark a message as completed
   * @param {number} messageId - The ID of the message
   */
  async complete(messageId) {
    try {
      await db.Queue.destroy({
        where: { id: messageId }
      });
    } catch (error) {
      console.error('❌ Queue Complete Error:', error);
      throw error;
    }
  }

  /**
   * Fail a message and mark it for retry
   * @param {number} messageId - The ID of the message
   */
  async fail(messageId) {
    try {
      await db.Queue.update(
        { status: 'pending' },
        { where: { id: messageId } }
      );
    } catch (error) {
      console.error('❌ Queue Fail Error:', error);
      throw error;
    }
  }
}

module.exports = new SimpleQueue();
