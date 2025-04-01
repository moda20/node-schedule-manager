"use strict";
// ScheduleJob.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleJob = void 0;
class ScheduleJob {
    constructor(dataObj) {
        var _a, _b;
        this.createdAt = dataObj.created_at;
        this.id = dataObj.job_id;
        this.name = dataObj.job_name;
        this.cronSetting = dataObj.job_cron_setting;
        this.consumer = dataObj.consumer;
        this.status = dataObj.status;
        this.param = dataObj.job_param;
        this.exclusive = dataObj.exclusive;
        this.averageTime = (_a = dataObj.average_time) !== null && _a !== void 0 ? _a : 0;
        this.latestRun = (_b = dataObj.latest_run) !== null && _b !== void 0 ? _b : null;
    }
    getId() {
        return this.id ? Number(this.id) : undefined;
    }
    getName() {
        return this.name;
    }
    getParam() {
        return this.param;
    }
    getCronSetting() {
        return this.cronSetting;
    }
    getConsumer() {
        return this.consumer;
    }
    getExclusive() {
        return this.exclusive;
    }
    getStats() {
        return this.status;
    }
    getAverageTime() {
        return this.averageTime;
    }
    setAverageTime(averageTime) {
        this.averageTime = averageTime;
    }
    setId(id) {
        this.id = id;
    }
    setName(name) {
        this.name = name;
    }
    setParam(param) {
        this.param = param;
    }
    setCronSetting(cronSetting) {
        this.cronSetting = cronSetting;
    }
    setConsumer(consumer) {
        this.consumer = consumer;
    }
    setExclusive(exclusive) {
        this.exclusive = exclusive;
    }
    setStatus(status) {
        this.status = status;
    }
    setUniqueSingularId(id) {
        this.uniqueSingularId = id;
    }
    getUniqueSingularId() {
        return this.uniqueSingularId;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }
    getLatestRun() {
        return this.latestRun;
    }
    setLatestRun(latestRun) {
        this.latestRun = latestRun;
    }
}
exports.ScheduleJob = ScheduleJob;
exports.default = ScheduleJob;
//# sourceMappingURL=ScheduleJob.js.map