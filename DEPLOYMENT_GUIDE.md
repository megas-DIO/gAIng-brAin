# gAIng-brAin Deployment Guide

## 🔑 Required API Keys & Credentials

To fully deploy gAIng-brAin, you need the following API keys. This guide shows you where to get each one.

---

## ✅ CRITICAL SERVICES (Required)

### 1. **Supabase** - Database & Authentication
**What it does:** Primary database, authentication, and real-time subscriptions

**Get your keys:**
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Create a new project
4. Go to Project Settings → API
5. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** → `SUPABASE_ANON_KEY`

**Cost:** Free tier available (up to 500MB database, 2GB bandwidth/month)

---

## 🤖 LLM SERVICES (Choose at least one)

### Option A: **OpenAI** (Recommended)
**What it does:** Powers AI reasoning via GPT-4/GPT-4o

**Get your key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key → `OPENAI_API_KEY`

**Cost:** Pay-as-you-go. ~$0.01-0.03 per 1K tokens (GPT-4o-mini is cheapest)

**Recommended model:** `gpt-4o-mini` (fast and cheap) or `gpt-4o` (more capable)

### Option B: **Grok** (xAI)
**What it does:** Alternative LLM provider from xAI

**Get your key:**
1. Go to [https://console.x.ai](https://console.x.ai)
2. Sign in with X/Twitter account
3. Navigate to API Keys section
4. Create API key → `GROK_API_KEY`

**Cost:** Check xAI console for current pricing

### Option C: **Azure OpenAI**
**What it does:** Enterprise-grade OpenAI via Microsoft Azure

**Get your credentials:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create/navigate to Azure OpenAI resource
3. Go to Keys and Endpoint
4. Copy:
   - **KEY 1** → `AZURE_OPENAI_API_KEY`
   - **Endpoint** → `AZURE_OPENAI_ENDPOINT`
   - **Deployment name** → `AZURE_OPENAI_DEPLOYMENT`

**Cost:** Varies by region and usage. Requires Azure subscription.

---

## 🧠 OPTIONAL SERVICES (Enhance functionality)

### **Mem0** - Persistent AI Memory
**What it does:** Long-term memory management for AI agents

**Get your key:**
1. Go to [https://app.mem0.ai](https://app.mem0.ai)
2. Sign up for account
3. Navigate to API section
4. Generate API key → `MEM0_API_KEY`

**Cost:** Free tier available

### **Ngrok** - Public Tunneling
**What it does:** Exposes local server to internet (for webhooks, mobile testing)

**Get your token:**
1. Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Create free account
3. Go to "Your Authtoken"
4. Copy token → `NGROK_AUTHTOKEN`
5. Set `ENABLE_NGROK=1` in .env

**Cost:** Free tier available (1 tunnel, 40 connections/min)

---

## 🚀 Quick Setup Instructions

### Step 1: Configure Environment Variables

```bash
cd /home/user/gAIng-brAin

# Copy the example file
cp .env.example .env

# Edit with your real API keys
nano .env
```

### Step 2: Fill in Your API Keys

Update `.env` with your real values:

```bash
# CRITICAL - Replace these!
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-real-service-role-key-here
SUPABASE_ANON_KEY=your-real-anon-key-here

# Choose ONE LLM provider
LLM_PROVIDER=openai  # or 'grok' or 'azure'
OPENAI_API_KEY=sk-your-real-openai-key-here
OPENAI_MODEL=gpt-4o-mini

# Optional but recommended
MEM0_API_KEY=your-real-mem0-key-here

# Optional for public access
ENABLE_NGROK=1
NGROK_AUTHTOKEN=your-real-ngrok-token-here
```

### Step 3: Verify Configuration

```bash
# Check your configuration
node scripts/deploy-check.js

# Should show all ✅ green checkmarks
```

### Step 4: Initialize Database

```bash
# Initialize local SQLite DB
npm run init:local-db

# Test Supabase connection
npm run health:db

# Seed initial data
npm run seed:members
```

### Step 5: Deploy!

#### Option A: Standard Deployment
```bash
# Start backend server
npm start

# In another terminal, start frontend
npm run frontend

# Access at:
# - Backend: http://localhost:8080
# - Frontend: http://localhost:5173
```

#### Option B: Docker Deployment (if Docker available)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f brain

# Access at:
# - Backend: http://localhost:8080
# - Redis: localhost:6379
```

#### Option C: Full Production Stack
```bash
# With monitoring and nginx
docker-compose --profile production --profile monitoring up -d

# Access:
# - Backend: http://localhost:80 (nginx)
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090
```

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl http://localhost:8080/health
# Should return: {"status":"healthy", ...}
```

### 2. Test LLM Service
```bash
curl -X POST http://localhost:8080/llm/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### 3. Test Memory System
```bash
curl http://localhost:8080/memories \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"
```

### 4. Run Full Test Suite
```bash
npm test
```

---

## 💰 Cost Estimation

**Minimal Setup (Free Tier):**
- Supabase: $0/month (free tier)
- OpenAI: ~$1-5/month (light usage with gpt-4o-mini)
- Mem0: $0/month (free tier)
- **Total: ~$1-5/month**

**Production Setup:**
- Supabase: $25/month (Pro plan)
- OpenAI: $50-200/month (depends on usage)
- Mem0: $20/month (Pro plan)
- Azure/Hosting: $50-100/month
- **Total: ~$145-345/month**

---

## 🔒 Security Best Practices

1. **Never commit .env to git** (already in .gitignore)
2. **Use environment-specific keys** (dev vs production)
3. **Rotate keys regularly** (every 90 days)
4. **Enable Supabase RLS** (Row Level Security)
5. **Use HTTPS in production** (nginx with Let's Encrypt)
6. **Monitor API usage** to detect anomalies
7. **Set rate limits** on all endpoints

---

## 📊 Monitoring & Health

After deployment, monitor these endpoints:

- **Health:** `http://localhost:8080/health`
- **System:** `http://localhost:8080/system`
- **Analytics:** `http://localhost:8080/analytics`
- **Grafana:** `http://localhost:3000` (if monitoring enabled)

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Verify SUPABASE_URL is correct
- Check if service_role_key is valid
- Ensure internet connection is active

### "LLM request failed"
- Verify API key is correct
- Check you have credits/quota remaining
- Try different model (e.g., gpt-4o-mini instead of gpt-4)

### "Port 8080 already in use"
- Change PORT in .env
- Kill existing process: `kill $(lsof -t -i:8080)`

### "Frontend not loading"
- Run `npm run frontend:build`
- Check `public/vision-pwa/` exists
- Verify backend is running first

---

## 📞 Need Help?

- **Documentation:** `/docs/` folder
- **Issues:** Create GitHub issue
- **Community:** Check Discord (if available)

---

## 🎯 Next Steps After Deployment

1. **Configure agents:** Edit agent configs in `src/workers/`
2. **Set up missions:** Use `/mission` API endpoints
3. **Enable voice:** Configure Alexa skill (optional)
4. **Add plugins:** Create custom plugins in `plugins/`
5. **Scale up:** Move to production hosting (AWS, GCP, Azure)

---

**Ready to deploy?** Follow the steps above and get your gAIng-brAin online! 🚀
