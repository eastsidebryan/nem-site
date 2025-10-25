document.addEventListener('DOMContentLoaded', () => {
    // === Amount Selector Logic ===
    const amountInput = document.getElementById('amount');
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');
    const currencySelect = document.getElementById('currency');
    const accountSelect = document.getElementById('account');
    const payNowBtn = document.getElementById('pay-now-btn');

    const allNairaOptions = `
        <option value="1020451270_UBA">Tithe/Offering - 1020451270 UBA</option>
        <option value="1020451256_UBA">Evangelism - 1020451256 UBA</option>
        <option value="1020451263_UBA">Project - 1020451263 UBA</option>
    `;
    const dollarOption = `<option value="3002634325_UBA">Dollar Acct - 3002634325 UBA</option>`;

    // Event listeners for amount buttons
    minusBtn.addEventListener('click', () => {
        let currentValue = parseInt(amountInput.value);
        if (currentValue > 0) {
            amountInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        let currentValue = parseInt(amountInput.value);
        amountInput.value = currentValue + 1;
    });

    // Event listener for currency change
    currencySelect.addEventListener('change', (event) => {
        const selectedCurrency = event.target.value;
        accountSelect.innerHTML = ''; // Clear existing options
        if (selectedCurrency === 'USD') {
            accountSelect.innerHTML = dollarOption;
        } else if (selectedCurrency === 'NGN') {
            accountSelect.innerHTML = allNairaOptions;
        }
    });

    // Initial load to set the correct account options
    currencySelect.dispatchEvent(new Event('change'));

    // === Paystack Integration Logic ===
    payNowBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const amount = amountInput.value;
        const currency = currencySelect.value;
        const account = accountSelect.value;

        // Prompt the user for their name and email
        const donorEmail = prompt("Please enter your email address:");
        const donorName = prompt("Please enter your name:");

        if (!donorEmail || !donorName || amount <= 0) {
            alert("Please provide a valid name, email, and amount.");
            return;
        }

        try {
            // Fetch the public key from your new Netlify Function endpoint
            const response = await fetch('/.netlify/functions/paystack-key');
            const data = await response.json();
            const paystackPublicKey = data.publicKey;

            if (!paystackPublicKey) {
                throw new Error("Public key not received from server.");
            }

            const paystackOptions = {
                key: paystackPublicKey,
                email: donorEmail,
                amount: amount * 100,
                currency: currency,
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Donor Name",
                            variable_name: "donor_name",
                            value: donorName
                        },
                        {
                            display_name: "Donation Account",
                            variable_name: "donation_account",
                            value: account
                        }
                    ]
                },
                callback: function(response) {
                    const reference = response.reference;
                    window.location.href = `thank-you.html?reference=${reference}`;
                },
                onClose: function() {
                    alert('Payment window closed. You can try again to complete your donation.');
                }
            };
            
            const handler = PaystackPop.setup(paystackOptions);
            handler.openIframe();

        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Could not initiate payment. Please try again later.');
        }
    });
});