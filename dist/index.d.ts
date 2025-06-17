import ScheduleJobManager from "./Classes/ScheduleJob/ScheduleJobManager.js";
import JobConsumer from "./Classes/ScheduleJob/Consumer/JobConsumer.js";
import ScheduleJobEventBus from "./Classes/ScheduleJob/ScheduleJobEventBus";
import ScheduleJobLogEventBus from "./Classes/ScheduleJob/ScheduleJobLogEventBus";
import { ScheduleJob, IScheduleJob } from "./Classes/Entities/ScheduleJob";
import { ScheduleJobLog, IScheduleJobLog } from "./Classes/Entities/ScheduleJobLog";
declare const _default: {
    ScheduleJobManager: {
        runningJob: {
            job: IScheduleJob;
            task: import("node-cron").ScheduledTask;
            consumer: JobConsumer;
        }[];
        initWithConnPool(pool: any): Promise<any>;
        initWithMySQLConfig(config: import("mysql2").PoolOptions): Promise<any>;
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
        getJobsByStatus(status: string | string[], sorting?: import("./Classes/Repositories/ScheduleJobRepository.js").jobSorting): Promise<{
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
    };
    ScheduleJobLogEventBus: import("events")<[never]>;
    JobConsumer: typeof JobConsumer;
    ScheduleJobEventBus: import("events")<[never]>;
    Entities: {
        ScheduleJob: typeof ScheduleJob;
        ScheduleJobLog: typeof ScheduleJobLog;
    };
};
export default _default;
export { ScheduleJobManager, ScheduleJobLogEventBus, JobConsumer, ScheduleJobEventBus, };
export declare const Entities: {
    ScheduleJob: typeof ScheduleJob;
    ScheduleJobLog: typeof ScheduleJobLog;
};
export type { IScheduleJob, IScheduleJobLog };
//# sourceMappingURL=index.d.ts.map