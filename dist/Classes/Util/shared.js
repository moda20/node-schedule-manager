"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.initLogger = void 0;
let logger = {
    trace: console.log,
    debug: console.log,
    error: console.log,
    info: console.log,
    warn: console.log,
};
exports.logger = logger;
const initLogger = (cnf) => {
    var _a, _b, _c, _d, _e;
    exports.logger = logger = {
        error: (_a = cnf.error) !== null && _a !== void 0 ? _a : console.log,
        debug: (_b = cnf.debug) !== null && _b !== void 0 ? _b : console.log,
        info: (_c = cnf.info) !== null && _c !== void 0 ? _c : console.log,
        trace: (_d = cnf.trace) !== null && _d !== void 0 ? _d : console.log,
        warn: (_e = cnf.warn) !== null && _e !== void 0 ? _e : console.log,
    };
};
exports.initLogger = initLogger;
//# sourceMappingURL=shared.js.map