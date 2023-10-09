import winston from "winston";

const logger = winston.createLogger({
    level: process.env.loglevel || 'info',
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
});

export default logger
