import { Pool, PoolOptions, PoolConnection } from "mysql2";
declare class MySQLConnector {
    private pool;
    setPool(pool: Pool): void;
    createPool(config: PoolOptions): {
        success: boolean;
        err?: string;
    };
    closePool(): Promise<void>;
    testConnection(): Promise<{
        success: boolean;
        err?: string;
    }>;
    query<T = any>(sql: string, data: any[], opts?: {
        selectQuery?: boolean;
    }): Promise<T>;
    execAsync<T>(actionAsync: (connection: PoolConnection) => Promise<T>): Promise<T>;
}
declare const _default: MySQLConnector;
export default _default;
//# sourceMappingURL=MySQL.d.ts.map