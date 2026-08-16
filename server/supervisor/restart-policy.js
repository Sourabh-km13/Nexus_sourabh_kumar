class RestartPolicy {
  constructor() {
    this.maxAttempts = 3;
    this.backoffSchedule = [1000, 2000, 4000]; // milliseconds
    this.settlingPeriod = 30000; // 30 seconds of health resets counter
  }

  getBackoff(attempt) {
    if (attempt <= 0) return 0;
    return this.backoffSchedule[Math.min(attempt - 1, this.backoffSchedule.length - 1)];
  }

  shouldAllowRestart(currentAttempts) {
    return currentAttempts < this.maxAttempts;
  }
}

module.exports = new RestartPolicy();
