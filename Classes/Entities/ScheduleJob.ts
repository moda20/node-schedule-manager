// ScheduleJob.ts

export interface IScheduleJob {
  createdAt?: Date;
  id?: number;
  name: string;
  cronSetting: string;
  consumer: string;
  status: string;
  param: any; // Adjust type based on actual usage
  exclusive: boolean;
  uniqueSingularId?: string;
  averageTime: number;
  latestRun?: any | null;

  getId(): number | undefined;
  getName(): string;
  getParam(): any; // Adjust type based on actual usage
  getCronSetting(): string;
  getConsumer(): string;
  getExclusive(): boolean;
  getStats(): string;
  getAverageTime(): number;
  setAverageTime(averageTime: number): void;
  setId(id: number): void;
  setName(name: string): void;
  setParam(param: any): void; // Adjust type based on actual usage
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

export class ScheduleJob implements IScheduleJob {
  createdAt?: Date;
  id?: number;
  name: string;
  cronSetting: string;
  consumer: string;
  status: string;
  param: any; // Adjust type based on actual usage
  exclusive: boolean;
  uniqueSingularId?: string;
  averageTime: number;
  latestRun?: any | null;

  constructor(dataObj: ScheduleJobTable) {
    this.createdAt = dataObj.created_at;
    this.id = dataObj.job_id;
    this.name = dataObj.job_name;
    this.cronSetting = dataObj.job_cron_setting;
    this.consumer = dataObj.consumer;
    this.status = dataObj.status;
    this.param = dataObj.job_param;
    this.exclusive = dataObj.exclusive;
    this.averageTime = dataObj.average_time ?? 0;
    this.latestRun = dataObj.latest_run ?? null;
  }

  getId() {
    return this.id ? Number(this.id) : undefined;
  }

  getName() {
    return this.name;
  }

  getParam() {
    return this.param;
  }

  getCronSetting() {
    return this.cronSetting;
  }

  getConsumer() {
    return this.consumer;
  }

  getExclusive() {
    return this.exclusive;
  }

  getStats() {
    return this.status;
  }

  getAverageTime() {
    return this.averageTime;
  }

  setAverageTime(averageTime: number) {
    this.averageTime = averageTime;
  }

  setId(id: number | undefined) {
    this.id = id;
  }

  setName(name: string) {
    this.name = name;
  }

  setParam(param: string) {
    this.param = param;
  }

  setCronSetting(cronSetting: string) {
    this.cronSetting = cronSetting;
  }

  setConsumer(consumer: string) {
    this.consumer = consumer;
  }

  setExclusive(exclusive: boolean) {
    this.exclusive = exclusive;
  }

  setStatus(status: string) {
    this.status = status;
  }

  setUniqueSingularId(id: string) {
    this.uniqueSingularId = id;
  }

  getUniqueSingularId() {
    return this.uniqueSingularId;
  }

  getCreatedAt() {
    return this.createdAt;
  }
  setCreatedAt(createdAt: Date) {
    this.createdAt = createdAt;
  }

  getLatestRun() {
    return this.latestRun;
  }
  setLatestRun(latestRun: any) {
    this.latestRun = latestRun;
  }
}

export default ScheduleJob;
