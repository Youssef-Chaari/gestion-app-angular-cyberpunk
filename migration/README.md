# MySQL → Firestore migration

Place a Firebase service account JSON file somewhere safe (not checked into git) and create a `.env` in this folder with:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=gestion_app
FIREBASE_SERVICE_ACCOUNT=./service-account.json
```

Install deps and run:

```bash
npm install
npm run migrate
```

This script will copy `categories`, `products`, `users`, `carts` (if present), and `orders` into Firestore collections of the same names.
