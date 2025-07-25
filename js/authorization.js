function signIn (event) {
    event.preventDefault()

    let email = document.getElementById('email')
    let password = document.getElementById('password')
    let messageDiv = document.getElementById('message')

    if (email.value === "") {
        messageDiv.textContent = "Email is required."
        messageDiv.style.color = 'red'
        return
    } else if (password.value === "") {
        messageDiv.textContent = "Password is required."
        messageDiv.style.color = 'red'
        return
    } else {
        axios.post("https://api.everrest.educata.dev/auth/sign_in", {
            email: email.value,
            password: password.value
        }).then (function (response) {
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            console.log('Sign-in successful:', response)
            window.location.replace("main.html")
        }).catch (function (error) {
            messageDiv.textContent = "Invalid email or password. Please try again."
            messageDiv.style.color = 'red'
            console.error('Sign-in error:', error)
        })
    }
}