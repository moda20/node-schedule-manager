import { ScheduledTask, schedule } from "node-cron";
import IP, { address } from "ip";
import AppRoot, { path } from "app-root-path";

import MySQL from "../Util/MySQL";
import { ScheduleJob } from "../Entities/ScheduleJob";
import { ScheduleJobLog } from "../Entities/ScheduleJobLog";
import {
  jobSorting,
  ScheduleJobRepository,
} from "../Repositories/ScheduleJobRepository";
import { ScheduleJobLogRepository } from "../Repositories/ScheduleJobLogRepository";
import ScheduleJobEventBus from "./ScheduleJobEventBus";
import ScheduleJobLogEventBus from "./ScheduleJobLogEventBus";
import InitSQL from "../../init_sql";

import { IScheduleJob } from "../Entities/ScheduleJob";
import Moment from "moment/moment";
import JobConsumer from "./Consumer/JobConsumer";

class ScheduleJobManager {
  runningJob: {
    job: IScheduleJob;
    task: ScheduledTask;
    consumer: JobConsumer;
  }[] = [];

  async initWithConnPool(pool: any): Promise<any> {
    MySQL.setPool(pool);
    return await this.init();
  }

  async initWithMySQLConfig(config: any): Promise<any> {
    MySQL.createPool(config);
    return await this.init();
  }

  async init(): Promise<{ success: boolean; err?: string }> {
    let result = await MySQL.testConnection();
    if (!result.success) return result;

    try {
      await MySQL.query(InitSQL.createScheduleJobTable, []);
      await MySQL.query(InitSQL.createScheduleJobLogTable, []);
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  async getJobLog(
    opt = { offset: 0, limit: 10, order: "DESC" },
    jobId: number,
  ) {
    return await ScheduleJobLogRepository.getLog(jobId, opt.offset, opt.limit);
  }

  async deleteJobLog(jobId: number) {
    return await ScheduleJobLogRepository.deleteLog(jobId);
  }

  async getLogStats(jobIds: number[]) {
    return await ScheduleJobLogRepository.getLogStats(jobIds);
  }

  async getLatestJobRun(jobIds: number[]) {
    return await ScheduleJobLogRepository.getLatestJobRun(jobIds);
  }

  async getLogErrors(jobIds: number[]) {
    return await ScheduleJobLogRepository.getLatestJobError(jobIds);
  }

  async newJob(
    name: string,
    cronSetting: string,
    param: any,
    consumer: string,
    exclusive: boolean,
    status: string,
  ) {
    try {
      let job = new ScheduleJob({
        job_name: name,
        job_param: param,
        job_cron_setting: cronSetting,
        consumer,
        exclusive,
        status,
      });

      let result = await ScheduleJobRepository.newJob(job);
      if (result.success) {
        job.setId(result.jobId);
        return { success: true, job };
      }
      return {
        ...result,
        job: undefined,
      };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  async updateJob(jobId: number, job: IScheduleJob) {
    return await ScheduleJobRepository.updateJob(
      jobId,
      job.getJobUpdateObject(),
    );
  }

  async deleteJob(jobId: number) {
    return await ScheduleJobRepository.deleteJob(jobId);
  }

  async softDeleteJob(jobId: number) {
    return await ScheduleJobRepository.softDeleteJob(jobId);
  }

  async getJobById(jobId: number) {
    return await ScheduleJobRepository.getJobById(jobId);
  }

  async getJobsByStatus(status: string | string[], sorting?: jobSorting) {
    return await ScheduleJobRepository.getJobsByStatus(status, sorting);
  }

  getRunningJobs(): IScheduleJob[] {
    return this.runningJob.map((jobEntry) => jobEntry.job);
  }

  async startJobById(jobId: number) {
    if (this.isRunningJob(jobId)) return { success: true };
    let getJobResult = await this.getJobById(jobId);
    if (!getJobResult.success) return getJobResult;
    return await this.startJobs([getJobResult.job!]);
  }

  stopJobById(jobId: number): boolean {
    const index = this.runningJob.findIndex(
      (jobEntry) => jobEntry.job.getId() === jobId,
    );
    if (index !== -1) {
      this.runningJob[index].task.stop();
      this.runningJob[index].consumer.off(this.runningJob[index].job.getName());
      this.runningJob.splice(index, 1);
      return true;
    }
    return false;
  }

  async jobRegistration(
    jobId: number,
    { singular }: { singular?: boolean } = {},
  ): Promise<{ success: boolean; uniqueSingularId?: string; err?: string }> {
    let getJobResult = await ScheduleJobRepository.getJobById(jobId);
    if (!getJobResult.success) return getJobResult;
    let job = getJobResult.job!;

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
      let machine = address();
      let jobLogId = job.getId()?.toString()!;
      let cronSettingArr = job.getCronSetting().split(" ");

      //joblogid is a primary key in database;
      if (
        cronSettingArr.length >= 6 ||
        cronSettingArr.every((item) => item === "*")
      ) {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMMDDHHmmss");
      } else if (cronSettingArr[0] !== "*") {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMMDDHHmm");
      } else if (cronSettingArr[1] !== "*") {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMMDDHH");
      } else if (cronSettingArr[2] !== "*") {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMMDD");
      } else if (cronSettingArr[3] !== "*") {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMM");
      } else if (cronSettingArr[4] !== "*") {
        jobLogId = jobLogId + "-" + Moment().format("YYYYMMDDE");
      }
      if (singular) {
        jobLogId = jobLogId + "-singular-" + Math.floor(Math.random() * 100000);
      }

      //if not exclusive job, add ip address as part of joblogid to prevent duplicate key;
      if (!job.getExclusive()!) {
        jobLogId = jobLogId + "-" + machine;
      }

      let log = new ScheduleJobLog({
        job_log_id: jobLogId,
        job_id: job.getId()!,
        machine,
        start_time: new Date().toString(),
        result: "",
        logEventBus: ScheduleJobLogEventBus,
      });
      let newLogResult = await ScheduleJobLogRepository.newLog(log);
      if (!newLogResult.success) return newLogResult;
      let targetSingularLogId = `${job.getName()}_${jobLogId}`;
      if (singular) {
        let consumer = (await import(`${path + job.getConsumer()}`)).default;
        consumer.on(targetSingularLogId);
        job.setUniqueSingularId(jobLogId);
        ScheduleJobEventBus.emit(
          `scheduleJob:${targetSingularLogId}`,
          job,
          log,
        );
      } else {
        ScheduleJobEventBus.emit(`scheduleJob:${job.getName()}`, job, log);
      }

      if (singular) {
        ScheduleJobEventBus.once(
          `completed:${targetSingularLogId}`,
          async () => {
            let consumer = (await import(`${path + job.getConsumer()}`))
              .default;
            consumer.off(targetSingularLogId);
          },
        );
      }

      return { success: true, uniqueSingularId: job.getUniqueSingularId() };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  async startJobs(jobs: IScheduleJob[]) {
    for (const job of jobs) {
      try {
        if (!job.getId()) continue;
        let consumer = (await import(`${path + job.getConsumer()}`)).default;
        consumer.on(job.getName());
        let task = schedule(job.getCronSetting(), async () =>
          this.jobRegistration(job.getId()!),
        );
        this.runningJob.push({ job, task, consumer });
      } catch (err) {
        return {
          success: false,
          err: {
            err: (err as Error).toString(),
            stack: (err as Error)?.stack,
          },
        };
      }
    }
    return { success: true };
  }

  isRunningJob(jobId: number): boolean {
    return this.runningJob.some((jobEntry) => jobEntry.job.getId() === jobId);
  }
}

export default new ScheduleJobManager();
