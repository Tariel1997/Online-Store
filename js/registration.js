document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form')
    const messageDiv = document.getElementById('message')

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const firstName = document.getElementById('firstName').value
        const lastName = document.getElementById('lastName').value
        const email = document.getElementById('email').value
        const age = parseInt(document.getElementById('age').value, 10)
        const address = document.getElementById('address').value
        const zip = document.getElementById('zip').value
        const phone = document.getElementById('phone').value
        const avatar = document.getElementById('avatar').value
        const gender = document.getElementById('gender').value
        const password = document.getElementById('password').value

        const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            age: age,
            address: address,
            phone: phone,
            zipcode: zip,
            avatar: avatar,
            gender: gender
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