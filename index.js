const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-booking-key-change-me';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const TOKEN_TTL_MINUTES = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const VALID_EVENTS = new Set(['DANDIA_NIGHT', 'TEDX']);

function signBookingToken(phoneNumber, eventType) {
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  return jwt.sign(
    {
      phoneNumber,
      eventType,
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    JWT_SECRET
  );
}

function verifyBookingToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') return { expired: true };
    return null;
  }
}

app.get('/', (req, res) => {
  res.render('home', { baseUrl: BASE_URL });
});

app.post('/api/generate-url', (req, res) => {
  const { whatsappNumber, eventType } = req.body || {};

  const phone = String(whatsappNumber ?? '').trim();

  if (!/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({
      error: 'A valid WhatsApp number is required.',
    });
  }

  if (!eventType || !VALID_EVENTS.has(eventType)) {
    return res.status(400).json({
      error: 'eventType must be DANDIA_NIGHT or TEDX.',
    });
  }

  const token = signBookingToken(phone, eventType);

  res.json({
    booking_url: `https://gla-event-booking.onrender.com/booking/${token}`,
  });
});

app.get('/booking/:token', (req, res) => {
  const decoded = verifyBookingToken(req.params.token);
  if (!decoded) {
    return res.status(400).render('error', { message: 'Invalid or malformed booking link.' });
  }
  if (decoded.expired) {
    return res.status(410).render('expired', { eventType: null });
  }

  const { eventType, phoneNumber, exp } = decoded;
  const expiresAt = new Date(exp * 1000);

  if (eventType === 'DANDIA_NIGHT') {
    return res.render('dandia', { phoneNumber, expiresAt: expiresAt.toISOString() });
  }
  if (eventType === 'TEDX') {
    return res.render('tedx', { phoneNumber, expiresAt: expiresAt.toISOString() });
  }
  res.status(400).render('error', { message: 'Unknown event type in token.' });
});

app.post('/pay-for-event', async (req, res) => {
  try {
    const { destination, event } = req.body;

    const response = await fetch(
      'https://backend.bigbrosai.com/api/v1/campaign/api-campaign',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bigbrosai-api-key': `live_8439331da5e14f878a5b26378fb58411`,
        },
        body: JSON.stringify({
          destination,
          "attributes": {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFKpOVnbiAY9YJ6Z6LWBerqnaQR3sUrqRj06tHb954AQ&s=10",
            "orderId": "ORD-1001",
            "productName": event,
            "retailerId": "SKU-PLAN-01",
            "quantity": "1",
            "amount": "1"
          },
          campaignId: '6a493cfc93241813f6b0d343',
        }),
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to trigger campaign',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Event booking server running at ${BASE_URL}`);
});
