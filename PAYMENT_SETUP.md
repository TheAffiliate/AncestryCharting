# PayFast Payment Gateway Integration

This document explains how to set up and configure the PayFast payment gateway integration for the Dloziville services website.

## ✅ **Current Implementation Status**

The PayFast payment gateway has been **fully integrated** into your services.html codebase with the following features:

### **Integrated Services:**
1. **General Consultation** - R500 fixed price
2. **Ancestry Mapping** - R1,200 fixed price  
3. **Land Restoration** - Dynamic pricing (R700 per surname + R800 for deed verification)

### **Features Implemented:**
- ✅ Payment confirmation modals
- ✅ Dynamic pricing calculation
- ✅ PayFast form generation and submission
- ✅ Payment success/cancellation pages
- ✅ Server-side payment notification handling
- ✅ Real-time pricing display for Land Restoration
- ✅ Form validation and error handling

## 🔧 **Setup Instructions**

### **1. PayFast Account Setup**
1. Sign up for a PayFast account at [payfast.co.za](https://www.payfast.co.za)
2. Get your merchant credentials:
   - Merchant ID
   - Merchant Key  
   - Passphrase (optional but recommended)

### **2. Configure Payment Integration**

Edit `payment-integration.js` and update these values:

```javascript
constructor() {
  this.merchantId = 'YOUR_MERCHANT_ID';        // Replace with your actual merchant ID
  this.merchantKey = 'YOUR_MERCHANT_KEY';      // Replace with your actual merchant key
  this.passphrase = 'YOUR_PASSPHRASE';         // Replace with your actual passphrase
  this.sandbox = false;                        // Set to false for production
}
```

Also update `payment-notify.php`:

```php
$merchant_id = 'YOUR_MERCHANT_ID';
$merchant_key = 'YOUR_MERCHANT_KEY';
$passphrase = 'YOUR_PASSPHRASE';
$sandbox = false; // Set to false for production
```

### **3. Server Requirements**
- PHP-enabled web server for payment notifications
- Write permissions for log files
- HTTPS required for production

### **4. Testing**
1. Use PayFast sandbox credentials for testing
2. Test payments with sample card numbers
3. Verify payment notifications are received
4. Check log files for any errors

## 💰 **Pricing Structure**

| Service | Pricing |
|---------|---------|
| General Consultation | R500 (fixed) |
| Ancestry Mapping | R1,200 (fixed) |
| Land Restoration | R700 per surname + R800 for deed verification |

## 🔄 **Payment Flow**

1. User fills out service form
2. User clicks submit button
3. Payment confirmation modal appears
4. User confirms payment details
5. Redirects to PayFast payment page
6. User completes payment
7. Returns to success/cancel page
8. PayFast sends notification to server
9. Server processes and logs payment

## 📁 **Files Created/Modified**

### **New Files:**
- `payment-integration.js` - Main payment processing logic
- `payment-success.html` - Success page after payment
- `payment-cancelled.html` - Cancellation page
- `payment-notify.php` - Server-side payment handler
- `PAYMENT_SETUP.md` - This setup guide

### **Modified Files:**
- `services.html` - Added payment integration and pricing displays

## 🛡️ **Security Considerations**

1. **Signature Validation**: All payments are verified using PayFast signatures
2. **Host Verification**: Optional verification of PayFast hosts  
3. **HTTPS Required**: Use HTTPS in production
4. **Server-side Processing**: Critical payment logic runs server-side
5. **Logging**: All transactions are logged for audit purposes

## 🚀 **Going Live**

1. Update PayFast credentials to production values
2. Set `sandbox = false` in both JS and PHP files
3. Test with small amounts first
4. Verify SSL certificate is valid
5. Monitor payment logs regularly

## 📞 **Support**

For PayFast-specific issues:
- PayFast Support: [support@payfast.co.za](mailto:support@payfast.co.za)
- PayFast Documentation: [developers.payfast.co.za](https://developers.payfast.co.za)

For implementation issues:
- Check browser console for JavaScript errors
- Review `payfast_notifications.log` for server-side issues
- Verify all PayFast credentials are correct

## 🔧 **Customization Options**

### **Modify Pricing:**
Edit the `calculatePricing()` method in `payment-integration.js`

### **Change Success/Cancel Pages:**
Modify return URLs in `generatePaymentData()` method

### **Add Email Notifications:**
Implement the `sendConfirmationEmail()` function in `payment-notify.php`

### **Database Integration:**
Add database logic to `payment-notify.php` for payment tracking

---

**Note**: This integration is currently configured for sandbox testing. Make sure to update credentials and disable sandbox mode before going live!