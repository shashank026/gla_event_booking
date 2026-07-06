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

    button.disabled = true;
    button.textContent = 'Processing...';

    try {
        var response = await fetch('/pay-for-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destination: phone,
                event: 'Dandia Night 2026', // change for TEDx
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
            button.disabled = false;
            button.textContent = 'Pay via UPI';
            return;
        }

        alert('Payment request sent successfully on WhatsApp.');

        window.close();

        setTimeout(function () {
            window.location.href = 'about:blank';
        }, 500);
    } catch (error) {
        console.error('Payment request error:', error);
        alert('Something went wrong while sending payment request.');

        button.disabled = false;
        button.textContent = 'Pay via UPI';
    }
});