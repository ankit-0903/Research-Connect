document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the form from submitting the traditional way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value.trim();
    console.log(password);

    // Prepare the data to send to the backend
    const data = {
        email: email,
        password: password
    };

    try {
        // Sending data to the backend using Fetch API
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Check if login is successful
        if (response.ok) {
            // Redirect or do something after a successful login
            window.location.href = '/dashboard';  // Example redirect to dashboard
        } else {
            // Display an error message if login fails
            const errorMessage = await response.json();
            document.getElementById('error-message').style.display = 'block';
            document.getElementById('error-message').innerText = errorMessage.error || 'Login failed. Please try again.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').innerText = 'Server error. Please try again later.';
    }
});
