# 🐘 API Backend - Documentation

API PHP native pour l'application Gestion App.

## 📋 Vue d'ensemble

L'API utilise :
- **PHP 7.4+**
- **PDO** pour l'accès à la base de données
- **JSON** pour les réponses
- **CORS** pour les requêtes cross-origin

---

## 🔧 Configuration

### Fichier : `db.php`

Connexion à la base de données MySQL avec PDO.

```php
$host = 'localhost';
$db_name = 'gestion_app';
$username = 'root';
$password = '';
```

**Modifier ces valeurs selon votre configuration XAMPP.**

---

## 📡 Endpoints

### 1. Authentification

#### Login
```
POST /api/login.php
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Réponse (200)**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "fake-jwt-token-for-demo"
}
```

**Erreur (401)**
```json
{
  "message": "Invalid credentials"
}
```

---

#### Register
```
POST /api/register.php
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Réponse (200)**
```json
{
  "message": "User registered successfully"
}
```

---

### 2. Produits

#### Lister tous les produits
```
GET /api/products.php
```

**Réponse**
```json
[
  {
    "id": 1,
    "name": "Smartphone",
    "price": 699.99,
    "category_id": 1,
    "category_name": "Électronique"
  },
  {
    "id": 2,
    "name": "Laptop",
    "price": 1200.00,
    "category_id": 1,
    "category_name": "Électronique"
  }
]
```

---

#### Créer un produit
```
POST /api/products.php
Content-Type: application/json

{
  "name": "Tablette",
  "price": 499.99,
  "category_id": 1
}
```

**Réponse (200)**
```json
{
  "message": "Product created",
  "id": 5
}
```

---

#### Modifier un produit
```
PUT /api/products.php
Content-Type: application/json

{
  "id": 1,
  "name": "Smartphone Pro",
  "price": 799.99,
  "category_id": 1
}
```

**Réponse (200)**
```json
{
  "message": "Product updated"
}
```

---

#### Supprimer un produit
```
DELETE /api/products.php?id=1
```

**Réponse (200)**
```json
{
  "message": "Product deleted"
}
```

---

### 3. Catégories

#### Lister toutes les catégories
```
GET /api/categories.php
```

**Réponse**
```json
[
  {
    "id": 1,
    "name": "Électronique"
  },
  {
    "id": 2,
    "name": "Vêtements"
  }
]
```

---

#### Créer une catégorie
```
POST /api/categories.php
Content-Type: application/json

{
  "name": "Livres"
}
```

**Réponse (200)**
```json
{
  "message": "Category created",
  "id": 4
}
```

---

#### Modifier une catégorie
```
PUT /api/categories.php
Content-Type: application/json

{
  "id": 1,
  "name": "Électronique & Informatique"
}
```

**Réponse (200)**
```json
{
  "message": "Category updated"
}
```

---

#### Supprimer une catégorie
```
DELETE /api/categories.php?id=1
```

**Réponse (200)**
```json
{
  "message": "Category deleted"
}
```

---

### 4. Dashboard

#### Obtenir les statistiques
```
GET /api/dashboard.php
```

**Réponse**
```json
{
  "total_products": 4,
  "total_orders": 2,
  "revenue_by_month": [
    {
      "month": "2026-02",
      "revenue": 450.00
    },
    {
      "month": "2026-01",
      "revenue": 719.98
    }
  ],
  "products_by_category": [
    {
      "name": "Électronique",
      "count": 2
    },
    {
      "name": "Vêtements",
      "count": 1
    },
    {
      "name": "Maison",
      "count": 1
    }
  ]
}
```

---

## 🔐 Sécurité

### Mesures implémentées

1. **Hachage des mots de passe**
   ```php
   $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
   ```

2. **Prepared Statements (PDO)**
   ```php
   $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
   $stmt->bindParam(':email', $data->email);
   ```

3. **CORS Headers**
   ```php
   header("Access-Control-Allow-Origin: *");
   header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
   ```

4. **JSON Response**
   ```php
   header("Content-Type: application/json; charset=UTF-8");
   ```

---

## 🧪 Test avec cURL

### Exemple : Connexion
```bash
curl -X POST http://localhost/gestion-app/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Exemple : Lister les produits
```bash
curl http://localhost/gestion-app/api/products.php
```

### Exemple : Créer un produit
```bash
curl -X POST http://localhost/gestion-app/api/products.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Nouveau produit","price":99.99,"category_id":1}'
```

---

## 📊 Codes de réponse HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 400 | Données incomplètes |
| 401 | Non authentifié |
| 500 | Erreur serveur |

---

## 🔄 Flux de requête

```
Client (Angular)
    ↓
Interceptor HTTP (Ajoute le token)
    ↓
API PHP
    ↓
Vérification des données
    ↓
Requête PDO (Prepared Statement)
    ↓
MySQL
    ↓
Réponse JSON
    ↓
Client (Angular)
```

---

## 📝 Notes

- Tous les mots de passe sont hashés avec bcrypt
- Les tokens sont simulés (à implémenter en production)
- Les erreurs retournent des messages JSON
- Les dates sont au format YYYY-MM-DD

---

## 🚀 Déploiement

Pour déployer en production :

1. Modifier les identifiants MySQL dans `db.php`
2. Activer HTTPS
3. Implémenter JWT réel
4. Ajouter rate limiting
5. Ajouter logging des erreurs
6. Configurer les variables d'environnement

---

## 🐛 Dépannage

### Erreur : "Connection failed"
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `db.php`

### Erreur : "CORS error"
- Les en-têtes CORS sont configurés dans `db.php`
- Vérifiez l'origine de la requête

### Erreur : "JSON parse error"
- Vérifiez que le Content-Type est `application/json`
- Vérifiez le format JSON de la requête

---

## 📚 Ressources

- [Documentation PHP](https://www.php.net/)
- [Documentation PDO](https://www.php.net/manual/en/book.pdo.php)
- [Documentation MySQL](https://dev.mysql.com/doc/)

---

**Bon développement !** 🎉
