import { IScheduleJobLog } from "../../Entities/ScheduleJobLog";
import { IScheduleJob } from "../../Entities/ScheduleJob";
declare class JobConsumer {
    job?: IScheduleJob;
    jobLog?: IScheduleJobLog;
    runHandler: (...args: [IScheduleJob, IScheduleJobLog]) => Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
        success: boolean;
    } | {
        success: boolean;
        err?: string;
        newTimeInSeconds?: number;
        newAverageTime?: number;
    }> | undefined;
    on(jobName: string): void;
    off(jobName: string): void;
    complete(jobLog: IScheduleJobLog, result: any, error?: string): Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
        success: boolean;
    } | {
        success: boolean;
        err?: string;
        newTimeInSeconds?: number;
        newAverageTime?: number;
    }>;
    error(error: any): void;
    serializeLogs(logsData: any, initialLevel?: number, currentLevel?: number): any;
    logEvent(data: any, serializer?: (data: any) => any): void;
    preRun(job: IScheduleJob, jobLog: IScheduleJobLog): Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
        success: boolean;
    } | {
        success: boolean;
        err?: string;
        newTimeInSeconds?: number;
        newAverageTime?: number;
    }>;
    run(job: IScheduleJob, jobLog: IScheduleJobLog): Promise<{
        updateResult: {
            success: boolean;
        };
        jobUpdateResult: {
            success: boolean;
        };
        success: boolean;
    } | {
        success: boolean;
        err?: string;
        newTimeInSeconds?: number;
        newAverageTime?: number;
    }>;
}
export default JobConsumer;
//# sourceMappingURL=JobConsumer.d.ts.map