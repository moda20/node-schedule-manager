import { ScheduledTask, schedule } from "node-cron";
import { address } from "ip";
import { path } from "app-root-path";

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

class ScheduleJobManager {
  runningJob: {
    job: IScheduleJob;
    task: ScheduledTask;
    consumer: any;
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
      return result;
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  async updateJob(jobId: number, job: IScheduleJob) {
    return await ScheduleJobRepository.updateJob(jobId, job);
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
  ) {
    let getJobResult = await ScheduleJobRepository.getJobById(jobId);
    if (!getJobResult.success) return getJobResult;
    let job = getJobResult.job!;

    try {
      let machine = address();
      let jobLogId = job.getId()!;
      let log = new ScheduleJobLog({
        job_id: jobLogId,
        machine,
        start_time: new Date().toString(),
        result: "",
        logEventBus: ScheduleJobLogEventBus,
      });
      let newLogResult = await ScheduleJobLogRepository.newLog(log);
      if (!newLogResult.success) return newLogResult;

      ScheduleJobEventBus.emit(`scheduleJob:${job.getName()}`, job, log);
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
        return { success: false, err: (err as Error).toString() };
      }
    }
    return { success: true };
  }

  isRunningJob(jobId: number): boolean {
    return this.runningJob.some((jobEntry) => jobEntry.job.getId() === jobId);
  }
}

export default new ScheduleJobManager();
