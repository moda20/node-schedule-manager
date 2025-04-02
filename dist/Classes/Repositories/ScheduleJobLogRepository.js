"use strict";
// ScheduleJobLogRepository.ts
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
exports.ScheduleJobLogRepository = void 0;
const MySQL_1 = __importDefault(require("../Util/MySQL"));
const ScheduleJobLog_1 = require("../Entities/ScheduleJobLog");
class ScheduleJobLogRepository {
    constructor() { }
    static newLog(log) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sql = "INSERT INTO schedule_job_log (job_log_id, job_id, start_time, end_time, error) VALUES (?, ?, ?, ?, ?)";
                const result = yield MySQL_1.default.query(sql, [
                    log.id,
                    log.jobId,
                    log.startTime,
                    log.endTime,
                    log.error,
                ]);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getLog(jobId, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sql = "SELECT * FROM schedule_job_log WHERE job_id = ?";
                const result = yield MySQL_1.default.query(sql, [jobId]);
                const logs = result.map((row) => new ScheduleJobLog_1.ScheduleJobLog(row));
                return { success: true, logs };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getLatestJobRun(inputJobIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobIds = Array.isArray(inputJobIds) ? inputJobIds : [inputJobIds];
                const sql = `
        SELECT *
        FROM schedule_job_log
        WHERE job_log_id IN (SELECT MAX(job_log_id) as log_id
                             FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
                             GROUP BY job_id)
      `;
                const result = yield MySQL_1.default.query(sql, []);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static deleteLog(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sql = "DELETE FROM schedule_job_log WHERE job_id = ?";
                const result = yield MySQL_1.default.query(sql, [jobId]);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getLogStats(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobIds = Array.isArray(jobId) ? jobId : [jobId];
                const sql = `
        SELECT job_id                     as id,
               AVG(end_time - start_time) as avgTime,
               MAX(start_time)            as latestStart,
               (SELECT end_time as lastEnds
                FROM schedule_job_log as sjl
                WHERE start_time = (SELECT MAX(start_time) from schedule_job_log as sji where sji.job_id = id)
                  AND sjl.job_id = id)    as LatestEnds
        FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
        GROUP BY job_id
      `;
                const result = yield MySQL_1.default.query(sql, []);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getNumberOfJobRuns(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobIds = Array.isArray(jobId) ? jobId : [jobId];
                const sql = `
        SELECT job_id                     as id,
               SUM(1)                     as total
        FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
        GROUP BY job_id
      `;
                const result = yield MySQL_1.default.query(sql, []);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getLatestJobError(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobIds = Array.isArray(jobId) ? jobId : [jobId];
                const sql = `
        SELECT sjl.job_id, sjl.error
        FROM schedule_job_log as sjl
        WHERE sjl.job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})
          AND sjl.end_time IS NOT NULL
        ORDER BY sjl.end_time DESC
        LIMIT 1
      `;
                const result = yield MySQL_1.default.query(sql, []);
                return { success: true, result };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static update(log) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "UPDATE schedule_job_log SET end_time = ?, result = ?, error = ? WHERE job_log_id = ?";
                let sqlData = [
                    log.getEndTime(),
                    log.getResult(),
                    log.getError(),
                    log.getId(),
                ];
                let result = yield MySQL_1.default.query(sql, sqlData);
                if (result.affectedRows + "" !== "1") {
                    return { success: false, err: "update job log failed" };
                }
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
}
exports.ScheduleJobLogRepository = ScheduleJobLogRepository;
//# sourceMappingURL=ScheduleJobLogRepository.js.map