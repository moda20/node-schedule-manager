// ScheduleJobRepository.ts
import MySQL from "../Util/MySQL";
import { ScheduleJob, IScheduleJob } from "../Entities/ScheduleJob";

export interface jobSorting {
  by: string;
  desc?: boolean;
}

export class ScheduleJobRepository {
  static async newJob(
    job: IScheduleJob,
  ): Promise<{ success: boolean; jobId?: number; err?: string }> {
    try {
      let sql =
        "INSERT INTO schedule_job (job_name, job_param, job_cron_setting, consumer, exclusive, status, average_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      let sqlData = [
        job.name,
        JSON.stringify(job.param),
        job.cronSetting,
        job.consumer,
        job.exclusive,
        job.status,
        job.averageTime,
        job.createdAt,
      ];

      const result = await MySQL.query(sql, sqlData);
      return { success: true, jobId: result.insertId };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getJobById(
    jobId: number,
  ): Promise<{ success: boolean; job?: ScheduleJob; err?: string }> {
    try {
      let sql = "SELECT * FROM schedule_job WHERE job_id = ?";
      let sqlData = [jobId];

      const result = await MySQL.query(sql, sqlData);
      if (result.length === 0) return { success: false, err: "Job not found" };

      const job = new ScheduleJob(result[0]);
      return { success: true, job };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async updateJob(
    jobId: number,
    updatedFields: Partial<ScheduleJob>,
  ): Promise<{ success: boolean; err?: string }> {
    try {
      let sql = "UPDATE schedule_job SET ";
      let sqlData: any[] = [];
      const setClauses: string[] = [];

      for (const [key, value] of Object.entries(updatedFields)) {
        if (value !== undefined) {
          setClauses.push(`${key} = ?`);
          sqlData.push(value);
        }
      }

      sql += setClauses.join(", ");
      sql += " WHERE job_id = ?";
      sqlData.push(jobId);

      await MySQL.query(sql, sqlData);
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async deleteJob(
    jobId: number,
  ): Promise<{ success: boolean; err?: string }> {
    try {
      let sql = "DELETE FROM schedule_job WHERE job_id = ?";
      let sqlData = [jobId];

      await MySQL.query(sql, sqlData);
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async getJobsByStatus(
    status: string | string[],
    sorting?: jobSorting,
  ): Promise<{ success: boolean; jobs?: ScheduleJob[]; err?: string }> {
    try {
      let whereClause = Array.isArray(status)
        ? `WHERE sj.status IN (?)`
        : ` WHERE sj.status = ?`;
      let sortClause = "";
      if (sorting) {
        const orderQuery = Array.isArray(sorting)
          ? sorting
              .map((e) => `sj.${e.by} ${e.desc ? "DESC" : "ASC"}`)
              .join(", ")
          : `${sorting.by} ${sorting.desc ? "DESC" : "ASC"}`;
        sortClause = `ORDER BY ${orderQuery}`;
      }

      let sql = `
        SELECT sj.*, sjl.*
        FROM schedule_job sj
               LEFT JOIN (SELECT sjl1.job_id     as \`last_run.job_id\`,
                                 sjl1.job_log_id as \`last_run.job_log_id\`,
                                 sjl1.machine    as \`last_run.machine\`,
                                 sjl1.start_time as \`last_run.start_time\`,
                                 sjl1.end_time   as \`last_run.end_time\`,
                                 sjl1.result     as \`last_run.result\`,
                                 sjl1.error      as \`last_run.error\`
                          FROM schedule_job_log sjl1
                                 JOIN (SELECT job_id, MAX(start_time) AS latest_end_time
                                       FROM schedule_job_log
                                       GROUP BY job_id) sjl2
                                      ON sjl1.job_id = sjl2.job_id AND sjl1.start_time = sjl2.latest_end_time) sjl
                         ON sj.job_id = sjl.\`last_run.job_id\`
        ${whereClause}
        ${sortClause}
        ;
      `;
      let sqlData = Array.isArray(status) ? status : [status];

      const result = await MySQL.query(sql, sqlData);
      let jobs: ScheduleJob[] = [];

      for (let i = 0; i < result.length; i++) {
        result[i].exclusive = result[i].exclusive === "true";
        result[i].job_param = JSON.parse(result[i].job_param);

        const latestRun = Object.fromEntries(
          Object.keys(result[i])
            .filter((e) => e.split(".").length > 1)
            .map((e) => [e.split(".")[1], result[i][e]]),
        );

        jobs.push(new ScheduleJob({ ...result[i], latest_run: latestRun }));
      }

      return { success: true, jobs };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async updateJobAverageRunningTime(
    jobId: number,
    newAverageTime: number,
  ): Promise<{ success: boolean; err?: string }> {
    try {
      let sql = "UPDATE schedule_job SET average_time = ? WHERE job_id = ?";
      let sqlData = [newAverageTime, jobId];
      let result = await MySQL.query(sql, sqlData);
      if (result.affectedRows + "" !== "1") {
        return {
          success: false,
          err: "update job average running time failed",
        };
      }
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  static async softDeleteJob(
    jobId: number,
  ): Promise<{ success: boolean; err?: string }> {
    try {
      let sql = 'UPDATE schedule_job SET status = "DELETED" WHERE job_id = ?';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData);
      if (result.affectedRows + "" !== "1") {
        return { success: false, err: "soft delete job failed" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }
}
