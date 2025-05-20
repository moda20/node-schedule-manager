import { createPool, Pool, PoolOptions, PoolConnection } from "mysql2";

class MySQLConnector {
  private pool: Pool | null = null;

  setPool(pool: Pool): void {
    this.pool = pool;
  }

  createPool(config: PoolOptions): { success: boolean; err?: string } {
    try {
      this.pool = createPool(config);
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  closePool(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.pool) {
        this.pool.end((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async testConnection(): Promise<{ success: boolean; err?: string }> {
    try {
      const result = await this.execAsync(async (connection) => {
        const rows = await new Promise<{ value: number }[]>(
          (resolve, reject) => {
            connection.query("SELECT 1 AS value", (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows as { value: number }[]);
              }
            });
          },
        );
        return rows[0].value;
      });
      return { success: true };
    } catch (err) {
      return { success: false, err: (err as Error).toString() };
    }
  }

  async query<T = any>(
    sql: string,
    data: any[],
    opts?: { selectQuery?: boolean },
  ): Promise<T> {
    try {
      const result: T = await this.execAsync(async (connection) => {
        return await new Promise<T>((resolve, reject) => {
          connection.query(sql, data, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows as T);
            }
          });
        });
      });
      return opts?.selectQuery ? JSON.parse(JSON.stringify(result)) : result;
    } catch (err) {
      const errString = `${(err as Error).toString()}\nSQL: ${sql}\nSQL Data: ${JSON.stringify(data)}`;
      throw new Error(errString);
    }
  }

  async execAsync<T>(
    actionAsync: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    if (!this.pool) {
      throw new Error("Connection pool is not initialized");
    }

    const connection = await new Promise<PoolConnection>((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    try {
      return await actionAsync(connection);
    } finally {
      connection.release();
    }
  }
}

export default new MySQLConnector();
