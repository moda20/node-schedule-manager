import { loggers } from "../Entities/utils";

let logger: loggers = {
  trace: console.log,
  debug: console.log,
  error: console.log,
  info: console.log,
  warn: console.log,
};

export const initLogger = (cnf: loggers) => {
  logger = {
    error: cnf.error ?? console.log,
    debug: cnf.debug ?? console.log,
    info: cnf.info ?? console.log,
    trace: cnf.trace ?? console.log,
    warn: cnf.warn ?? console.log,
  };
};

export { logger };
