const admin = require('firebase-admin');

// Ensure you define FIREBASE_SERVICE_ACCOUNT_BASE64 in your .env
// This should be the base64 encoded string of your serviceAccountKey.json
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.warn('⚠️ Firebase Admin not initialized: Missing or invalid FIREBASE_SERVICE_ACCOUNT_BASE64 in .env');
  }
} catch (error) {
  console.error('❌ Firebase Admin init error:', error.message);
}

module.exports = admin;
