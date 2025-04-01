"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
class MySQLConnector {
    constructor() {
        this.pool = null;
    }
    setPool(pool) {
        this.pool = pool;
    }
    createPool(config) {
        try {
            this.pool = (0, mysql_1.createPool)(config);
            return { success: true };
        }
        catch (err) {
            return { success: false, err: err.toString() };
        }
    }
    closePool() {
        return new Promise((resolve, reject) => {
            if (this.pool) {
                this.pool.end((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.execAsync((connection) => __awaiter(this, void 0, void 0, function* () {
                    const rows = yield new Promise((resolve, reject) => {
                        connection.query("SELECT 1 AS value", (err, rows) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(rows);
                            }
                        });
                    });
                    return rows[0].value;
                }));
                return { success: true };
            }
            catch (err) {
                return { success: false, err: err.toString() };
            }
        });
    }
    query(sql, data, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.execAsync((connection) => __awaiter(this, void 0, void 0, function* () {
                    const rows = yield new Promise((resolve, reject) => {
                        connection.query(sql, data, (err, rows) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(rows);
                            }
                        });
                    });
                    return (opts === null || opts === void 0 ? void 0 : opts.selectQuery) ? JSON.parse(JSON.stringify(result)) : result;
                }));
                return result;
            }
            catch (err) {
                const errString = `${err.toString()}\nSQL: ${sql}\nSQL Data: ${JSON.stringify(data)}`;
                throw new Error(errString);
            }
        });
    }
    execAsync(actionAsync) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pool) {
                throw new Error("Connection pool is not initialized");
            }
            const connection = yield new Promise((resolve, reject) => {
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(connection);
                    }
                });
            });
            try {
                return yield actionAsync(connection);
            }
            finally {
                connection.release();
            }
        });
    }
}
exports.default = new MySQLConnector();
//# sourceMappingURL=MySQL.js.map