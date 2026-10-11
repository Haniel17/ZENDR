import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

let connectionError: string | null = null;

export function getMongoUri(): string {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('127.0.0.1')) {
    return process.env.MONGODB_URI;
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^MONGODB_URI=(.*)$/m);
      if (match && match[1]) {
        const uri = match[1].trim();
        process.env.MONGODB_URI = uri;
        return uri;
      }
    }
  } catch {}

  return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zendr';
}

export async function connectDB(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = getMongoUri();

  // If the placeholder is still present, defer connection
  if (uri.includes('<db_password>')) {
    connectionError = 'Database password required. Please replace <db_password> in .env';
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 6000,
    });
    connectionError = null;
    const sanitizedUri = uri.replace(/:[^:]*@/, ':****@');
    console.log(`[MongoDB] Connected to database: ${sanitizedUri}`);
    return true;
  } catch (err: any) {
    connectionError = err.message || 'Failed to connect to MongoDB';
    console.warn(`[MongoDB Warning] Could not connect: ${connectionError}. In-memory fallback available.`);
    return false;
  }
}

export function getDBStatus() {
  const ready = mongoose.connection.readyState === 1;
  const uri = getMongoUri();
  const sanitizedUri = uri.replace(/:[^:]*@/, ':****@');
  return {
    isConnected: ready,
    uri: sanitizedUri,
    error: connectionError,
  };
}
