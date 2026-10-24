"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_js_1 = require("../db/mongodb.js");
const index_js_1 = require("../models/index.js");
async function runSeed() {
    console.log('Checking MongoDB Atlas course records...');
    await (0, mongodb_js_1.connectMongoDB)();
    const count = await index_js_1.CourseModel.countDocuments();
    console.log(`Current courses in MongoDB Atlas: ${count}`);
}
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
    runSeed().then(() => {
        console.log('Seed check complete.');
        process.exit(0);
    }).catch((err) => {
        console.error('Seed error:', err);
        process.exit(1);
    });
}
