document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form')
    const messageDiv = document.getElementById('message')

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const firstName = document.getElementById('firstName').value
        const lastName = document.getElementById('lastName').value
        const email = document.getElementById('email').value
        const age = parseInt(document.getElementById('age').value, 10)

        const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            age: age,
            address: "N/A",
            phone: "+995568777498",
            zipcode: "N/A",
            avatar: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
            gender: "MALE"
        }

        const apiUrl = 'https://api.everrest.educata.dev/auth/sign_up'

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })

            const result = await response.json()

            if (response.ok) {
                messageDiv.textContent = 'Registration successful! Welcome, ' + result.firstName + '!'
                messageDiv.style.color = 'green'
                console.log('User registered:', result)
                form.reset()
            } else {
                messageDiv.textContent = `Registration failed: ${result.message || 'Please try again.'}`
                messageDiv.style.color = 'red'
                console.error('Registration error:', result)
            }
        } catch (error) {
            messageDiv.textContent = "Network error. Please try again later."
            messageDiv.style.color = 'red'
            console.error('Fetch error:', error)
        }
    })
})