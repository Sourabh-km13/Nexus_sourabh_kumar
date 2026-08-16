module.exports = (sequelize, DataTypes) => {
  const WorkerAttempt = sequelize.define('WorkerAttempt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    exitCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    signal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    timestamps: false,
    tableName: 'worker_attempts'
  });

  return WorkerAttempt;
};
