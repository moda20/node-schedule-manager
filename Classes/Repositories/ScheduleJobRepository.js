const MySQL = require('../Util/MySQL.js');
const ScheduleJob = require('../Entities/ScheduleJob.js');

class ScheduleJobRepository {
  constructor() {
  }

  static async newJob(job) {
    try {

      let sql = 'INSERT INTO schedule_job (job_name, job_param, job_cron_setting, consumer, exclusive, status, average_time, created_at) VALUES (?,?,?,?,?,?,?,?)';
      let sqlData = [
        job.getName(),
        (ScheduleJobRepository.isJSONString(job.getParam())) ? JSON.stringify(job.getParam()) : job.getParam(),
        job.getCronSetting(),
        job.getConsumer(),
        (job.getExclusive()) ? 'true' : 'false',
        job.getStats(),
        0,
          job.getCreatedAt()
      ];
      let result = await MySQL.query(sql, sqlData);

      if(result.affectedRows + '' !== '1') {
        return {success: false, err:'insert job failed'};
      }

      return {success: true, jobId: result.insertId};
    }catch(err) {
      return {success: false, err: err.toString()};
    }
  }

  static async updateJob(job) {
    try {
      let sql = 'UPDATE schedule_job SET job_name = ?, job_param = ?, job_cron_setting = ?, consumer = ?, exclusive = ?, status = ? WHERE job_id = ?';
      let sqlData = [
        job.getName(),
        (ScheduleJobRepository.isJSONString(job.getParam())) ? JSON.stringify(job.getParam()) : job.getParam(),
        job.getCronSetting(),
        job.getConsumer(),
        (job.getExclusive()) ? 'true' : 'false', job.getStats(),
        job.getId()
      ];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success: false, err:'update job failed'};
      }
      return {success: true};
    }catch(err) {
      return {success: false, err:err.toString()};
    }
  }

  static async deleteJob(jobId) {
    try {
      let sql = 'DELETE FROM schedule_job WHERE job_id = ?';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success:false, err:'delete job failed'};
      }
      return {success:true};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async softDeleteJob(jobId) {
    try {
      let sql = 'UPDATE schedule_job SET status = "DELETED" WHERE job_id = ?';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success:false, err: 'soft delete job failed'};
      }
      return {success:true};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getJobById(jobId) {
    try {
      let sql = 'SELECT * FROM schedule_job WHERE job_id = ? limit 1';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData, {selectQuery: true})

      if(result.length === 0)
        return {success:false, err:'get job by id failed'};

      (result[0].exclusive === 'true') ? result[0].exclusive = true : result[0].exclusive = false;
      (ScheduleJobRepository.isJSONString(result[0].job_param)) ? result[0].job_param = JSON.parse(result[0].job_param) : result[0].job_param;

      let job = new ScheduleJob(result[0]);

      return {success:true, job:job};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getJobsByStatus(status, sorting) {
    try {
      const whereClause = Array.isArray(status) ? `WHERE sj.status IN (?)`: ` WHERE sj.status = ?`
      let sortClause = '';
      if(sorting){
        const orderQuery = Array.isArray(sorting) ? sorting.map((e) => `sj.${e.by} ${e.desc ? 'DESC' : 'ASC'}`).join(', ') : `${sj.sorting.by} ${sorting.desc ? 'DESC' : 'ASC'}`
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
      `
      let sqlData = [status];

      let result = await MySQL.query(sql, sqlData, {selectQuery: true});
      let jobs = [];

      for(let i = 0 ; i < result.length ; i++) {

        (result[i].exclusive === 'true') ? result[i].exclusive = true : result[i].exclusive = false;
        (ScheduleJobRepository.isJSONString(result[i].job_param)) ? result[i].job_param = JSON.parse(result[i].job_param) : result[i].job_param;

        result[i].latest_run = Object.fromEntries(
            Object.keys(result[i]).filter(e => e.split('.').length > 1)
                .map(e => [e.split('.')[1], result[i][e]])
        )

        let job = new ScheduleJob(result[i]);
        jobs.push(job);
      }

      return {success:true, jobs:jobs};

    } catch(err) {
      return {success:false, err:err.toString()};
    }
  }

  static async updateJobAverageRunningTime(jobId, newAverageTime) {
    try {
      let sql = 'UPDATE schedule_job SET average_time = ? WHERE job_id = ?';
      let sqlData = [newAverageTime, jobId];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success:false, err:'update job average running time failed'};
      }
      return {success:true};
    }catch(err) {
      return {success:false, err:err.toString()};
    }
  }

  static isJSONString(str) {
    try {
      JSON.parse(str);
      return true;
    }catch(err) {
      return false;
    }
  }
}

module.exports = ScheduleJobRepository;
