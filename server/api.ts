import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB, getDBStatus } from './db.ts';
import { User } from './models/User.ts';
import { Conversion } from './models/Conversion.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'zendr_jwt_super_secret_key_2026';

// In-memory fallback if MongoDB connection is pending or offline
const memoryUsers: Map<string, any> = new Map();
const memoryConversions: any[] = [];

// Helper to verify JWT token from Authorization header
function verifyToken(authHeader?: string): { userId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function handleApiRequest(
  url: string,
  method: string,
  headers: Record<string, string | string[] | undefined>,
  body: any
): Promise<{ status: number; data: any }> {
  // Ensure DB connection is attempted
  await connectDB();
  const dbStatus = getDBStatus();

  const authHeader = (headers['authorization'] || headers['Authorization']) as string | undefined;

  // 1. GET /api/status - DB Status
  if (url === '/api/status' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        database: dbStatus,
        service: 'ZENDR Cloud Vault API'
      }
    };
  }

  // 1b. GET /api/system/capabilities - System environment & privacy guarantees
  if (url === '/api/system/capabilities' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        libreofficeAvailable: false,
        conversionEngines: ['mammoth', 'docx', 'xlsx', 'pdf-lib', 'pdfjs-dist'],
        maxUploadBytes: 50 * 1024 * 1024,
        privacyPolicy: 'Ephemeral in-memory processing only. User documents are never retained or indexed.',
        databaseStorage: 'Metadata-only in MongoDB Atlas when authenticated'
      }
    };
  }

  // 2. POST /api/auth/register - Sign up
  if (url === '/api/auth/register' && method === 'POST') {
    const { username, email, password } = body || {};
    if (!username || !email || !password) {
      return { status: 400, data: { error: 'Username, email and password are required.' } };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUser: any = null;

    if (dbStatus.isConnected) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return { status: 409, data: { error: 'An account with this email already exists.' } };
        }
        const newUser = await User.create({
          username: username.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });
        createdUser = { id: newUser._id.toString(), username: newUser.username, email: newUser.email };
      } catch (err: any) {
        console.error('Mongo register error:', err);
        return { status: 500, data: { error: err.message || 'Database registration failed.' } };
      }
    } else {
      // In-memory fallback
      if (memoryUsers.has(normalizedEmail)) {
        return { status: 409, data: { error: 'An account with this email already exists.' } };
      }
      const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      createdUser = { id, username: username.trim(), email: normalizedEmail, password: hashedPassword };
      memoryUsers.set(normalizedEmail, createdUser);
    }

    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      status: 201,
      data: {
        success: true,
        token,
        user: { id: createdUser.id, username: createdUser.username, email: createdUser.email },
        storageMode: dbStatus.isConnected ? 'mongodb' : 'local-memory'
      }
    };
  }

  // 3. POST /api/auth/login - Sign in
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    if (!email || !password) {
      return { status: 400, data: { error: 'Email and password are required.' } };
    }

    const normalizedEmail = email.toLowerCase().trim();
    let foundUser: any = null;

    if (dbStatus.isConnected) {
      try {
        const userDoc = await User.findOne({ email: normalizedEmail });
        if (!userDoc) {
          return { status: 401, data: { error: 'Invalid email or password.' } };
        }
        const isMatch = await bcrypt.compare(password, userDoc.password);
        if (!isMatch) {
          return { status: 401, data: { error: 'Invalid email or password.' } };
        }
        foundUser = { id: userDoc._id.toString(), username: userDoc.username, email: userDoc.email };
      } catch (err: any) {
        console.error('Mongo login error:', err);
        return { status: 500, data: { error: err.message || 'Database query failed.' } };
      }
    } else {
      // In-memory fallback
      const user = memoryUsers.get(normalizedEmail);
      if (!user) {
        return { status: 401, data: { error: 'Invalid email or password.' } };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { status: 401, data: { error: 'Invalid email or password.' } };
      }
      foundUser = { id: user.id, username: user.username, email: user.email };
    }

    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      status: 200,
      data: {
        success: true,
        token,
        user: { id: foundUser.id, username: foundUser.username, email: foundUser.email },
        storageMode: dbStatus.isConnected ? 'mongodb' : 'local-memory'
      }
    };
  }

  // 4. GET /api/auth/me - Current user details
  if (url === '/api/auth/me' && method === 'GET') {
    const payload = verifyToken(authHeader);
    if (!payload) {
      return { status: 401, data: { error: 'Unauthorized. Token missing or invalid.' } };
    }

    if (dbStatus.isConnected) {
      const userDoc = await User.findById(payload.userId).select('-password');
      if (userDoc) {
        return {
          status: 200,
          data: {
            user: { id: userDoc._id.toString(), username: userDoc.username, email: userDoc.email }
          }
        };
      }
    }

    return {
      status: 200,
      data: {
        user: { id: payload.userId, email: payload.email, username: payload.email.split('@')[0] }
      }
    };
  }

  // 5. GET /api/conversions - List user's conversions
  if (url === '/api/conversions' && method === 'GET') {
    const payload = verifyToken(authHeader);
    if (!payload) {
      return { status: 401, data: { error: 'Login required to access saved conversion history.' } };
    }

    if (dbStatus.isConnected) {
      try {
        const records = await Conversion.find({ userId: payload.userId })
          .sort({ createdAt: -1 })
          .limit(50);
        return {
          status: 200,
          data: {
            success: true,
            conversions: records,
            storageMode: 'mongodb'
          }
        };
      } catch (err: any) {
        console.error('Mongo fetch error:', err);
        return { status: 500, data: { error: err.message } };
      }
    } else {
      const userConversions = memoryConversions
        .filter((c) => c.userId === payload.userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return {
        status: 200,
        data: {
          success: true,
          conversions: userConversions,
          storageMode: 'local-memory'
        }
      };
    }
  }

  // 6. POST /api/conversions - Save a conversion record
  if (url === '/api/conversions' && method === 'POST') {
    const payload = verifyToken(authHeader);
    if (!payload) {
      return { status: 401, data: { error: 'Login required to save conversion to vault.' } };
    }

    const {
      mode,
      fileName,
      fileSizeBytes,
      outputSizeBytes,
      width,
      height,
      pathCount,
      executionTimeMs,
      previewSvgSnippet
    } = body || {};

    if (!fileName || !mode) {
      return { status: 400, data: { error: 'fileName and mode are required.' } };
    }

    const newRecordData = {
      userId: payload.userId,
      mode,
      fileName,
      fileSizeBytes: fileSizeBytes || 0,
      outputSizeBytes: outputSizeBytes || 0,
      width: width || 0,
      height: height || 0,
      pathCount: pathCount || 0,
      executionTimeMs: executionTimeMs || 0,
      previewSvgSnippet: (previewSvgSnippet || '').substring(0, 1500),
      createdAt: new Date(),
    };

    if (dbStatus.isConnected) {
      try {
        const doc = await Conversion.create(newRecordData);
        return { status: 201, data: { success: true, conversion: doc, storageMode: 'mongodb' } };
      } catch (err: any) {
        console.error('Mongo save error:', err);
        return { status: 500, data: { error: err.message } };
      }
    } else {
      const doc = {
        _id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...newRecordData
      };
      memoryConversions.push(doc);
      return { status: 201, data: { success: true, conversion: doc, storageMode: 'local-memory' } };
    }
  }

  // 7. DELETE /api/conversions/:id - Delete a conversion record
  if (url.startsWith('/api/conversions/') && method === 'DELETE') {
    const payload = verifyToken(authHeader);
    if (!payload) {
      return { status: 401, data: { error: 'Unauthorized.' } };
    }

    const id = url.split('/api/conversions/')[1];
    if (dbStatus.isConnected) {
      try {
        await Conversion.deleteOne({ _id: id, userId: payload.userId });
        return { status: 200, data: { success: true } };
      } catch (err: any) {
        return { status: 500, data: { error: err.message } };
      }
    } else {
      const idx = memoryConversions.findIndex((c) => c._id === id && c.userId === payload.userId);
      if (idx !== -1) memoryConversions.splice(idx, 1);
      return { status: 200, data: { success: true } };
    }
  }

  return { status: 404, data: { error: 'API route not found' } };
}
