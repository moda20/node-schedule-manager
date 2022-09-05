class ScheduleJobLog {
  constructor(dataObj) {
    this.id = dataObj.job_log_id;
    this.jobId = dataObj.job_id;
    this.machine = dataObj.machine;
    this.startTime = dataObj.start_time;
    this.endTime = dataObj.end_time;
    this.result = dataObj.result;
    this.logEventBus = dataObj.logEventBus;
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

  setEndTime(endTime) {
    this.endTime = endTime;
  }

  setResult(result) {
    this.result = result;
  }

  setEventLogBus(eventLogBus){
    this.logEventBus = eventLogBus;
  }

  getEventLogBus(){
    return this.logEventBus;
  }
}

module.exports = ScheduleJobLog;
