"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const node_cron_1 = require("node-cron");
const ip_1 = require("ip");
const app_root_path_1 = __importStar(require("app-root-path"));
const MySQL_1 = __importDefault(require("../Util/MySQL"));
const ScheduleJob_1 = require("../Entities/ScheduleJob");
const ScheduleJobLog_1 = require("../Entities/ScheduleJobLog");
const ScheduleJobRepository_1 = require("../Repositories/ScheduleJobRepository");
const ScheduleJobLogRepository_1 = require("../Repositories/ScheduleJobLogRepository");
const ScheduleJobEventBus_1 = __importDefault(require("./ScheduleJobEventBus"));
const ScheduleJobLogEventBus_1 = __importDefault(require("./ScheduleJobLogEventBus"));
const init_sql_1 = __importDefault(require("../../init_sql"));
const moment_1 = __importDefault(require("moment/moment"));
class ScheduleJobManager {
    constructor() {
        this.runningJob = [];
    }
    initWithConnPool(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            MySQL_1.default.setPool(pool);
            return yield this.init();
        });
    }
    initWithMySQLConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            MySQL_1.default.createPool(config);
            return yield this.init();
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield MySQL_1.default.testConnection();
            if (!result.success)
                return result;
            try {
                yield MySQL_1.default.query(init_sql_1.default.createScheduleJobTable, []);
                yield MySQL_1.default.query(init_sql_1.default.createScheduleJobLogTable, []);
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    getJobLog() {
        return __awaiter(this, arguments, void 0, function* (opt = { offset: 0, limit: 10, order: "DESC" }, jobId) {
            return yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getLog(jobId, opt.offset, opt.limit);
        });
    }
    deleteJobLog(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.deleteLog(jobId);
        });
    }
    getLogStats(jobIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getLogStats(jobIds);
        });
    }
    getLatestJobRun(jobIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getLatestJobRun(jobIds);
        });
    }
    getLogErrors(jobIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.getLatestJobError(jobIds);
        });
    }
    newJob(name, cronSetting, param, consumer, exclusive, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let job = new ScheduleJob_1.ScheduleJob({
                    job_name: name,
                    job_param: param,
                    job_cron_setting: cronSetting,
                    consumer,
                    exclusive,
                    status,
                });
                let result = yield ScheduleJobRepository_1.ScheduleJobRepository.newJob(job);
                if (result.success) {
                    job.setId(result.jobId);
                    return { success: true, job };
                }
                return Object.assign(Object.assign({}, result), { job: undefined });
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    updateJob(jobId, job) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobRepository_1.ScheduleJobRepository.updateJob(jobId, job.getJobUpdateObject());
        });
    }
    deleteJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobRepository_1.ScheduleJobRepository.deleteJob(jobId);
        });
    }
    softDeleteJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobRepository_1.ScheduleJobRepository.softDeleteJob(jobId);
        });
    }
    getJobById(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobRepository_1.ScheduleJobRepository.getJobById(jobId);
        });
    }
    getJobsByStatus(status, sorting) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ScheduleJobRepository_1.ScheduleJobRepository.getJobsByStatus(status, sorting);
        });
    }
    getRunningJobs() {
        return this.runningJob.map((jobEntry) => jobEntry.job);
    }
    startJobById(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunningJob(jobId))
                return { success: true };
            let getJobResult = yield this.getJobById(jobId);
            if (!getJobResult.success)
                return getJobResult;
            return yield this.startJobs([getJobResult.job]);
        });
    }
    stopJobById(jobId) {
        const index = this.runningJob.findIndex((jobEntry) => jobEntry.job.getId() === jobId);
        if (index !== -1) {
            this.runningJob[index].task.stop();
            this.runningJob[index].consumer.off(this.runningJob[index].job.getName());
            this.runningJob.splice(index, 1);
            return true;
        }
        return false;
    }
    jobRegistration(jobId_1) {
        return __awaiter(this, arguments, void 0, function* (jobId, { singular } = {}) {
            var _a;
            let getJobResult = yield ScheduleJobRepository_1.ScheduleJobRepository.getJobById(jobId);
            if (!getJobResult.success)
                return getJobResult;
            let job = getJobResult.job;
            /*  async jobRegistration(jobId, {singular} = {}){
              //reload the job entity in case any param update;
              let getJobResult = await ScheduleJobRepository.getJobById(jobId);
        
              if(!getJobResult.success) {
                return getJobResult;
              }
        
              let job = getJobResult.job;
        
              try {
                let machine = IP.address();
                let jobLogId = job.getId();
                let cronSettingArr = job.getCronSetting().split(' ');
        
                //joblogid is a primary key in database;
                if(cronSettingArr.length >= 6) {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHHmmss');
                }else if(cronSettingArr[0] !== '*') {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHHmm');
                }else if(cronSettingArr[1] !== '*') {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHH');
                }else if(cronSettingArr[2] !== '*') {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMMDD');
                }else if(cronSettingArr[3] !== '*') {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMM');
                }else if(cronSettingArr[4] !== '*') {
                  jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDE');
                }
                if(singular){
                  jobLogId = jobLogId + '-singular-' + Math.floor(Math.random() * 100000)
                }
        
        
                //if not exclusive job, add ip address as part of joblogid to prevent duplicate key;
                if(!job.getExclusive()) {
                  jobLogId = jobLogId + '-' + machine;
                }
        
                let log = new ScheduleJobLog({
                  job_log_id: jobLogId,
                  job_id: job.getId(),
                  machine: machine,
                  start_time: Moment().format('YYYY-MM-DD HH:mm:ss'),
                  end_time: null,
                  result: '',
                  logEventBus: ScheduleJobLogEventBus
                });
        
                let newLogResult = await ScheduleJobLogRepository.newLog(log);
                if(!newLogResult.success)
                  return newLogResult;
        
                if(singular){
                  if(!this.isRunningJob(job.getId())){
                    let consumer = require(AppRoot + job.getConsumer());
                    consumer.on(job.getName());
                  }
                  job.setUniqueSingularId(jobLogId);
                }
        
                //emit job event;
                ScheduleJobEventBus.emit('scheduleJob:' + job.getName(), job, log);
        
                if(singular){
                  ScheduleJobEventBus.on('completed:'+job.getName(), ()=>{
                    if(!this.isRunningJob(job.getId())){
                      let consumer = require(AppRoot + job.getConsumer());
                      consumer.off(job.getName());
                    }
                    ScheduleJobEventBus.off('completed:'+job.getName());
                  })
                }
                return {success:true, uniqueSingularId: job.getUniqueSingularId()};
        
              }catch(err) {
                return {success: false, err:err.toString()};
              }
            }*/
            try {
                let machine = (0, ip_1.address)();
                let jobLogId = (_a = job.getId()) === null || _a === void 0 ? void 0 : _a.toString();
                let cronSettingArr = job.getCronSetting().split(" ");
                //joblogid is a primary key in database;
                if (cronSettingArr.length >= 6) {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMMDDHHmmss");
                }
                else if (cronSettingArr[0] !== "*") {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMMDDHHmm");
                }
                else if (cronSettingArr[1] !== "*") {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMMDDHH");
                }
                else if (cronSettingArr[2] !== "*") {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMMDD");
                }
                else if (cronSettingArr[3] !== "*") {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMM");
                }
                else if (cronSettingArr[4] !== "*") {
                    jobLogId = jobLogId + "-" + (0, moment_1.default)().format("YYYYMMDDE");
                }
                if (singular) {
                    jobLogId = jobLogId + "-singular-" + Math.floor(Math.random() * 100000);
                }
                //if not exclusive job, add ip address as part of joblogid to prevent duplicate key;
                if (!job.getExclusive()) {
                    jobLogId = jobLogId + "-" + machine;
                }
                let log = new ScheduleJobLog_1.ScheduleJobLog({
                    job_log_id: jobLogId,
                    job_id: job.getId(),
                    machine,
                    start_time: new Date().toString(),
                    result: "",
                    logEventBus: ScheduleJobLogEventBus_1.default,
                });
                let newLogResult = yield ScheduleJobLogRepository_1.ScheduleJobLogRepository.newLog(log);
                if (!newLogResult.success)
                    return newLogResult;
                if (singular) {
                    if (!this.isRunningJob(job.getId())) {
                        let consumer = (yield Promise.resolve(`${`${app_root_path_1.path + job.getConsumer()}`}`).then(s => __importStar(require(s)))).default;
                        consumer.on(job.getName());
                    }
                    job.setUniqueSingularId(jobLogId);
                }
                ScheduleJobEventBus_1.default.emit(`scheduleJob:${job.getName()}`, job, log);
                if (singular) {
                    ScheduleJobEventBus_1.default.once("completed:" + job.getName(), () => {
                        if (!this.isRunningJob(job.getId())) {
                            let consumer = require(app_root_path_1.default + job.getConsumer());
                            consumer.off(job.getName());
                        }
                    });
                }
                return { success: true, uniqueSingularId: job.getUniqueSingularId() };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    startJobs(jobs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const job of jobs) {
                try {
                    if (!job.getId())
                        continue;
                    let consumer = (yield Promise.resolve(`${`${app_root_path_1.path + job.getConsumer()}`}`).then(s => __importStar(require(s)))).default;
                    consumer.on(job.getName());
                    let task = (0, node_cron_1.schedule)(job.getCronSetting(), () => __awaiter(this, void 0, void 0, function* () { return this.jobRegistration(job.getId()); }));
                    this.runningJob.push({ job, task, consumer });
                }
                catch (err) {
                    return {
                        success: false,
                        err: {
                            err: err.toString(),
                            stack: err === null || err === void 0 ? void 0 : err.stack,
                        },
                    };
                }
            }
            return { success: true };
        });
    }
    isRunningJob(jobId) {
        return this.runningJob.some((jobEntry) => jobEntry.job.getId() === jobId);
    }
}
exports.default = new ScheduleJobManager();
//# sourceMappingURL=ScheduleJobManager.js.map