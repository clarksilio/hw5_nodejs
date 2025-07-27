import { EventEmitter } from "node:events";
import fs from 'fs';
class Logger extends EventEmitter {
    constructor() {
        super(...arguments);
        this.logArray = [];
    }
    log(message) {
        this.emit('logged', message);
    }
    save(message) {
        this.emit('saved', message);
    }
    saveToFile(message) {
        this.emit('to_file', message);
    }
    addLogToArray(message) {
        this.logArray.push({ date: new Date().toISOString(), message });
    }
    getLogArray() {
        return [...this.logArray];
    }
}
//=====================================================
export const myLogger = new Logger();
myLogger.on('logged', (message) => {
    console.log(new Date().toISOString(), message);
});
myLogger.on('saved', (message) => {
    myLogger.addLogToArray(message);
});
myLogger.on('to_file', (message) => {
    myLogger.addLogToArray(message);
    const fileName = 'log.txt';
    fs.writeFileSync(fileName, JSON.stringify(myLogger.getLogArray()));
});
