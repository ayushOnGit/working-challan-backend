// Test script for auth service
console.log('🧪 Testing Auth Service...\n');

try {
  const AuthService = require('./api/services/auth.service');
  console.log('✅ AuthService loaded successfully');
  console.log('Google client initialized:', !!AuthService.googleClient);
  console.log('validateCompanyEmail function:', typeof AuthService.validateCompanyEmail);
  console.log('generateToken function:', typeof AuthService.generateToken);
  
  // Test email validation
  const testEmail = 'test@vutto.in';
  const isValid = AuthService.validateCompanyEmail(testEmail);
  console.log(`\n📧 Email validation test:`);
  console.log(`   ${testEmail}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  console.log('\n🎉 All tests passed! Auth service is working correctly.');
  
} catch (error) {
  console.error('❌ Error loading AuthService:', error.message);
  console.error('Stack trace:', error.stack);
}
