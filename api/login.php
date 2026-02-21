<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $query = "SELECT * FROM users WHERE email = :email";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    $user = $stmt->fetch();

    if ($user && password_verify($data->password, $user['password'])) {
        unset($user['password']);
        echo json_encode([
            "message" => "Login successful",
            "user" => $user,
            "token" => "fake-jwt-token-for-demo" // In a real app, generate a real JWT
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
?>
