<?php
header('Content-Type: application/json');

$file = __DIR__ . '/appointments.txt';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo json_encode(file($file, FILE_IGNORE_NEW_LINES));
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = trim($_POST['booking_date'] ?? '');
    $time = trim($_POST['booking_time'] ?? '');
    $name = trim($_POST['name'] ?? 'N/A');
    $service = trim($_POST['service'] ?? 'N/A');
    $issue = trim($_POST['issue_description'] ?? 'N/A');

    if (empty($date) || empty($time)) {
        echo json_encode(["success" => false, "message" => "Error: Date or Time is missing."]);
        exit;
    }

    // 1. Check if file is writable
    if (file_exists($file) && !is_writable($file)) {
        echo json_encode(["success" => false, "message" => "Server Error: appointments.txt is not writable. Change permissions to 666."]);
        exit;
    }

    // 2. Check for double booking
    if (file_exists($file)) {
        $bookings = file($file, FILE_IGNORE_NEW_LINES);
        foreach ($bookings as $booking) {
            if (strpos($booking, "Date: $date | Time: $time") !== false) {
                echo json_encode(["success" => false, "message" => "This slot is already booked!"]);
                exit;
            }
        }
    }
    
    // 3. Save
    $logLine = "Date: $date | Time: $time | Name: $name | Service: $service | Issue: $issue" . PHP_EOL;
    if (file_put_contents($file, $logLine, FILE_APPEND)) {
        echo json_encode(["success" => true, "message" => "Appointment confirmed!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save file. Check directory permissions."]);
    }
    exit;
}
?>