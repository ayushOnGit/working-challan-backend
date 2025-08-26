// Test script for server startup
console.log('🧪 Testing Server Startup...\n');

// Set default environment variables for testing
process.env.NODE_ENV = 'development';
process.env.PORT = 3001; // Use different port for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = '1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = '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';

console.log('📋 Environment variables set:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');

console.log('\n🚀 Attempting to load express config...');

try {
  const express = require('./config/express');
  console.log('✅ Express config loaded successfully');
  
  console.log('\n🚀 Attempting to start server...');
  
  const server = express.listen(process.env.PORT, () => {
    console.log(`✅ Server started successfully on port ${process.env.PORT}`);
    console.log('🎉 Server startup test passed!');
    
    // Close server after successful test
    server.close(() => {
      console.log('🔒 Server closed successfully');
      process.exit(0);
    });
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Error loading express config:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
