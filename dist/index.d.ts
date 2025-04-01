import JobConsumer from "./Classes/ScheduleJob/Consumer/JobConsumer.js";
import { ScheduleJob } from "./Classes/Entities/ScheduleJob";
import { ScheduleJobLog } from "./Classes/Entities/ScheduleJobLog";
declare const _default: {
    ScheduleJobManager: {
        runningJob: {
            job: import("./Classes/Entities/ScheduleJob").IScheduleJob;
            task: import("node-cron").ScheduledTask;
            consumer: any;
        }[];
        initWithConnPool(pool: any): Promise<any>;
        initWithMySQLConfig(config: any): Promise<any>;
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
            jobId?: number;
            err?: string;
        } | {
            success: boolean;
            job: ScheduleJob;
        }>;
        updateJob(jobId: number, job: import("./Classes/Entities/ScheduleJob").IScheduleJob): Promise<{
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
        getJobsByStatus(status: string, sorting: import("./Classes/Repositories/ScheduleJobRepository.js").jobSorting): Promise<{
            success: boolean;
            jobs?: ScheduleJob[];
            err?: string;
        }>;
        getRunningJobs(): import("./Classes/Entities/ScheduleJob").IScheduleJob[];
        startJobById(jobId: number): Promise<{
            success: boolean;
            job?: ScheduleJob;
            err?: string;
        } | {
            success: boolean;
            err: string;
        }>;
        stopJobById(jobId: number): boolean;
        jobRegistration(jobId: number, { singular }?: {
            singular?: boolean;
        }): Promise<{
            success: boolean;
            job?: ScheduleJob;
            err?: string;
        } | {
            success: boolean;
            result?: any;
            err?: string;
        } | {
            success: boolean;
            uniqueSingularId: string | undefined;
        }>;
        startJobs(jobs: import("./Classes/Entities/ScheduleJob").IScheduleJob[]): Promise<{
            success: boolean;
            err: string;
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
//# sourceMappingURL=index.d.ts.map