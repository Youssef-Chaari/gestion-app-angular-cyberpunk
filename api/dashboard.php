<?php
require_once 'db.php';

$stats = [];

// Total produits
$stmt = $pdo->query("SELECT COUNT(*) as total FROM products");
$stats['total_products'] = $stmt->fetch()['total'];

// Total commandes
$stmt = $pdo->query("SELECT COUNT(*) as total FROM orders");
$stats['total_orders'] = $stmt->fetch()['total'];

// Revenus par mois (Simulé ou basé sur orders)
$stmt = $pdo->query("SELECT DATE_FORMAT(order_date, '%Y-%m') as month, SUM(total_amount) as revenue FROM orders GROUP BY month ORDER BY month DESC LIMIT 6");
$stats['revenue_by_month'] = $stmt->fetchAll();

// Produits par catégorie (pour Pie Chart)
$stmt = $pdo->query("SELECT c.name, COUNT(p.id) as count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.name");
$stats['products_by_category'] = $stmt->fetchAll();

echo json_encode($stats);
?>
