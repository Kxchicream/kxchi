<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Appointment Records</title>
    <style>
        body { background-color: #0f172a; color: #e2e8f0; font-family: 'Inter', sans-serif; padding: 20px; }
        h2 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .record-card { 
            background: #1e293b; border-left: 4px solid #3b82f6; 
            padding: 15px; margin-bottom: 10px; border-radius: 4px;
        }
        .record-card b { color: #60a5fa; }
    </style>
</head>
<body>
    <h2>Current Appointment Records</h2>
    <?php
    if (file_exists('appointments.txt')) {
        $lines = file('appointments.txt', FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            // This assumes your data is separated by " | "
            $parts = explode(" | ", $line);
            echo "<div class='record-card'>";
            foreach($parts as $part) {
                echo "<div>" . htmlspecialchars($part) . "</div>";
            }
            echo "</div>";
        }
    } else {
        echo "<p>No appointments found yet.</p>";
    }
    ?>
</body>
</html>