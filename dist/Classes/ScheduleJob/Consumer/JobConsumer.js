"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const ScheduleJobLogRepository_1 = require("../../Repositories/ScheduleJobLogRepository");
const ScheduleJobRepository_1 = require("../../Repositories/ScheduleJobRepository");
const ScheduleJobEventBus_1 = __importDefault(require("../ScheduleJobEventBus"));
class JobConsumer {
    on(jobName) {
        ScheduleJobEventBus_1.default.on("scheduleJob:" + jobName, (...args) => this.preRun(...args));
    }
    off(jobName) {
        ScheduleJobEventBus_1.default.off("scheduleJob:" + jobName, (...args) => this.preRun(...args));
    }
    complete(jobLog, result, error) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            jobLog.setEndTime((0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss"));
            jobLog.setResult(result);
            jobLog.setError(error);
            const updateResult = yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.update(jobLog);
            let oldAverageTime = ((_a = this.job) === null || _a === void 0 ? void 0 : _a.getAverageTime()) || 0;
            const numberOfRuns = (_d = (_c = (_b = (yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getNumberOfJobRuns(jobLog.getJobId()))) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.total;
            if (!oldAverageTime) {
                const stats = (_f = (_e = (yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getLogStats(jobLog.getJobId()))) === null || _e === void 0 ? void 0 : _e.result) === null || _f === void 0 ? void 0 : _f[0];
                oldAverageTime = stats.avgTime;
            }
            const newTimeInSeconds = (0, moment_1.default)(jobLog.getEndTime()).diff((0, moment_1.default)(jobLog.getStartTime()), "seconds");
            const newAverageTime = oldAverageTime + (newTimeInSeconds - oldAverageTime) / numberOfRuns;
            const jobUpdateResult = yield ScheduleJobRepository_1.ScheduleJobRepository.updateJobAverageRunningTime(jobLog.getJobId(), newAverageTime);
            if (!updateResult.success || !jobUpdateResult.success) {
                return { updateResult, jobUpdateResult };
            }
            else {
                ScheduleJobEventBus_1.default.emit("completed:" + ((_g = this.job) === null || _g === void 0 ? void 0 : _g.getName()), this.job);
                return { success: true };
            }
        });
    }
    error(error) {
        var _a, _b, _c, _d;
        (_a = this.jobLog) === null || _a === void 0 ? void 0 : _a.logEventBus.emit("error:" + ((_c = (_b = this.job) === null || _b === void 0 ? void 0 : _b.getUniqueSingularId()) !== null && _c !== void 0 ? _c : (_d = this.job) === null || _d === void 0 ? void 0 : _d.getId()), error);
    }
    serializeLogs(logsData, initialLevel = 2, currentLevel = 0) {
        if (typeof logsData === "string")
            return logsData;
        const isLogsArray = Array.isArray(logsData);
        const inputLogs = isLogsArray ? logsData.slice(0, 10) : logsData;
        const serializedObj = isLogsArray ? [] : {};
        for (const key in inputLogs) {
            if (inputLogs.hasOwnProperty(key)) {
                const value = inputLogs[key];
                if (currentLevel < initialLevel) {
                    serializedObj[key] = this.serializeLogs(value, initialLevel, currentLevel + 1);
                }
                else {
                    serializedObj[key] = value;
                }
            }
        }
        return serializedObj;
    }
    logEvent(data, serializer) {
        var _a, _b, _c, _d;
        const serializedData = serializer
            ? serializer(data)
            : this.serializeLogs(data);
        if ((_a = this.jobLog) === null || _a === void 0 ? void 0 : _a.logEventBus) {
            this.jobLog.logEventBus.emit("jobLog:" + ((_c = (_b = this.job) === null || _b === void 0 ? void 0 : _b.getUniqueSingularId()) !== null && _c !== void 0 ? _c : (_d = this.job) === null || _d === void 0 ? void 0 : _d.getId()), serializedData);
        }
    }
    preRun(job, jobLog) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.run(job, jobLog);
            }
            catch (err) {
                return yield this.complete(jobLog, null, err.toString());
            }
        });
    }
    run(job, jobLog) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.complete(jobLog, "");
        });
    }
}
exports.default = JobConsumer;
//# sourceMappingURL=JobConsumer.js.map