"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleJobLog = void 0;
class ScheduleJobLog {
    constructor(dataObj) {
        this.id = dataObj.job_log_id;
        this.jobId = dataObj.job_id;
        this.machine = dataObj.machine;
        this.startTime = new Date(dataObj.start_time);
        if (dataObj.end_time) {
            this.endTime = new Date(dataObj.end_time);
        }
        this.result = dataObj.result || null;
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
        this.endTime = new Date(endTime);
    }
    setStartTime(startTime) {
        this.startTime = new Date(startTime);
    }
    setResult(result) {
        this.result = result;
    }
    setError(error) {
        this.error = error;
    }
    setEventLogBus(eventLogBus) {
        // Adjust type based on actual usage
        this.logEventBus = eventLogBus;
    }
    getEventLogBus() {
        // Adjust type based on actual usage
        return this.logEventBus;
    }
}
exports.ScheduleJobLog = ScheduleJobLog;
//# sourceMappingURL=ScheduleJobLog.js.map