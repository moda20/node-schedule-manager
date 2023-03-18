class ScheduleJobLog {
  constructor(dataObj) {
    this.id = dataObj.job_log_id;
    this.jobId = dataObj.job_id;
    this.machine = dataObj.machine;
    this.startTime = dataObj.start_time;
    this.endTime = dataObj.end_time;
    this.result = dataObj.result;
    this.logEventBus = dataObj.logEventBus;
    this.error = dataObj.error;
  }

  getId() {
    return this.id;
  }

  getJobId() {
    return this.jobId;
  }

  getMachine() {
    return this.machine;
  }

  getStartTime() {
    return this.startTime;
  }

  getEndTime() {
    return this.endTime;
  }

  getResult() {
    return this.result;
  }

  getError() {
    return this.error;
  }

  setEndTime(endTime) {
    this.endTime = endTime;
  }

  setResult(result) {
    this.result = result;
  }

  setError(error) {
    this.error = error;
  }

  setEventLogBus(eventLogBus){
    this.logEventBus = eventLogBus;
  }

  getEventLogBus(){
    return this.logEventBus;
  }
}

module.exports = ScheduleJobLog;
