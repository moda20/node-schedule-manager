const Moment = require('moment');
const ScheduleJobLogRepository = require('../../Repositories/ScheduleJobLogRepository.js');
const ScheduleJobEventBus = require('../ScheduleJobEventBus.js');

class JobConsumer {
  job;
  constructor() {
  }

  on(jobName) {
    ScheduleJobEventBus.on('scheduleJob:' + jobName, (...args) => this.preRun(...args));
  }

  off(jobName) {
    ScheduleJobEventBus.off('scheduleJob:' + jobName, (...args) => this.preRun(...args));
  }

  async complete(jobLog, result) {
    jobLog.setEndTime(Moment().format('YYYY-MM-DD HH:mm:ss'));
    jobLog.setResult(result);
    let updateResult = await ScheduleJobLogRepository.update(jobLog);
    if(!updateResult.success)
      return updateResult;
    else {
      ScheduleJobEventBus.emit('completed:'+this.job?.getName(), this.job);
      return {success:true};
    }
  }

  logEvent(data){
    this.jobLog.logEventBus.emit('jobLog:'+this.job?.getUniqueSingularId(), data)
  }

  preRun(job, jobLog){
    this.job = job;
    this.jobLog = jobLog;
    this.run(job, jobLog);
  }

  async run(job, jobLog) {
    this.complete(jobLog, '');
  }
}

module.exports = JobConsumer;
