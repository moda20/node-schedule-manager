import { ScheduleJob, IScheduleJob } from "../Entities/ScheduleJob";
export interface jobSorting {
    by: string;
    desc?: boolean;
}
export declare class ScheduleJobRepository {
    static newJob(job: IScheduleJob): Promise<{
        success: boolean;
        jobId?: number;
        err?: string;
    }>;
    static getJobById(jobId: number): Promise<{
        success: boolean;
        job?: ScheduleJob;
        err?: string;
    }>;
    static updateJob(jobId: number, updatedFields: Partial<ScheduleJob>): Promise<{
        success: boolean;
        err?: string;
    }>;
    static deleteJob(jobId: number): Promise<{
        success: boolean;
        err?: string;
    }>;
    static getJobsByStatus(status: string | string[], sorting?: jobSorting): Promise<{
        success: boolean;
        jobs?: ScheduleJob[];
        err?: string;
    }>;
    static updateJobAverageRunningTime(jobId: number, newAverageTime: number): Promise<{
        success: boolean;
        err?: string;
    }>;
    static softDeleteJob(jobId: number): Promise<{
        success: boolean;
        err?: string;
    }>;
}
//# sourceMappingURL=ScheduleJobRepository.d.ts.map