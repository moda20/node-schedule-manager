import { describe, test, expect } from "@jest/globals";

import { ScheduleJobManager } from "../dist";

describe("Test Schedule Manager", () => {
  test("[1] Will Connect to the database", async () => {
    const result = await ScheduleJobManager.initWithMySQLConfig({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DATA_BASE,
      waitForConnections: true,
      connectionLimit: 5,
    });

    console.log(result);

    expect(result.success).toBe(true);
  });
});
