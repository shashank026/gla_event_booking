document.addEventListener('DOMContentLoaded', function () {
    console.log('TEDx script loaded and executing...');

    var priceLabels = {
        standard: 'Standard',
        student: 'Student',
        patron: 'Patron (reserved)'
    };

    var form = document.querySelector('.booking-form');

    if (!form) {
        console.error('Booking form not found.');
        return;
    }

    var tierSelect = form.querySelector('select[name="tier"]');
    var qtyInput = form.querySelector('input[name="qty"]');
    var stickyTotal = document.getElementById('stickyTotal');
    var inlineTotal = document.getElementById('inlineTotal');

    if (!tierSelect || !qtyInput || !stickyTotal || !inlineTotal) {
        console.error('Required booking elements are missing.');
        return;
    }

    function currentTotal() {
        var selectedOption = tierSelect.options[tierSelect.selectedIndex];
        var price = parseInt(selectedOption.getAttribute('data-price'), 10) || 0;
        var qty = parseInt(qtyInput.value, 10) || 1;

        if (qty < 1) qty = 1;
        if (qty > 6) qty = 6;

        qtyInput.value = qty;

        return price * qty;
    }

    function updateTotal() {
        var total = '₹' + currentTotal();

        stickyTotal.textContent = total;
        inlineTotal.textContent = total;
    }

    tierSelect.addEventListener('change', updateTotal);
    qtyInput.addEventListener('input', updateTotal);

    updateTotal();

    var waButtons = document.querySelectorAll('.whatsapp-btn');

    waButtons.forEach(function (button) {
        button.addEventListener('click', async function () {
            console.log('Pay via UPI button clicked');

            var name = form.querySelector('input[name="name"]').value.trim();
            var roll = form.querySelector('input[name="rollNumber"]').value.trim();
            var email = form.querySelector('input[name="collegeEmail"]').value.trim();
            var phone = form.querySelector('input[name="phoneNumber"]').value.trim();

            if (!name || !roll || !email) {
                alert('Please fill your name, roll number and college email before payment.');
                return;
            }

            if (!/.+@gla\.ac\.in$/.test(email)) {
                alert('Please use your official @gla.ac.in email.');
                return;
            }

            var tierKey = tierSelect.value;
            var qty = parseInt(qtyInput.value, 10) || 1;
            var total = currentTotal();

            var confirmMessage =
                'Confirm your booking:\n\n' +
                'Event: TEDx Evening 2026\n' +
                'Name: ' + name + '\n' +
                'Pass Type: ' + priceLabels[tierKey] + '\n' +
                'Quantity: ' + qty + '\n' +
                'Total Amount: ₹' + total + '\n\n' +
                'Proceed with payment via WhatsApp?';

            if (!confirm(confirmMessage)) {
                return;
            }

            try {
                var response = await fetch('/pay-for-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        destination: phone,
                        event: 'TEDX 2026',
                        name: name,
                        rollNumber: roll,
                        collegeEmail: email,
                        ticketType: priceLabels[tierKey],
                        quantity: qty,
                        amount: total
                    })
                });

                var data = await response.json();

                if (!response.ok) {
                    alert(data.message || 'Payment request failed.');
                    return;
                }

                window.close();

                alert('Payment request sent successfully on WhatsApp.');
            } catch (error) {
                console.error('Payment request error:', error);
                alert('Something went wrong while sending payment request.');
            }
        });
    });
});