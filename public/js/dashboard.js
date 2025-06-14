// Wait for DOM content to be fully loaded before attaching the event listener
document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById('logoutButton');
    const settingsLink = document.getElementById('settingsLink');

    // Handle logout button click event
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();  // Prevent the default anchor behavior

            // Send a POST request to the /logout route
            fetch('/logout', {
                method: 'POST',
                credentials: 'same-origin',  // Ensure session cookie is sent
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Logged out successfully') {
                    // Clear the session storage or local storage as needed
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                    console.log('Logged out successfully');
                    window.location.href = '/login';  // Redirect to login page after successful logout
                } else {
                    console.error('Logout failed');
                }
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
        });
    }

    // Handle settings link click event
    if (settingsLink) {
        settingsLink.addEventListener('click', function(event) {
            // Prevent default behavior to avoid triggering the logout
            event.preventDefault();
            // Manually navigate to the settings page
            window.location.href = '/settings';
        });
    }
});

function downloadReport(){
    window.location.href='/dashboard/report/download';
}
  // Handle file upload feedback
  document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Upload successful!');
            location.reload();
        } else {
            alert(result.error || 'Upload failed');
        }
    } catch (error) {
        alert('Upload failed: ' + error.message);
    }
});          


document.addEventListener('DOMContentLoaded', () => {
    const requestButtons = document.querySelectorAll('.request-update');

    requestButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const usn = button.getAttribute('data-usn');

            if (!usn) {
                alert('USN is missing. Please try again.');
                return;
            }

            // Change button text to "Sending..." and show spinner
            button.innerHTML = 'Sending... <div class="spinner"></div>';
            button.disabled = true; // Disable button to prevent multiple clicks

            try {
                const response = await fetch('/request-update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usn }), // Send the USN to the server
                });

                const data = await response.json();

                if (data.success) {
                    // Change text to "Sent Successfully"
                    button.innerHTML = 'Sent Successfully';
                } else {
                    // Reset text on failure
                    button.innerHTML = 'Request Update';
                    alert(data.message || 'Failed to send update request.');
                }
            } catch (error) {
                console.error('Error:', error);
                // Reset text on error
                button.innerHTML = 'Request Update';
                alert('An error occurred. Please try again.');
            } finally {
                // Enable button after the request is complete
                setTimeout(() => {
                    button.disabled = false;
                }, 2800);
                // button.innerHTML = 'Request Update Again'; // Keep the success message for a short time before enabling again
            }

        });
    });
});
