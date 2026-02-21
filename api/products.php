<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id";
        $stmt = $pdo->query($query);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name) && !empty($data->price)) {
            $query = "INSERT INTO products (name, price, category_id) VALUES (:name, :price, :category_id)";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':price', $data->price);
            $stmt->bindParam(':category_id', $data->category_id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Product created", "id" => $pdo->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to create product"]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) {
            $query = "UPDATE products SET name = :name, price = :price, category_id = :category_id WHERE id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':price', $data->price);
            $stmt->bindParam(':category_id', $data->category_id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Product updated"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update product"]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Product deleted"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to delete product"]);
            }
        }
        break;
}
?>
