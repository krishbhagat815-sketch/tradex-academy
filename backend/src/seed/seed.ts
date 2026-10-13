import dotenv from 'dotenv';
dotenv.config();
import { connectMongoDB } from '../db/mongodb.js';
import { CourseModel } from '../models/index.js';

export async function runSeed() {
  console.log('Checking MongoDB Atlas course records...');
  await connectMongoDB();
  const count = await CourseModel.countDocuments();
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
