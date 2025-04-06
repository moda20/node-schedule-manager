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
exports.ScheduleJobRepository = void 0;
// ScheduleJobRepository.ts
const MySQL_1 = __importDefault(require("../Util/MySQL"));
const ScheduleJob_1 = require("../Entities/ScheduleJob");
class ScheduleJobRepository {
    static newJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "INSERT INTO schedule_job (job_name, job_param, job_cron_setting, consumer, exclusive, status, average_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                let sqlData = [
                    job.name,
                    JSON.stringify(job.param),
                    job.cronSetting,
                    job.consumer,
                    job.exclusive,
                    job.status,
                    job.averageTime,
                    job.createdAt,
                ];
                const result = yield MySQL_1.default.query(sql, sqlData);
                return { success: true, jobId: result.insertId };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getJobById(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "SELECT * FROM schedule_job WHERE job_id = ?";
                let sqlData = [jobId];
                const result = yield MySQL_1.default.query(sql, sqlData);
                if (result.length === 0)
                    return { success: false, err: "Job not found" };
                const job = new ScheduleJob_1.ScheduleJob(result[0]);
                return { success: true, job };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static updateJob(jobId, updatedFields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "UPDATE schedule_job SET ";
                let sqlData = [];
                const setClauses = [];
                for (const [key, value] of Object.entries(updatedFields)) {
                    if (value !== undefined) {
                        setClauses.push(`${key} = ?`);
                        sqlData.push(value);
                    }
                }
                sql += setClauses.join(", ");
                sql += " WHERE job_id = ?";
                sqlData.push(jobId);
                yield MySQL_1.default.query(sql, sqlData);
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static deleteJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "DELETE FROM schedule_job WHERE job_id = ?";
                let sqlData = [jobId];
                yield MySQL_1.default.query(sql, sqlData);
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static getJobsByStatus(status, sorting) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let whereClause = Array.isArray(status)
                    ? `WHERE sj.status IN (?)`
                    : ` WHERE sj.status = ?`;
                let sortClause = "";
                if (sorting) {
                    const orderQuery = Array.isArray(sorting)
                        ? sorting
                            .map((e) => `sj.${e.by} ${e.desc ? "DESC" : "ASC"}`)
                            .join(", ")
                        : `${sorting.by} ${sorting.desc ? "DESC" : "ASC"}`;
                    sortClause = `ORDER BY ${orderQuery}`;
                }
                let sql = `
        SELECT sj.*, sjl.*
        FROM schedule_job sj
               LEFT JOIN (SELECT sjl1.job_id     as \`last_run.job_id\`,
                                 sjl1.job_log_id as \`last_run.job_log_id\`,
                                 sjl1.machine    as \`last_run.machine\`,
                                 sjl1.start_time as \`last_run.start_time\`,
                                 sjl1.end_time   as \`last_run.end_time\`,
                                 sjl1.result     as \`last_run.result\`,
                                 sjl1.error      as \`last_run.error\`
                          FROM schedule_job_log sjl1
                                 JOIN (SELECT job_id, MAX(start_time) AS latest_end_time
                                       FROM schedule_job_log
                                       GROUP BY job_id) sjl2
                                      ON sjl1.job_id = sjl2.job_id AND sjl1.start_time = sjl2.latest_end_time) sjl
                         ON sj.job_id = sjl.\`last_run.job_id\`
        ${whereClause}
        ${sortClause}
        ;
      `;
                let sqlData = [status];
                const result = yield MySQL_1.default.query(sql, sqlData);
                let jobs = [];
                for (let i = 0; i < result.length; i++) {
                    result[i].exclusive = result[i].exclusive === "true";
                    result[i].job_param = JSON.parse(result[i].job_param);
                    const latestRun = Object.fromEntries(Object.keys(result[i])
                        .filter((e) => e.split(".").length > 1)
                        .map((e) => [e.split(".")[1], result[i][e]]));
                    jobs.push(new ScheduleJob_1.ScheduleJob(Object.assign(Object.assign({}, result[i]), { latest_run: latestRun })));
                }
                return { success: true, jobs };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static updateJobAverageRunningTime(jobId, newAverageTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = "UPDATE schedule_job SET average_time = ? WHERE job_id = ?";
                let sqlData = [newAverageTime, jobId];
                let result = yield MySQL_1.default.query(sql, sqlData);
                if (result.affectedRows + "" !== "1") {
                    return {
                        success: false,
                        err: "update job average running time failed",
                    };
                }
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    static softDeleteJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sql = 'UPDATE schedule_job SET status = "DELETED" WHERE job_id = ?';
                let sqlData = [jobId];
                let result = yield MySQL_1.default.query(sql, sqlData);
                if (result.affectedRows + "" !== "1") {
                    return { success: false, err: "soft delete job failed" };
                }
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
}
exports.ScheduleJobRepository = ScheduleJobRepository;
//# sourceMappingURL=ScheduleJobRepository.js.map