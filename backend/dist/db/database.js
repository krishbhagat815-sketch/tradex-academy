"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.saveDb = saveDb;
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let dbInstance = null;
const dbDir = path_1.default.resolve(process.cwd(), "data");
const dbFilePath = path_1.default.join(dbDir, "lms.sqlite");
async function getDb() {
    if (dbInstance)
        return dbInstance;
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(dbFilePath)) {
        const fileBuffer = fs_1.default.readFileSync(dbFilePath);
        dbInstance = new SQL.Database(fileBuffer);
    }
    else {
        dbInstance = new SQL.Database();
    }
    return dbInstance;
}
function saveDb() {
    if (!dbInstance)
        return;
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs_1.default.writeFileSync(dbFilePath, buffer);
}
function query(sql, params = []) {
    if (!dbInstance)
        throw new Error("Database not initialized");
    try {
        const stmt = dbInstance.prepare(sql);
        try {
            if (params && params.length > 0) {
                stmt.bind(params);
            }
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            return rows;
        }
        finally {
            stmt.free();
        }
    }
    catch (error) {
        console.error(`Database query error: ${sql}`, error);
        throw error;
    }
}
function queryOne(sql, params = []) {
    try {
        const rows = query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error("Database queryOne error:", error);
        throw error;
    }
}
function execute(sql, params = []) {
    if (!dbInstance)
        throw new Error("Database not initialized");
    try {
        dbInstance.run(sql, params);
        saveDb();
        return { changes: 1 };
    }
    catch (error) {
        console.error(`Database execute error: ${sql}`, error);
        throw error;
    }
}
