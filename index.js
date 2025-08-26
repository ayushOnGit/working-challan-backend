// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const app = require('./config/express');

// Initialize RBAC system when server starts
const initializeRBACOnStartup = async () => {
  try {
    console.log('🚀 Initializing RBAC system on startup...');
    const AuthService = require('./api/services/auth.service');
    await AuthService.initializeRBAC();
    console.log('✅ RBAC system initialized successfully on startup');
    
    // Ensure default admin user exists
    console.log('🔧 Ensuring default admin user exists...');
    await AuthService.ensureDefaultAdmin();
    console.log('✅ Default admin user ensured');
    
  } catch (error) {
    console.error('❌ Failed to initialize RBAC on startup:', error.message);
    // Don't crash the server, just log the error
  }
};

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.info(`server started on port ${port} (${env})`);
        // Initialize RBAC after server starts
        initializeRBACOnStartup();
    });
}

module.exports = app;
