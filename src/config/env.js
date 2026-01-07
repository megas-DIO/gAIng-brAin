const path = require('path');
require('dotenv').config();

// ============================================================================
// PROJECT VIBRANIUM: Portable Path Configuration
// ============================================================================
// Support for portable USB drive deployment ("The Phylactery")
// Paths are derived from VISION_ROOT environment variable if set by WAKE scripts

const VISION_ROOT = process.env.VISION_ROOT || path.resolve(__dirname, '../..');
const VISION_DATA = process.env.VISION_DATA || path.join(VISION_ROOT, 'data');
const VISION_DROP = process.env.VISION_DROP || path.join(VISION_ROOT, 'drop');
const VISION_LOGS = process.env.VISION_LOGS || path.join(VISION_ROOT, 'logs');
const VISION_CORE = process.env.VISION_CORE || path.join(VISION_ROOT, 'src');
const VISION_BIN = process.env.VISION_BIN || path.join(VISION_ROOT, 'bin');

// Detect if running in portable mode
const IS_PORTABLE = !!process.env.VISION_ROOT;
const IS_ONLINE = process.env.VISION_ONLINE !== 'false';
const GPU_AVAILABLE = process.env.VISION_GPU_AVAILABLE || 'none';

// ============================================================================
// API Keys and Service Configuration
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;
const ENABLE_NGROK = process.env.ENABLE_NGROK === '1';
const GAING_SHARED_TOKEN = process.env.GAING_SHARED_TOKEN;
const MEM0_API_KEY = process.env.MEM0_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || null;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';
const DISABLE_AUTH = process.env.DISABLE_AUTH === '1';
const PORT = process.env.PORT || 8080;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

module.exports = {
  // Portable paths (VIBRANIUM)
  VISION_ROOT,
  VISION_DATA,
  VISION_DROP,
  VISION_LOGS,
  VISION_CORE,
  VISION_BIN,
  IS_PORTABLE,
  IS_ONLINE,
  GPU_AVAILABLE,

  // API Keys and Services
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  NGROK_AUTHTOKEN,
  ENABLE_NGROK,
  GAING_SHARED_TOKEN,
  MEM0_API_KEY,
  GROK_API_KEY,
  PERPLEXITY_API_KEY,
  LLM_PROVIDER,
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_MODEL,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION,
  DISABLE_AUTH,
  PORT,
  supabaseKey
};
