const express = require('express');
const app = express();
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

var cors = require('cors');

app.use(cors());

app.use(express.json()); // Enables express to parse JSON bodies

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

// Temporary in-memory storage for demonstration
let userSecrets = {};


app.post('/user/register', async (req, res) => {
  console.log("In Register");
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const secret = authenticator.generateSecret();

  console.log("Secret: ", secret);
  // Store the secret using the email as a key
  userSecrets[email] = secret;

  const otpauth = authenticator.keyuri(email, 'YourServiceName', secret);

  try {
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    res.json({ email, qrCodeUrl, secret: process.env.NODE_ENV === 'development' ? secret : undefined });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error });
  }
});


app.post('/user/verify', (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: 'Email and token are required' });
  }

  // Retrieve the secret using the email as a key
  const secret = userSecrets[email];

  if (!secret) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const isValid = authenticator.verify({ token, secret });

    if (isValid) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
});


