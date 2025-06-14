document.addEventListener('DOMContentLoaded', function () {
    const adminForm = document.getElementById('adminForm');
    const messageElement = document.getElementById('message'); // Reference to the message container
  
    if (adminForm) {
      adminForm.addEventListener('submit', async function (event) {
        event.preventDefault();
  
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';
  
        // Clear any previous messages
        messageElement.textContent = '';
        messageElement.className = '';
  
        try {
          const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
          };
  
          const response = await fetch('/settings/addNewAdmin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            // Success message
            messageElement.textContent = data.message || 'Admin added successfully!';
            messageElement.className = 'message success';
  
            // Clear the form
            adminForm.reset();
          } else {
            // Error message
            messageElement.textContent = data.error || 'Failed to add admin';
            messageElement.className = 'message error';
          }
        } catch (error) {
          console.error('Error:', error);
          messageElement.textContent = 'Network error occurred';
          messageElement.className = 'message error';
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Add Admin';
        }
      });
    }
  });
  

  