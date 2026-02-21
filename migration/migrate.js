// Migration script: MySQL -> Firestore
// Usage: create a .env file with MYSQL_* and FIREBASE_SERVICE_ACCOUNT variables, then run `npm run migrate` in this folder.
require('dotenv').config();
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
const fs = require('fs');

async function main() {
  const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    FIREBASE_SERVICE_ACCOUNT
  } = process.env;

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    console.error('Missing MySQL environment variables. Please create a .env with MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
    process.exit(1);
  }

  if (!FIREBASE_SERVICE_ACCOUNT) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT env. Set path to service account JSON file.');
    process.exit(1);
  }

  if (!fs.existsSync(FIREBASE_SERVICE_ACCOUNT)) {
    console.error('Service account file not found at', FIREBASE_SERVICE_ACCOUNT);
    process.exit(1);
  }

  const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  });

  console.log('Connected to MySQL, starting migration...');

  // Migrate categories
  try {
    const [cats] = await conn.query('SELECT * FROM categories');
    console.log(`Found ${cats.length} categories`);
    for (const c of cats) {
      const id = String(c.id);
      const data = { name: c.name };
      await db.collection('categories').doc(id).set(data);
    }
  } catch (e) {
    console.warn('Skipping categories:', e.message);
  }

  // Migrate products
  try {
    const [prods] = await conn.query('SELECT * FROM products');
    console.log(`Found ${prods.length} products`);
    for (const p of prods) {
      const id = String(p.id);
      const data = Object.assign({}, p);
      // rename category_id to categoryId
      if (data.category_id !== undefined) {
        data.categoryId = data.category_id;
        delete data.category_id;
      }
      await db.collection('products').doc(id).set(data);
    }
  } catch (e) {
    console.warn('Skipping products:', e.message);
  }

  // Migrate users (note: passwords are copied into `legacyPassword` field)
  try {
    const [users] = await conn.query('SELECT id, username, email, password, role, created_at FROM users');
    console.log(`Found ${users.length} users`);
    for (const u of users) {
      const id = String(u.id);
      const data = {
        username: u.username,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.created_at || null,
        legacyPassword: u.password || null
      };
      await db.collection('users').doc(id).set(data);
    }
  } catch (e) {
    console.warn('Skipping users:', e.message);
  }

  // Migrate carts if table exists
  try {
    const [tables] = await conn.query("SHOW TABLES LIKE 'cart' OR 'carts' OR 'order_items'");
    // attempt to read carts table
    let cartsFound = false;
    try {
      const [carts] = await conn.query('SELECT * FROM cart');
      cartsFound = true;
      console.log(`Found ${carts.length} cart rows`);
      // group by user_id
      const map = {};
      for (const row of carts) {
        const uid = String(row.user_id || row.userId || 'unknown');
        map[uid] = map[uid] || { items: [] };
        map[uid].items.push(row);
      }
      for (const uid of Object.keys(map)) {
        await db.collection('carts').doc(uid).set(map[uid]);
      }
    } catch (_e) {
      // try plural
      try {
        const [carts2] = await conn.query('SELECT * FROM carts');
        cartsFound = true;
        console.log(`Found ${carts2.length} cart rows`);
        const map = {};
        for (const row of carts2) {
          const uid = String(row.user_id || row.userId || 'unknown');
          map[uid] = map[uid] || { items: [] };
          map[uid].items.push(row);
        }
        for (const uid of Object.keys(map)) {
          await db.collection('carts').doc(uid).set(map[uid]);
        }
      } catch (e2) {
        if (!cartsFound) console.warn('No cart table found, skipping carts');
      }
    }
  } catch (e) {
    console.warn('Skipping carts detection:', e.message);
  }

  // Migrate orders and order items
  try {
    const [orders] = await conn.query('SELECT * FROM orders');
    console.log(`Found ${orders.length} orders`);
    // attempt to fetch order_items
    let orderItemsMap = {};
    try {
      const [ois] = await conn.query('SELECT * FROM order_items');
      for (const oi of ois) {
        const oid = String(oi.order_id || oi.orderId);
        orderItemsMap[oid] = orderItemsMap[oid] || [];
        orderItemsMap[oid].push(oi);
      }
    } catch (_e) {
      // no order_items table
    }

    for (const o of orders) {
      const id = String(o.id);
      const data = Object.assign({}, o);
      data.items = orderItemsMap[id] || [];
      await db.collection('orders').doc(id).set(data);
    }
  } catch (e) {
    console.warn('Skipping orders:', e.message);
  }

  console.log('Migration complete.');
  await conn.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
