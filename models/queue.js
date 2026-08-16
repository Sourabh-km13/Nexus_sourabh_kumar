module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define('Queue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    queue_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'failed'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true,
    tableName: 'message_queue'
  });

  return Queue;
};
