const AuditLog = require('../models/AuditLog');

const createAuditLog = async (req, action, description, targetEntity = null, targetId = null, metadata = {}) => {
  try {
    await AuditLog.create({
      user: req.session?.userId,
      userRole: req.session?.userRole || 'unknown',
      action,
      description,
      targetEntity,
      targetId,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      metadata
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

// Middleware to log requests
const auditMiddleware = (action, descriptionFn) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    res.json = async function(data) {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const description = typeof descriptionFn === 'function' 
          ? descriptionFn(req, data) 
          : descriptionFn;
        
        await createAuditLog(req, action, description, null, null, {
          responseStatus: res.statusCode
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = { createAuditLog, auditMiddleware };
