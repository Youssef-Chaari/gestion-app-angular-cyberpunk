<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $query = "SELECT * FROM categories";
        $stmt = $pdo->query($query);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->name)) {
            $query = "INSERT INTO categories (name) VALUES (:name)";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':name', $data->name);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Category created", "id" => $pdo->lastInsertId()]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id) && !empty($data->name)) {
            $query = "UPDATE categories SET name = :name WHERE id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':name', $data->name);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Category updated"]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $query = "DELETE FROM categories WHERE id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Category deleted"]);
            }
        }
        break;
}
?>
