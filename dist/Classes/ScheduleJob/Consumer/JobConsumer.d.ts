import { IScheduleJobLog } from "../../Entities/ScheduleJobLog";
import { IScheduleJob } from "../../Entities/ScheduleJob";
declare class JobConsumer {
    job?: IScheduleJob;
    jobLog?: IScheduleJobLog;
    on(jobName: string): void;
    off(jobName: string): void;
    complete(jobLog: IScheduleJobLog, result: any, error?: string): Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
    } | {
        success: boolean;
        err?: string;
    }>;
    error(error: Error): void;
    serializeLogs(logsData: any, initialLevel?: number, currentLevel?: number): any;
    preRun(job: IScheduleJob, jobLog: IScheduleJobLog): Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
    } | {
        success: boolean;
        err?: string;
    }>;
    run(job: IScheduleJob, jobLog: IScheduleJobLog): Promise<void>;
}
export default JobConsumer;
//# sourceMappingURL=JobConsumer.d.ts.map