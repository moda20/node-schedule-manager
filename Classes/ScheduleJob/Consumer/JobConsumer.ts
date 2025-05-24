import Moment from "moment";
import { ScheduleJobLogRepository } from "../../Repositories/ScheduleJobLogRepository";
import { ScheduleJobRepository } from "../../Repositories/ScheduleJobRepository";
import ScheduleJobEventBus from "../ScheduleJobEventBus";
import { IScheduleJobLog } from "../../Entities/ScheduleJobLog";
import { IScheduleJob } from "../../Entities/ScheduleJob";

class JobConsumer {
  job?: IScheduleJob;
  jobLog?: IScheduleJobLog;

  runHandler = (...args: [IScheduleJob, IScheduleJobLog]) => {
    try {
      return this.preRun(...args);
    } catch (err) {
      console.log(err);
    }
  };

  on(jobName: string) {
    ScheduleJobEventBus.on("scheduleJob:" + jobName, this.runHandler);
  }

  off(jobName: string) {
    ScheduleJobEventBus.off("scheduleJob:" + jobName, this.runHandler);
  }

  async complete(
    jobLog: IScheduleJobLog,
    result: any,
    error?: string,
  ): Promise<
    | {
        updateResult: { success: boolean };
        jobUpdateResult: { success: boolean };
      }
    | { success: boolean; err?: string }
  > {
    jobLog.setEndTime(Moment().format("YYYY-MM-DD HH:mm:ss"));
    jobLog.setResult(result);
    jobLog.setError(error);

    const updateResult = await ScheduleJobLogRepository.update(jobLog);
    let oldAverageTime = this.job?.getAverageTime() || 0;
    const numberOfRuns = (
      await ScheduleJobLogRepository.getNumberOfJobRuns(jobLog.getJobId())
    )?.result?.[0]?.total;

    if (!oldAverageTime) {
      const stats = (
        await ScheduleJobLogRepository.getLogStats(jobLog.getJobId())
      )?.result?.[0];
      oldAverageTime = stats.avgTime;
    }

    const newTimeInSeconds = Moment(jobLog.getEndTime()).diff(
      Moment(jobLog.getStartTime()),
      "seconds",
    );
    const newAverageTime =
      oldAverageTime + (newTimeInSeconds - oldAverageTime) / numberOfRuns;
    const jobUpdateResult =
      await ScheduleJobRepository.updateJobAverageRunningTime(
        jobLog.getJobId(),
        newAverageTime,
      );

    if (!updateResult.success || !jobUpdateResult.success) {
      return { updateResult, jobUpdateResult };
    } else {
      let targetSingularLogId = this.job?.getUniqueSingularId()
        ? `${this.job.getName()}_${this.job?.getUniqueSingularId()}`
        : this.job?.getName();
      ScheduleJobEventBus.emit(`completed:${targetSingularLogId}`, this.job);
      return { success: true };
    }
  }

  error(error: Error) {
    this.jobLog?.logEventBus.emit(
      "error:" + (this.job?.getUniqueSingularId() ?? this.job?.getId()),
      error,
    );
  }

  serializeLogs(
    logsData: any,
    initialLevel: number = 2,
    currentLevel: number = 0,
  ): any {
    if (typeof logsData === "string") return logsData;
    const isLogsArray = Array.isArray(logsData);
    const inputLogs = isLogsArray ? logsData.slice(0, 10) : logsData;
    const serializedObj: { [key: string]: any } = isLogsArray ? [] : {};

    for (const key in inputLogs) {
      if (
        typeof inputLogs.hasOwnProperty === "function" &&
        inputLogs.hasOwnProperty(key)
      ) {
        const value = inputLogs[key];
        if (typeof value === "object" && value !== null) {
          if (currentLevel < initialLevel) {
            serializedObj[key] = this.serializeLogs(
              value,
              initialLevel,
              currentLevel + 1,
            );
          } else {
            serializedObj[key] = `[${typeof value}]`;
          }
        } else {
          serializedObj[key] = value;
        }
      }
    }

    return serializedObj;
  }

  logEvent(data: any, serializer?: (data: any) => any) {
    const serializedData = serializer
      ? serializer(data)
      : this.serializeLogs(data);
    if (this.jobLog?.logEventBus) {
      this.jobLog.logEventBus.emit(
        "jobLog:" + (this.job?.getUniqueSingularId() ?? this.job?.getId()),
        serializedData,
      );
    }
  }

  async preRun(job: IScheduleJob, jobLog: IScheduleJobLog) {
    try {
      return await this.run(job, jobLog);
    } catch (err) {
      return await this.complete(jobLog, null, (err as Error).toString());
    }
  }

  async run(job: IScheduleJob, jobLog: IScheduleJobLog) {
    return await this.complete(jobLog, "");
  }
}

export default JobConsumer;
