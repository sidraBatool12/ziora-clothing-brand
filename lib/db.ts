import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI — add your MongoDB Atlas connection string to .env.local");
}

interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
declare global { // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}
const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, { bufferCommands: false, maxPoolSize: 10 });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
export default connectDB;
