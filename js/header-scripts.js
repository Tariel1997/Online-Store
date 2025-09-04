function redirectToCart() {
  window.location.href = "cart.html"
}

async function signOut() {
  const url = "https://api.everrest.educata.dev/auth/sign_out"

  try {
    const response = await axios.post(url)
    console.log("Signed out successfully:", response.data)
  } catch (error) {
    console.error("Failed to sign out:", error)
  } finally {
    localStorage.removeItem("accessToken")

    window.location.href = "./../pages/authorization.html"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logout-link")

  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault()
      signOut()
    })
  }
})
