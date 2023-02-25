class Logger {
    log(toLog) {
        let currentDate = new Date();
        let isoFormat = currentDate.toISOString();
    
        console.log(`${isoFormat}> ${toLog}`);
    }
}

const logger = new Logger();

export { logger };