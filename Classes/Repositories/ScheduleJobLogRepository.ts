// ScheduleJobLogRepository.ts

import MySQL from "../Util/MySQL";
import {
  ScheduleJobLog,
  IScheduleJobLog,
  ScheduleJobLogTable,
} from "../Entities/ScheduleJobLog";

export class ScheduleJobLogRepository {
  private constructor() {}

  static async newLog(
    log: IScheduleJobLog,
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const sql =
        "INSERT INTO schedule_job_log (job_log_id, job_id, start_time, end_time, error) VALUES (?, ?, ?, ?, ?)";
      const result = await MySQL.query(sql, [
        log.id,
        log.jobId,
        log.startTime,
        log.endTime,
        log.error,
      ]);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getLog(
    jobId: number,
    limit?: number,
    offset?: number,
  ): Promise<{ success: boolean; logs?: ScheduleJobLog[]; err?: string }> {
    try {
      const sql = "SELECT * FROM schedule_job_log WHERE job_id = ?";
      const result = await MySQL.query(sql, [jobId]);
      const logs = result.map(
        (row: ScheduleJobLogTable) => new ScheduleJobLog(row),
      );
      return { success: true, logs };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getLatestJobRun(
    inputJobIds: number[],
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const jobIds = Array.isArray(inputJobIds) ? inputJobIds : [inputJobIds];
      const sql = `
        SELECT *
        FROM schedule_job_log
        WHERE job_log_id IN (SELECT MAX(job_log_id) as log_id
                             FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
                             GROUP BY job_id)
      `;
      const result = await MySQL.query(sql, []);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async deleteLog(
    jobId: number,
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const sql = "DELETE FROM schedule_job_log WHERE job_id = ?";
      const result = await MySQL.query(sql, [jobId]);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getLogStats(
    jobId: number | number[],
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const jobIds = Array.isArray(jobId) ? jobId : [jobId];
      const sql = `
        SELECT job_id                     as id,
               AVG(TIME_TO_SEC(TIMEDIFF(end_time, start_time))) as avgTime,
               MAX(start_time)            as latestStart,
               (SELECT end_time as lastEnds
                FROM schedule_job_log as sjl
                WHERE start_time = (SELECT MAX(start_time) from schedule_job_log as sji where sji.job_id = id)
                  AND sjl.job_id = id)    as LatestEnds
        FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
        GROUP BY job_id
      `;
      const result = await MySQL.query(sql, []);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getNumberOfJobRuns(
    jobId: number | number[],
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const jobIds = Array.isArray(jobId) ? jobId : [jobId];
      const sql = `
        SELECT job_id                     as id,
               SUM(1)                     as total
        FROM schedule_job_log ${jobIds ? `WHERE job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})` : ""}
        GROUP BY job_id
      `;
      const result = await MySQL.query(sql, []);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getLatestJobError(
    jobId: number[],
  ): Promise<{ success: boolean; result?: any; err?: string }> {
    try {
      const jobIds = Array.isArray(jobId) ? jobId : [jobId];
      const sql = `
        SELECT sjl.job_id, sjl.error
        FROM schedule_job_log as sjl
        WHERE sjl.job_id IN (${jobIds.map((e) => "\'" + e + "\'").join(",")})
          AND sjl.end_time IS NOT NULL
        ORDER BY sjl.end_time DESC
        LIMIT 1
      `;
      const result = await MySQL.query(sql, []);
      return { success: true, result };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async update(log: IScheduleJobLog) {
    try {
      let sql =
        "UPDATE schedule_job_log SET end_time = ?, result = ?, error = ? WHERE job_log_id = ?";
      let sqlData = [
        log.getEndTime(),
        log.getResult(),
        log.getError(),
        log.getId(),
      ];
      let result = await MySQL.query(sql, sqlData);
      if (result.affectedRows + "" !== "1") {
        return { success: false, err: "update job log failed" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }
}
