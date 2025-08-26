// Test script for Google OAuth integration
const { OAuth2Client } = require('google-auth-library');

console.log('🧪 Testing Google OAuth Integration...\n');

// Test 1: Initialize OAuth Client
try {
  const client = new OAuth2Client(
    '1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com'
  );
  console.log('✅ Test 1: OAuth Client initialized successfully');
  console.log('   Client ID:', '1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com');
} catch (error) {
  console.log('❌ Test 1: OAuth Client initialization failed');
  console.log('   Error:', error.message);
}

// Test 2: Validate Company Email
const validateCompanyEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return email.toLowerCase().endsWith('@vutto.in');
};

const testEmails = [
  'user@vutto.in',
  'admin@vutto.in',
  'fake@vutto.com',
  'test@gmail.com',
  'vutto@company.org'
];

console.log('\n✅ Test 2: Company Email Validation');
testEmails.forEach(email => {
  const isValid = validateCompanyEmail(email);
  console.log(`   ${email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Test 3: Check Environment Variables
console.log('\n✅ Test 3: Environment Variables Check');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ Not set');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');

console.log('\n🎯 Next Steps:');
console.log('   1. Create .env file with your credentials');
console.log('   2. Run: node initialize-rbac.js');
console.log('   3. Start your backend server');
console.log('   4. Test Google OAuth login in frontend');

console.log('\n📝 Sample .env file:');
console.log('   GOOGLE_CLIENT_ID="1015139019509-na1airmo1cqvjt82mm8kjr5uc7goaf8f.apps.googleusercontent.com"');
console.log('   GOOGLE_CLIENT_SECRET="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"');
console.log('   JWT_SECRET="your-super-secret-jwt-key-here"');
console.log('   DATABASE_URL="your-database-connection-string"');
