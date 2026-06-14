<?php
// 1. Force the server to show us the actual error instead of a 500 blank page
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

    // 2. Safely handle file creation if it doesn't exist
    if (!file_exists($file)) {
        if (!touch($file)) {
            echo json_encode(["success" => false, "message" => "Server Error: Cannot create appointments.txt. Check folder permissions."]);
            exit;
        }
    }

    // 3. Check if file is writable
    if (!is_writable($file)) {
        echo json_encode(["success" => false, "message" => "Server Error: appointments.txt is not writable. Change permissions to 666 or 777."]);
        exit;
    }

    // 4. Check for double booking
    $bookings = file($file, FILE_IGNORE_NEW_LINES);
    foreach ($bookings as $booking) {
        if (strpos($booking, "Date: $date | Time: $time") !== false) {
            echo json_encode(["success" => false, "message" => "This slot is already booked!"]);
            exit;
        }
    }
    
    // 5. Save
    $logLine = "Date: $date | Time: $time | Name: $name | Service: $service | Issue: $issue" . PHP_EOL;
    if (file_put_contents($file, $logLine, FILE_APPEND)) {
        echo json_encode(["success" => true, "message" => "Appointment confirmed!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to write to file. Contact admin."]);
    }
    exit;
}
?>