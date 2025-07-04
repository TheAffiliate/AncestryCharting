<?php
/**
 * PayFast Instant Transaction Notification (ITN) Handler
 * This script handles payment notifications from PayFast
 */

// PayFast configuration
$merchant_id = '10000100'; // Replace with your PayFast merchant ID
$merchant_key = 'q1cd2rdny4a53jpmxkmgd6rmd'; // Replace with your PayFast merchant key
$passphrase = 'payfast'; // Replace with your PayFast passphrase
$sandbox = true; // Set to false for production

// PayFast hosts
$valid_hosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za'
];

// Log file for debugging
$log_file = 'payfast_notifications.log';

function logMessage($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

function validatePayFastNotification($postData, $passphrase = '') {
    // Create parameter string
    $pfParamString = '';
    foreach ($postData as $key => $val) {
        if ($key !== 'signature') {
            $pfParamString .= $key . '=' . urlencode($val) . '&';
        }
    }
    
    // Remove last ampersand
    $pfParamString = substr($pfParamString, 0, -1);
    
    // Add passphrase if set
    if (!empty($passphrase)) {
        $pfParamString .= '&passphrase=' . urlencode($passphrase);
    }
    
    // Calculate signature
    $signature = md5($pfParamString);
    
    return $signature === $postData['signature'];
}

function verifyPayFastHost() {
    global $valid_hosts;
    $referrer = $_SERVER['HTTP_REFERER'] ?? '';
    
    foreach ($valid_hosts as $host) {
        if (strpos($referrer, $host) !== false) {
            return true;
        }
    }
    
    return false;
}

// Start processing
try {
    logMessage('PayFast ITN received');
    
    // Get POST data
    $postData = $_POST;
    
    if (empty($postData)) {
        logMessage('No POST data received');
        http_response_code(400);
        exit('Bad Request');
    }
    
    logMessage('POST data: ' . json_encode($postData));
    
    // Verify signature
    if (!validatePayFastNotification($postData, $passphrase)) {
        logMessage('Invalid signature');
        http_response_code(400);
        exit('Invalid signature');
    }
    
    logMessage('Signature validation passed');
    
    // Verify PayFast host (optional but recommended)
    if (!verifyPayFastHost()) {
        logMessage('Invalid referrer host');
        // Uncomment the next two lines if you want strict host validation
        // http_response_code(400);
        // exit('Invalid host');
    }
    
    // Process the payment notification
    $payment_status = $postData['payment_status'] ?? '';
    $payment_id = $postData['pf_payment_id'] ?? '';
    $amount = $postData['amount_gross'] ?? '';
    $item_name = $postData['item_name'] ?? '';
    $email = $postData['email_address'] ?? '';
    $name_first = $postData['name_first'] ?? '';
    $name_last = $postData['name_last'] ?? '';
    
    logMessage("Payment ID: $payment_id, Status: $payment_status, Amount: $amount");
    
    switch ($payment_status) {
        case 'COMPLETE':
            // Payment successful
            logMessage("Payment completed successfully for $email");
            
            // Here you would typically:
            // 1. Update your database with payment confirmation
            // 2. Send confirmation email to customer
            // 3. Trigger service fulfillment process
            // 4. Log the successful transaction
            
            // Example database update (you'll need to implement your own database logic)
            /*
            $pdo = new PDO('mysql:host=localhost;dbname=your_db', $username, $password);
            $stmt = $pdo->prepare("INSERT INTO payments (payment_id, email, amount, service, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$payment_id, $email, $amount, $item_name, 'completed']);
            */
            
            // Send confirmation email (implement your email logic)
            // sendConfirmationEmail($email, $name_first, $name_last, $item_name, $amount);
            
            break;
            
        case 'FAILED':
            logMessage("Payment failed for $email");
            // Handle failed payment
            break;
            
        case 'PENDING':
            logMessage("Payment pending for $email");
            // Handle pending payment
            break;
            
        default:
            logMessage("Unknown payment status: $payment_status");
            break;
    }
    
    // Respond with HTTP 200 OK to acknowledge receipt
    http_response_code(200);
    echo 'OK';
    
} catch (Exception $e) {
    logMessage('Error processing ITN: ' . $e->getMessage());
    http_response_code(500);
    echo 'Internal Server Error';
}

/**
 * Example email function (implement based on your email system)
 */
function sendConfirmationEmail($email, $firstName, $lastName, $service, $amount) {
    $subject = "Payment Confirmation - $service";
    $message = "
    Dear $firstName $lastName,
    
    Your payment of R$amount for $service has been processed successfully.
    
    Our team will contact you within 24 hours to begin your service.
    
    Thank you for choosing Dloziville!
    
    Best regards,
    The Dloziville Team
    ";
    
    $headers = "From: no-reply@dloziville.com\r\n";
    $headers .= "Reply-To: support@dloziville.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Use your preferred email method here
    // mail($email, $subject, $message, $headers);
}
?>