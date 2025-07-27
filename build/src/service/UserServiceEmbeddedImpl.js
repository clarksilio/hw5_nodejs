import fs from "fs";
import { myLogger } from "../utils/logger.js";
export class UserServiceEmbeddedImpl {
    constructor() {
        this.users = [];
        this.rs = fs.createReadStream('data.txt', { encoding: "utf-8", highWaterMark: 24 });
    }
    addUser(user) {
        if (this.users.findIndex((u) => u.id === user.id) === -1) {
            this.users.push(user);
            return true;
        }
        return false;
    }
    getAllUsers() {
        return [...this.users];
    }
    getUserById(id) {
        const user = this.users.find(item => item.id === id);
        if (!user)
            throw "404";
        return user;
    }
    removeUser(id) {
        const index = this.users.findIndex(item => item.id === id);
        if (index === -1)
            throw "404";
        const removed = this.users[index];
        this.users.splice(index, 1);
        return removed;
    }
    updateUser(newUser) {
        const index = this.users.findIndex(item => item.id === newUser.id);
        if (index === -1)
            throw "404";
        this.users[index] = newUser;
    }
    restoreDataFromFile() {
        return new Promise((resolve, reject) => {
            let result = "";
            this.rs.on('data', (chunk) => {
                if (chunk) {
                    result += chunk.toString();
                }
                else {
                    result = "[]";
                    reject();
                }
            });
            this.rs.on('end', () => {
                if (result) {
                    this.users = JSON.parse(result);
                    myLogger.log("Data was restored from file");
                    myLogger.save("Data was restored from file");
                    this.rs.close();
                }
                else {
                    this.users = [{ id: 123, userName: "Panikovsky" }];
                }
                resolve();
            });
            this.rs.on('error', () => {
                this.users = [{ id: 2, userName: "Bender" }];
                myLogger.log('File to restore not found');
                resolve();
            });
        });
    }
    saveDataToFile() {
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream('data.txt', { flags: "w" });
            const data = JSON.stringify(this.users);
            ws.write(data, (e) => {
                if (e) {
                    myLogger.log("Error: " + e.message);
                    reject(e);
                }
                else {
                    ws.end();
                }
            });
            ws.on('finish', () => {
                myLogger.log("Data was saved to file");
                myLogger.save("Data was saved to file");
                resolve();
            });
            ws.on('error', (err) => {
                myLogger.log("error: data not saved! " + err.message);
                reject(err);
            });
        });
    }
}
