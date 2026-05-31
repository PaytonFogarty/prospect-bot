require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const pipelineRoutes = require('./routes/pipeline');
const billingRoutes = require('./routes/billing');
const crmRoutes = require('./routes/crm');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = [
  'https://mindful-charm-production-81c7.up.railway.app',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
// Stripe webhook needs the raw request body to verify signatures — must come before express.json()
app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/customer', customerRoutes);
app.use('/pipeline', pipelineRoutes);
app.use('/billing', billingRoutes);
app.use('/crm', crmRoutes);

app.listen(PORT, () => {
  console.log(`Revara server running on port ${PORT}`);
});
