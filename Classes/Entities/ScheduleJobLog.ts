// ScheduleJobLog.ts
import { EventEmitter } from "events";

export class ScheduleJobLog implements IScheduleJobLog {
  id?: string;
  jobId: number;
  machine: string;
  startTime: Date;
  endTime?: Date;
  result: string | null;
  logEventBus: any; // Adjust type based on actual usage
  error?: string;

  constructor(dataObj: ScheduleJobLogTable) {
    this.id = dataObj.job_log_id;
    this.jobId = dataObj.job_id;
    this.machine = dataObj.machine;
    this.startTime = new Date(dataObj.start_time);
    if (dataObj.end_time) {
      this.endTime = new Date(dataObj.end_time);
    }
    this.result = dataObj.result || null;
    this.logEventBus = dataObj.logEventBus;
    this.error = dataObj.error;
  }

  getId(): string | undefined {
    return this.id;
  }

  getJobId(): number {
    return this.jobId;
  }

  getMachine(): string {
    return this.machine;
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date | undefined {
    return this.endTime;
  }

  getResult(): string | null {
    return this.result;
  }

  getError(): string | undefined {
    return this.error;
  }

  setEndTime(endTime: string): void {
    this.endTime = new Date(endTime);
  }

  setStartTime(startTime: string): void {
    this.startTime = new Date(startTime);
  }

  setResult(result: string): void {
    this.result = result;
  }

  setError(error?: string): void {
    this.error = error;
  }

  setEventLogBus(eventLogBus: any): void {
    // Adjust type based on actual usage
    this.logEventBus = eventLogBus;
  }

  getEventLogBus(): any {
    // Adjust type based on actual usage
    return this.logEventBus;
  }
}

// ScheduleJobLog.interface.ts
export interface IScheduleJobLog {
  id?: string;
  jobId: number;
  machine: string;
  startTime: Date;
  endTime?: Date;
  result: string | null;
  logEventBus: any; // Adjust type based on actual usage
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
