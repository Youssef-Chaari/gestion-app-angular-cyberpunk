// Add stock field to all products in Firestore
// Usage: node add-stock.js
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

async function main() {
  const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '../serviceaccountkey.json';

  if (!fs.existsSync(FIREBASE_SERVICE_ACCOUNT)) {
    console.error('Service account file not found at', FIREBASE_SERVICE_ACCOUNT);
    process.exit(1);
  }

  const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  try {
    const snapshot = await db.collection('products').get();
    console.log(`Found ${snapshot.size} products`);
    
    let updated = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Add stock if not present (default 50)
      if (data.stock === undefined || data.stock === null) {
        await doc.ref.update({ stock: 50 });
        updated++;
      }
    }
    
    console.log(`Updated ${updated} products with default stock of 50`);
  } catch (e) {
    console.error('Error updating products:', e.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
