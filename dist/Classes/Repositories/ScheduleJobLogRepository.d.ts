import { ScheduleJobLog, IScheduleJobLog } from "../Entities/ScheduleJobLog";
export declare class ScheduleJobLogRepository {
    private constructor();
    static newLog(log: IScheduleJobLog): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static getLog(jobId: number, limit?: number, offset?: number): Promise<{
        success: boolean;
        logs?: ScheduleJobLog[];
        err?: string;
    }>;
    static getLatestJobRun(inputJobIds: number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static deleteLog(jobId: number): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static getLogStats(jobId: number | number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static getNumberOfJobRuns(jobId: number | number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static getLatestJobError(jobId: number[]): Promise<{
        success: boolean;
        result?: any;
        err?: string;
    }>;
    static update(log: IScheduleJobLog): Promise<{
        success: boolean;
        err: string;
    } | {
        success: boolean;
        err?: undefined;
    }>;
}
//# sourceMappingURL=ScheduleJobLogRepository.d.ts.map