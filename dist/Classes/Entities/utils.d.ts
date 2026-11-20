export interface loggers {
    trace: (v: any) => void;
    debug: (v: any) => void;
    error: (v: any) => void;
    info: (v: any) => void;
    warn: (v: any) => void;
}
export interface extraPoolConfig {
    loggers: loggers;
}
//# sourceMappingURL=utils.d.ts.map