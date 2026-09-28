import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

let dbInstance: SqlJsDatabase | null = null;
const dbDir = path.resolve(process.cwd(), "data");
const dbFilePath = path.join(dbDir, "lms.sqlite");

export async function getDb(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFilePath, buffer);
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error("Database not initialized");
  try {
    const stmt = dbInstance.prepare(sql);
    try {
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as unknown as T);
      }
      return rows;
    } finally {
      stmt.free();
    }
  } catch (error) {
    console.error(`Database query error: ${sql}`, error);
    throw error;
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  try {
    const rows = query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Database queryOne error:", error);
    throw error;
  }
}

export function execute(sql: string, params: any[] = []): { changes: number } {
  if (!dbInstance) throw new Error("Database not initialized");
  try {
    dbInstance.run(sql, params);
    saveDb();
    return { changes: 1 };
  } catch (error) {
    console.error(`Database execute error: ${sql}`, error);
    throw error;
  }
}
