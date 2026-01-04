const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

const membersRoutes = require('./routes/members');
const memoriesRoutes = require('./routes/memories');
const mem0Routes = require('./routes/mem0');
const llmRoutes = require('./routes/llm');
const messagesRoutes = require('./routes/messages');
const tasksRoutes = require('./routes/tasks');
const systemRoutes = require('./routes/system');
const safaRoutes = require('./routes/safa');
const agentsRoutes = require('./routes/agents');
const missionRoutes = require('./routes/mission');
const voiceRoutes = require('./routes/voice');

// CORS - allow configured origins or all in dev
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting - 100 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.RATE_LIMIT || 100,
    message: { ok: false, error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

app.use(express.json());
app.use('/ui', express.static('public'));

app.use('/', systemRoutes);
app.use('/', mem0Routes);
app.use('/members', membersRoutes);
app.use('/memories', memoriesRoutes);
app.use('/messages', messagesRoutes);
app.use('/tasks', tasksRoutes);
app.use('/llm', llmRoutes);
app.use('/safa', safaRoutes);
app.use('/agents', agentsRoutes);
app.use('/mission', missionRoutes);
app.use('/voice', voiceRoutes);

module.exports = app;


