import mongoose from "mongoose";
import { ensureAdminFromEnv } from "@/lib/ensure-admin";

interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
declare global { // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}
const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI — add your MongoDB Atlas connection string to .env.local");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, { bufferCommands: false, maxPoolSize: 10 });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  await ensureAdminFromEnv();
  return cache.conn;
}
export default connectDB;
