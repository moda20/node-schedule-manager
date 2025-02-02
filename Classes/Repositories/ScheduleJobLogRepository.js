const MySQL = require('../Util/MySQL.js');
const ScheduleJobLog = require('../Entities/ScheduleJobLog.js');

class ScheduleJobLogRepository {
  constructor() {
  }

  static async newLog(log) {
    try {
      let sql = 'INSERT INTO schedule_job_log (job_log_id, job_id, machine, start_time, end_time, result) VALUES (?,?,?,?,?,?)';
      let sqlData = [log.getId(), log.getJobId(), log.getMachine(), log.getStartTime(), log.getEndTime(), log.getResult()];
      let result = await MySQL.query(sql, sqlData);

      if(result.affectedRows + '' !== '1') {
        return {success:false , err: 'insert job log failed'};
      }

      return {success:true};
    }catch(err) {
      return {success: false, err: err.toString()};
    }
  }

  static async update(log) {
    try {
      let sql = 'UPDATE schedule_job_log SET end_time = ?, result = ? WHERE job_log_id = ?';
      let sqlData = [log.getEndTime(), log.getResult(), log.getId()];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success:false , err: 'update job log failed'};
      }
      return {success:true};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getLog(jobId, offset, limit, order) {
    try {
      let sql = '';
      let sqlData = [];

      if(jobId === '' && order.toUpperCase() === 'DESC') {
        sql = 'SELECT *, DATE_FORMAT(start_time, \'%Y-%m-%d %H:%i:%s\') as format_start_time, DATE_FORMAT(end_time, \'%Y-%m-%d %H:%i:%s\') as format_end_time FROM schedule_job_log ORDER by start_time DESC LIMIT ? OFFSET ?';
        sqlData = [limit, offset];
      }else if(jobId !== '' && order.toUpperCase() === 'DESC') {
        sql = 'SELECT *, DATE_FORMAT(start_time, \'%Y-%m-%d %H:%i:%s\') as format_start_time, DATE_FORMAT(end_time, \'%Y-%m-%d %H:%i:%s\') as format_end_time FROM schedule_job_log WHERE job_id = ? ORDER by start_time DESC LIMIT ? OFFSET ?';
        sqlData = [jobId, limit, offset];
      }else if(jobId === '' && order.toUpperCase() === 'ASC') {
        sql = 'SELECT *, DATE_FORMAT(start_time, \'%Y-%m-%d %H:%i:%s\') as format_start_time, DATE_FORMAT(end_time, \'%Y-%m-%d %H:%i:%s\') as format_end_time FROM schedule_job_log ORDER by start_time ASC LIMIT ? OFFSET ?';
        sqlData = [limit, offset];
      }else if(jobId !== '' && order.toUpperCase() === 'ASC') {
        sql = 'SELECT *, DATE_FORMAT(start_time, \'%Y-%m-%d %H:%i:%s\') as format_start_time, DATE_FORMAT(end_time, \'%Y-%m-%d %H:%i:%s\') as format_end_time FROM schedule_job_log WHERE job_id = ? ORDER by start_time ASC LIMIT ? OFFSET ?';
        sqlData = [jobId, limit, offset];
      }

      if(sql === '') {
        return {success:false, err: 'get log failed'};
      }

      let result = await MySQL.query(sql, sqlData, {selectQuery: true});
      let logs = [];

      for(var i = 0 ; i < result.length ; i++) {
        result[i].start_time = result[i].format_start_time;
        result[i].end_time = result[i].format_end_time;
        logs.push(new ScheduleJobLog(result[i]));
      }

      return {success:true, logs:logs};

    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getLogStats(jobId) {
    try {

      let sqlData = [];
      const jobIds = Array.isArray(jobId) ? jobId : [jobId];

      let sql = `SELECT job_id                     as id,
                        AVG(end_time - start_time) as avgTime,
                        MAX(start_time)            as latestStart,
                        (select end_time as lastEnds
                         from schedule_job_log as sjl
                         where start_time = (select MAX(start_time) from schedule_job_log as sji where sji.job_id = id)
                           and sjl.job_id = id)    as LatestEnds
                 from schedule_job_log ${jobId ? `where job_id IN (${jobIds.map(e => "\'" + e + "\'").join(',')})` : ''}
                 group by job_id`;

      if(sql === '') {
        return {success:false, err: 'get log failed'};
      }

      let result = await MySQL.query(sql, undefined, {selectQuery: true});

      return {success:true, result:result};

    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async deleteLog(jobId) {
    try {
      let sql = '';
      let sqlData = [jobId];

      sql = 'DELETE FROM schedule_job_log WHERE job_id = ?'

      let result = await MySQL.query(sql, sqlData, {selectQuery: true});

      return {success:true, result:result};

    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }
}

module.exports = ScheduleJobLogRepository;
