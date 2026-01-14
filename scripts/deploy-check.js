#!/usr/bin/env node

/**
 * Deployment Check Script
 * Validates environment configuration and checks service readiness
 */

require('dotenv').config();

const requiredEnvVars = {
  critical: [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  llm: [
    'OPENAI_API_KEY',
    'GROK_API_KEY',
    'AZURE_OPENAI_API_KEY',
  ],
  optional: [
    'MEM0_API_KEY',
    'NGROK_AUTHTOKEN',
  ]
};

function checkEnvVar(name) {
  const value = process.env[name];
  const exists = !!value && value !== '' && !value.includes('placeholder');
  return { name, value: exists ? '✅ Configured' : '❌ Missing/Placeholder', exists };
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         gAIng-brAin Deployment Configuration Check        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Critical Services
console.log('🔴 CRITICAL SERVICES (Required for deployment):');
console.log('─'.repeat(60));
let criticalOk = true;
requiredEnvVars.critical.forEach(envVar => {
  const result = checkEnvVar(envVar);
  console.log(`  ${result.value} ${result.name}`);
  if (!result.exists) criticalOk = false;
});

// LLM Services (at least one required)
console.log('\n🟡 LLM SERVICES (At least one required):');
console.log('─'.repeat(60));
let llmOk = false;
requiredEnvVars.llm.forEach(envVar => {
  const result = checkEnvVar(envVar);
  console.log(`  ${result.value} ${result.name}`);
  if (result.exists) llmOk = true;
});

// Optional Services
console.log('\n🟢 OPTIONAL SERVICES:');
console.log('─'.repeat(60));
requiredEnvVars.optional.forEach(envVar => {
  const result = checkEnvVar(envVar);
  console.log(`  ${result.value} ${result.name}`);
});

// Server Configuration
console.log('\n⚙️  SERVER CONFIGURATION:');
console.log('─'.repeat(60));
console.log(`  Port: ${process.env.PORT || 8080}`);
console.log(`  Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
console.log(`  Ngrok Enabled: ${process.env.ENABLE_NGROK === '1' ? 'Yes' : 'No'}`);

// Deployment Status
console.log('\n📊 DEPLOYMENT STATUS:');
console.log('─'.repeat(60));

if (criticalOk && llmOk) {
  console.log('  ✅ Ready for PRODUCTION deployment');
  console.log('  ✅ All critical services configured');
  console.log('  ✅ LLM service available');
  process.exit(0);
} else {
  console.log('  ⚠️  Configuration INCOMPLETE');
  if (!criticalOk) {
    console.log('  ❌ Missing critical services (Supabase)');
  }
  if (!llmOk) {
    console.log('  ❌ No LLM service configured');
  }
  console.log('\n📖 Next Steps:');
  console.log('  1. Copy .env.example to .env');
  console.log('  2. Fill in your API keys in .env');
  console.log('  3. Run this script again to verify');
  console.log('  4. Start deployment with: npm start');
  process.exit(1);
}
