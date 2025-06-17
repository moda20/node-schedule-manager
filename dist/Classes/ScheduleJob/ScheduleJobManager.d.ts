import { ScheduledTask } from "node-cron";
import { ScheduleJob } from "../Entities/ScheduleJob";
import { ScheduleJobLog } from "../Entities/ScheduleJobLog";
import { jobSorting } from "../Repositories/ScheduleJobRepository";
import { IScheduleJob } from "../Entities/ScheduleJob";
import JobConsumer from "./Consumer/JobConsumer";
import { PoolOptions } from "mysql2";
declare class ScheduleJobManager {
    runningJob: {
        job: IScheduleJob;
        task: ScheduledTask;
        consumer: JobConsumer;
    }[];
    initWithConnPool(pool: any): Promise<any>;
    initWithMySQLConfig(config: PoolOptions): Promise<any>;
    init(): Promise<{
        success: boolean;
        err?: string;
    }>;
    getJobLog(opt: {
        offset: number;
        limit: number;
        order: string;
    } | undefined, jobId: number): Promise<{
        success: boolean;
        logs?: ScheduleJobLog[];
        err?: string;
    }>;
    deleteJobLog(jobId: number): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    getLogStats(jobIds: number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    getLatestJobRun(jobIds: number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    getLogErrors(jobIds: number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    newJob(name: string, cronSetting: string, param: any, consumer: string, exclusive: boolean, status: string): Promise<{
        success: boolean;
        job: ScheduleJob;
        err?: undefined;
    } | {
        job: undefined;
        success: boolean;
        jobId?: number;
        err?: string;
    } | {
        success: boolean;
        err: string;
        job?: undefined;
    }>;
    updateJob(jobId: number, job: IScheduleJob): Promise<{
        success: boolean;
        err?: string;
    }>;
    deleteJob(jobId: number): Promise<{
        success: boolean;
        err?: string;
    }>;
    softDeleteJob(jobId: number): Promise<{
        success: boolean;
        err?: string;
    }>;
    getJobById(jobId: number): Promise<{
        success: boolean;
        job?: ScheduleJob;
        err?: string;
    }>;
    getJobsByStatus(status: string | string[], sorting?: jobSorting): Promise<{
        success: boolean;
        jobs?: ScheduleJob[];
        err?: string;
    }>;
    getRunningJobs(): IScheduleJob[];
    startJobById(jobId: number): Promise<{
        success: boolean;
        job?: ScheduleJob;
        err?: string;
    } | {
        success: boolean;
        err: {
            err: string;
            stack: string | undefined;
        };
    }>;
    stopJobById(jobId: number): boolean;
    jobRegistration(jobId: number, { singular, extraParams }?: {
        singular?: boolean;
        extraParams?: any;
    }): Promise<{
        success: boolean;
        uniqueSingularId?: string;
        err?: string;
    }>;
    startJobs(jobs: IScheduleJob[]): Promise<{
        success: boolean;
        err: {
            err: string;
            stack: string | undefined;
        };
    } | {
        success: boolean;
        err?: undefined;
    }>;
    isRunningJob(jobId: number): boolean;
}
declare const _default: ScheduleJobManager;
export default _default;
//# sourceMappingURL=ScheduleJobManager.d.ts.map