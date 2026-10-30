import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SecurityEventModel } from '../models/SecurityEvent.js';
import { computeBlockHash } from '../utils/crypto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_2026_cybershield_ai';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Access token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User with this token no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT Auth Error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token'
    });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Log unauthorized attempt to Security Audit Logs
      const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const actorName = req.user ? req.user.name : 'Unauthenticated Guest';
      const actorRole = req.user ? req.user.role : 'None';

      const prevBlocks = await AuditLogModel.find();
      const lastBlock = prevBlocks[0];
      const prevHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
      const blockNum = lastBlock ? lastBlock.blockNumber + 1 : 1050;
      const now = new Date().toISOString();

      const details = `Access Denied: ${actorName} (${actorRole}) attempted forbidden action on ${req.originalUrl}`;
      const curHash = computeBlockHash({
        blockNumber: blockNum,
        timestamp: now,
        actor: `${actorName} (${actorRole})`,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        prevHash,
        details
      });

      await AuditLogModel.create({
        blockNumber: blockNum,
        timestamp: now,
        actor: {
          name: actorName,
          id: req.user?._id || 'ANONYMOUS',
          role: actorRole,
          ip
        },
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        severity: 'HIGH',
        prevHash,
        currentHash: curHash,
        tampered: false,
        details
      });

      await SecurityEventModel.create({
        timestamp: 'Just now',
        title: 'Unauthorized RBAC Boundary Violation',
        type: 'AUTH_FAILURE',
        severity: 'HIGH',
        description: details,
        resourceId: req.originalUrl,
        actor: actorName
      });

      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

