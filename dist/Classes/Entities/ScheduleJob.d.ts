export interface IScheduleJob {
    createdAt?: Date;
    id?: number;
    name: string;
    cronSetting: string;
    consumer: string;
    status: string;
    param: any;
    exclusive: boolean;
    uniqueSingularId?: string;
    averageTime: number;
    latestRun?: any | null;
    extraParams?: {
        [key: string]: any;
    };
    getId(): number | undefined;
    getName(): string;
    getParam(): any;
    getCronSetting(): string;
    getConsumer(): string;
    getExclusive(): boolean;
    getStats(): string;
    getAverageTime(): number;
    setAverageTime(averageTime: number): void;
    setId(id: number): void;
    setName(name: string): void;
    setParam(param: any): void;
    setCronSetting(cronSetting: string): void;
    setConsumer(consumer: string): void;
    setExclusive(exclusive: boolean): void;
    setStatus(status: string): void;
    setUniqueSingularId(id: string): void;
    getUniqueSingularId(): string | undefined;
    getCreatedAt(): Date | undefined;
    setCreatedAt(createdAt: Date): void;
    getLatestRun(): Date | null;
    setLatestRun(latestRun: Date | null): void;
    getJobUpdateObject(): ScheduleJobTable;
    getExtraParams(): {
        [key: string]: any;
    } | undefined;
    setExtraParams(extraParams: {
        [key: string]: any;
    }): void;
}
export interface ScheduleJobTable {
    job_name: string;
    job_param: string;
    job_cron_setting: string;
    consumer: string;
    exclusive: boolean;
    status: string;
    average_time?: number;
    created_at?: Date;
    job_id?: number;
    latest_run?: any;
}
export declare class ScheduleJob implements IScheduleJob {
    createdAt?: Date;
    id?: number;
    name: string;
    cronSetting: string;
    consumer: string;
    status: string;
    param: any;
    exclusive: boolean;
    uniqueSingularId?: string;
    averageTime: number;
    latestRun?: any | null;
    extraParams?: {
        [key: string]: any;
    };
    constructor(dataObj: ScheduleJobTable);
    getJobUpdateObject(): {
        job_name: string;
        job_cron_setting: string;
        consumer: string;
        status: string;
        job_param: any;
        exclusive: boolean;
    };
    getId(): number | undefined;
    getName(): string;
    getParam(): any;
    getCronSetting(): string;
    getConsumer(): string;
    getExclusive(): boolean;
    getStats(): string;
    getAverageTime(): number;
    setAverageTime(averageTime: number): void;
    setId(id: number | undefined): void;
    setName(name: string): void;
    setParam(param: string): void;
    setCronSetting(cronSetting: string): void;
    setConsumer(consumer: string): void;
    setExclusive(exclusive: boolean): void;
    setStatus(status: string): void;
    setUniqueSingularId(id: string): void;
    getUniqueSingularId(): string | undefined;
    getCreatedAt(): Date | undefined;
    setCreatedAt(createdAt: Date): void;
    getLatestRun(): any;
    setLatestRun(latestRun: any): void;
    getExtraParams(): {
        [p: string]: any;
    } | undefined;
    setExtraParams(extraParams: {
        [p: string]: any;
    } | undefined): void;
}
export default ScheduleJob;
//# sourceMappingURL=ScheduleJob.d.ts.map