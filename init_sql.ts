const InitSQL = {
  createScheduleJobTable: `
    CREATE TABLE IF NOT EXISTS schedule_job (
      job_id INT(100) NOT NULL AUTO_INCREMENT,
      job_name VARCHAR(200) NOT NULL DEFAULT '',
      job_param LONGTEXT,
      job_cron_setting VARCHAR(100) NOT NULL DEFAULT '',
      consumer VARCHAR(1000) NOT NULL DEFAULT '',
      exclusive VARCHAR(5) NOT NULL DEFAULT '',
      status VARCHAR(10) NOT NULL DEFAULT '',
      average_time FLOAT NOT NULL DEFAULT 0,
      created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (job_id),
      UNIQUE KEY job_name (job_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `,

  createScheduleJobLogTable: `
    CREATE TABLE IF NOT EXISTS schedule_job_log (
      job_log_id VARCHAR(100) NOT NULL,
      job_id INT(100) NOT NULL,
      machine VARCHAR(100) DEFAULT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME DEFAULT NULL,
      result LONGTEXT,
      error LONGTEXT,
      PRIMARY KEY (job_log_id),
      KEY job_id (job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `,
};

export default InitSQL;
