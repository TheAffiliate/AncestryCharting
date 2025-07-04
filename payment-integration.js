// PayFast Payment Integration for Services
class PayFastIntegration {
  constructor() {
    this.merchantId = '10000100'; // Replace with your PayFast merchant ID
    this.merchantKey = 'q1cd2rdny4a53jpmxkmgd6rmd'; // Replace with your PayFast merchant key
    this.passphrase = 'payfast'; // Replace with your PayFast passphrase
    this.sandbox = true; // Set to false for production
    this.baseUrl = this.sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  }

  // Calculate pricing for services
  calculatePricing(serviceType, formData) {
    let amount = 0;
    let description = '';

    switch (serviceType) {
      case 'general-consultation':
        amount = 500; // R500 for consultation
        description = 'General Consultation Service';
        break;
      
      case 'ancestry-mapping':
        amount = 1200; // R1200 for ancestry mapping
        description = 'Ancestry Mapping Service';
        break;
      
      case 'land-restoration':
        // Calculate based on surnames and deed office selection
        const surnames = formData.surnames || '';
        const surnameCount = surnames.split('\n').filter(line => line.trim()).length || 1;
        const surnamesCost = surnameCount * 700; // R700 per surname
        
        const deedOffice = formData['deed-office'];
        const deedCost = deedOffice ? 800 : 0; // R800 for deed verification
        
        amount = surnamesCost + deedCost;
        description = `Land Restoration Research - ${surnameCount} surname(s)`;
        if (deedOffice) {
          description += ` + Deed Verification (${deedOffice})`;
        }
        break;
    }

    return { amount, description };
  }

  // Generate payment form data
  generatePaymentData(serviceType, formData, userEmail, userName) {
    const pricing = this.calculatePricing(serviceType, formData);
    
    const paymentData = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      amount: pricing.amount.toFixed(2),
      item_name: pricing.description,
      item_description: `Service booking for ${userName}`,
      email_address: userEmail,
      name_first: userName.split(' ')[0] || '',
      name_last: userName.split(' ').slice(1).join(' ') || '',
      return_url: window.location.origin + '/payment-success.html',
      cancel_url: window.location.origin + '/payment-cancelled.html',
      notify_url: window.location.origin + '/payment-notify.php'
    };

    // Generate signature (simplified - in production, do this server-side)
    const signature = this.generateSignature(paymentData);
    paymentData.signature = signature;

    return paymentData;
  }

  // Generate PayFast signature (simplified version - move to server-side for production)
  generateSignature(data) {
    // This is a simplified signature generation
    // In production, implement proper signature generation server-side
    const signatureString = Object.keys(data)
      .filter(key => key !== 'signature' && data[key] !== '')
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
    
    // Add passphrase if available
    const finalString = this.passphrase ? `${signatureString}&passphrase=${encodeURIComponent(this.passphrase)}` : signatureString;
    
    // In production, use proper MD5 hashing server-side
    return this.simpleMD5(finalString);
  }

  // Simple MD5 implementation (use proper crypto library in production)
  simpleMD5(string) {
    // This is a placeholder - use proper MD5 hashing in production
    return 'placeholder_signature';
  }

  // Create and submit payment form
  initiatePayment(serviceType, formData, userEmail, userName) {
    const paymentData = this.generatePaymentData(serviceType, formData, userEmail, userName);
    
    // Create hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.baseUrl;
    form.style.display = 'none';

    // Add form fields
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    // Add form to page and submit
    document.body.appendChild(form);
    form.submit();
  }

  // Show payment confirmation modal
  showPaymentConfirmation(serviceType, formData, userEmail, userName) {
    const pricing = this.calculatePricing(serviceType, formData);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-gray-200">
        <h3 class="text-xl font-semibold mb-4 text-primary-color">Confirm Payment</h3>
        <div class="space-y-3 mb-6">
          <p><strong>Service:</strong> ${pricing.description}</p>
          <p><strong>Amount:</strong> R${pricing.amount.toFixed(2)}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
        </div>
        <div class="flex space-x-3">
          <button id="confirm-payment" class="btn-primary flex-1 px-4 py-2 rounded-md font-semibold">
            Proceed to Payment
          </button>
          <button id="cancel-payment" class="bg-gray-600 hover:bg-gray-700 flex-1 px-4 py-2 rounded-md font-semibold">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle confirmation
    document.getElementById('confirm-payment').addEventListener('click', () => {
      document.body.removeChild(modal);
      this.initiatePayment(serviceType, formData, userEmail, userName);
    });

    // Handle cancellation
    document.getElementById('cancel-payment').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
}

// Initialize payment integration
const payFast = new PayFastIntegration();

// Enhanced form handlers with payment integration
function handleFormSubmissionWithPayment(formElement, serviceType, messageElement) {
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    messageElement.textContent = '';

    // Get form data
    const formData = new FormData(formElement);
    const dataObj = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });

    // Validate required fields
    const email = dataObj.email || dataObj['gc-email'] || dataObj['am-email'];
    const name = dataObj['full-names'] || dataObj['gc-name'] || dataObj['am-name'];

    if (!email || !name) {
      messageElement.textContent = 'Please fill in all required fields.';
      messageElement.classList.remove('text-green-400');
      messageElement.classList.add('text-red-500');
      return;
    }

    // Show payment confirmation
    payFast.showPaymentConfirmation(serviceType, dataObj, email, name);
  });
}