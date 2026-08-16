module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    queueName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: 'v1',
    },
    status: {
      type: DataTypes.ENUM('STARTING', 'RUNNING', 'DEGRADED', 'RESTARTING', 'OUT_OF_SERVICE', 'STOPPED'),
      defaultValue: 'STOPPED',
    },
    pid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    restartCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastHeartbeat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastJobAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    timestamps: true,
    tableName: 'workers'
  });

  return Worker;
};
