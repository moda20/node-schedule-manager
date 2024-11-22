const Moment = require('moment');
const ScheduleJobLogRepository = require('../../Repositories/ScheduleJobLogRepository.js');
const ScheduleJobRepository = require('../../Repositories/ScheduleJobRepository');
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

  async complete(jobLog, result, error) {
    jobLog.setEndTime(Moment().format('YYYY-MM-DD HH:mm:ss'));
    jobLog.setResult(result);
    jobLog.setError(error);
    let updateResult = await ScheduleJobLogRepository.update(jobLog);
    let oldAverageTime = jobLog.getAverageTime();
    let numberOfRuns = (await ScheduleJobLogRepository.getNumberOfJobRuns(jobLog.getJobId()))?.result?.[0];
    if(!oldAverageTime || oldAverageTime === 0){
      const stats = (await ScheduleJobLogRepository.getLogStats(jobLog.getJobId()))?.result?.[0]
      oldAverageTime = stats.avgTime;
    }
    const newTimeInSeconds = Moment(jobLog.getStartTime()).diff(Moment(jobLog.getEndTime()), "seconds")
    const newAverageTime = oldAverageTime + ((newTimeInSeconds - oldAverageTime) / numberOfRuns);
    const jobUpdateResult = await ScheduleJobRepository.updateJobAverageRunningTime(jobLog.getJobId(), newAverageTime)
    if(!updateResult.success || !jobUpdateResult.success)
      return {
        updateResult,
        jobUpdateResult
      };
    else {
      ScheduleJobEventBus.emit('completed:'+this.job?.getName(), this.job);
      return {success:true};
    }
  }

  serializeLogs(logsData, initialLevel = 2, currentLevel = 0) {
    if(typeof logsData === "string") return logsData;
    const isLogsArray = Array.isArray(logsData);
    const inputLogs = isLogsArray ? logsData?.slice(0, 10) : logsData;
    const serializedObj = isLogsArray ? [] : {};
    for (const key in inputLogs) {
      if (inputLogs.hasOwnProperty(key)) {
        const value = inputLogs[key];

        if (typeof value === 'object' && value !== null) {
          if (currentLevel < initialLevel) {
            serializedObj[key] = this.serializeLogs(value, initialLevel, currentLevel + 1);
          } else {
            serializedObj[key] = `[${typeof value}]`;
          }
        } else {
          serializedObj[key] = value;
        }
      }
    }
    return serializedObj;
  }

  logEvent(data, serializer = null){
    const serializedData = serializer ? serializer(data) : this.serializeLogs(data);
    this.jobLog.logEventBus.emit('jobLog:'+(this.job?.getUniqueSingularId() ?? this.job?.getId()), serializedData)
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
