import { EventEmitter } from "events";
export declare class ScheduleJobLog implements IScheduleJobLog {
    id?: string;
    jobId: number;
    machine: string;
    startTime: Date;
    endTime?: Date;
    result: string | null;
    logEventBus: any;
    error?: string;
    constructor(dataObj: ScheduleJobLogTable);
    getId(): string | undefined;
    getJobId(): number;
    getMachine(): string;
    getStartTime(): Date;
    getEndTime(): Date | undefined;
    getResult(): string | null;
    getError(): string | undefined;
    setEndTime(endTime: string): void;
    setStartTime(startTime: string): void;
    setResult(result: string): void;
    setError(error?: string): void;
    setEventLogBus(eventLogBus: any): void;
    getEventLogBus(): any;
}
export interface IScheduleJobLog {
    id?: string;
    jobId: number;
    machine: string;
    startTime: Date;
    endTime?: Date;
    result: string | null;
    logEventBus: any;
    error?: string;
    getId(): string | undefined;
    getJobId(): number;
    getMachine(): string;
    getStartTime(): Date;
    getEndTime(): Date | undefined;
    getResult(): string | null;
    getError(): string | undefined;
    setEndTime(endTime: string): void;
    setStartTime(startTime: string): void;
    setResult(result: string): void;
    setError(error?: string): void;
    setEventLogBus(eventLogBus: any): void;
    getEventLogBus(): any;
}
export interface ScheduleJobLogTable {
    job_log_id?: string;
    job_id: number;
    machine: string;
    start_time: string;
    end_time?: string;
    result: string | null;
    error?: string;
    logEventBus?: EventEmitter;
}
//# sourceMappingURL=ScheduleJobLog.d.ts.map