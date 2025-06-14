document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
        document.getElementById('error-message').innerText = 'Invalid or missing token. Please check your link.';
        return;
    }

    // Verify the token by sending a request to the backend
    fetch(`/update?token=${token}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            document.getElementById('error-message').innerText = data.message || 'Token is invalid or expired.';
            return;
        }

        // If the token is valid, show the form to update details
        document.getElementById('update-form').addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const company = document.getElementById('company').value;
            const status = document.getElementById('status').value;

            // Disable the button to prevent multiple clicks
            const button = document.getElementById('update-button');
            button.disabled = true;

            // Send the updated details to the server
            fetch('/submit-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    name,
                    company,
                    status
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Your details have been updated successfully!');
                } else {
                    alert(data.message || 'Failed to update details. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error updating details:', error);
                alert('An error occurred while updating your details. Please try again later.');
            })
            .finally(() => {
                button.disabled = false;
            });
        });
    })
    .catch(error => {
        document.getElementById('error-message').innerText = 'An error occurred while verifying the token. Please try again later.';
        console.error('Error:', error);
    });
});
