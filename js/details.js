// Function to add a product to the cart
async function addToCart(productId) {
  try {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      alert("Please log in to add the product to your cart.")
      return
    }

    const response = await axios.patch(
      "https://api.everrest.educata.dev/shop/cart/product",
      { id: productId, quantity: 1 },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    console.log("Product successfully added to cart:", response.data)
    alert("Product is in cart!")
  } catch (error) {
    console.error("An error occurred while adding to cart:", error)
    if (
      error.response &&
      error.response.data.errorKeys.includes(
        "errors.not_enough_stock_to_purchase"
      )
    ) {
      alert("Sorry, this product is currently out of stock.")
    } else if (error.response && error.response.status === 401) {
      alert("Your session has expired. Please log in again.")
    } else {
      alert("Unable to add product to cart. Please try again later.")
    }
  }
}

// Function to create star ratings HTML
function createStarRating(ratingValue) {
  const fullStars = Math.floor(ratingValue)
  const halfStar = ratingValue % 1 !== 0
  let stars = ""

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fa fa-star" style="color: gold"></i>'
  }
  if (halfStar) {
    stars += '<i class="fa fa-star-half" style="color: gold"></i>'
  }
  return stars
}

// Global function to switch tabs
window.showTab = function (tabId, button) {
  document
    .querySelectorAll(".tab-button")
    .forEach((btn) => btn.classList.remove("active"))
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"))
  button.classList.add("active")
  document.getElementById(tabId).classList.add("active")
}

// Function to submit a rating
async function submitRating(productId, rate) {
  try {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      alert("Please log in to rate the product.")
      return
    }

    const response = await axios.post(
      "https://api.everrest.educata.dev/shop/products/rate",
      {
        productId: productId,
        rate: rate,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    console.log("Rating successfully submitted:", response.data)
    alert("Thank you for your rating!")
  } catch (error) {
    console.error("An error occurred while submitting rating:", error)
    alert("Unable to submit rating. Please try again later.")
  }
}

// Function to set up all event listeners after content is rendered
function setupEventListeners(product) {
  const addToCartBtn = document.getElementById("add-to-cart-btn")
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", (event) => {
      event.preventDefault()
      addToCart(product._id)
    })
  }

  const rateProductBtn = document.getElementById("rate-product-btn")
  const modal = document.getElementById("rating-modal")
  const closeBtn = modal ? modal.querySelector(".close-button") : null
  const modalStars = modal
    ? document.getElementById("modal-rating-stars")
    : null
  const modalOkBtn = modal
    ? document.getElementById("modal-submit-rating-btn")
    : null
  let selectedRating = 0

  if (rateProductBtn && modal && closeBtn && modalStars && modalOkBtn) {
    rateProductBtn.addEventListener("click", () => {
      modal.style.display = "flex"
    })

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })

    modalStars.addEventListener("click", (event) => {
      const clickedStar = event.target.closest("i")
      if (clickedStar) {
        selectedRating = parseInt(clickedStar.dataset.value)
        const stars = modalStars.querySelectorAll("i")
        stars.forEach((star) => {
          star.style.color =
            parseInt(star.dataset.value) <= selectedRating ? "gold" : "gray"
        })
      }
    })

    modalOkBtn.addEventListener("click", () => {
      if (selectedRating > 0) {
        submitRating(product._id, selectedRating)
        modal.style.display = "none"
      } else {
        alert("Please select a rating.")
      }
    })
  }
}

// Function to display product details on the page
function displayProductDetails(product) {
  const container = document.getElementById("product-details-container")

  const issueDate = new Date(product.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const tabsHtml = `
        <div class="tabs">
            <button class="tab-button active" onclick="showTab('details-tab', this)">Details</button>
            <button class="tab-button" onclick="showTab('reviews-tab', this)">Reviews</button>
        </div>
        <div id="details-tab" class="tab-content active">
            <h3>Product Information</h3>
            <p><strong>Description:</strong> ${product.description}</p>
            <p><strong>Warranty:</strong> ${product.warranty} months</p>
        </div>
        <div id="reviews-tab" class="tab-content">
            <h3>Customer Reviews</h3>
            ${
              product.ratings && product.ratings.length > 0
                ? product.ratings
                    .map(
                      (rating) => `
                    <div class="review-item">
                        <p><strong>User ID:</strong> ${rating.userId.substring(
                          0,
                          8
                        )}...</p>
                        <p><strong>Rating:</strong> ${createStarRating(
                          rating.value
                        )}</p>
                        <p>${new Date(
                          rating.createdAt
                        ).toLocaleDateString()}</p>
                    </div>
                `
                    )
                    .join("")
                : "<p>No reviews yet.</p>"
            }
        </div>
    `

  container.innerHTML = `
        <div class="product-header">
            <img src="${product.thumbnail}" alt="${product.title}">
            <div class="product-info">
                <h2>${product.title}</h2>
                <p><strong>Price:</strong> ${product.price.current} ${
    product.price.currency
  }</p>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Stock:</strong> ${product.stock} left</p>
                <p><strong>Issued:</strong> ${issueDate}</p>
                <p><strong>Rating:</strong> ${product.rating.toFixed(2)}</p>
                <button class="btn btn-primary" id="add-to-cart-btn">Add to Cart</button>
                <button class="btn btn-secondary" id="rate-product-btn">Rate Product</button>
            </div>
        </div>
        ${tabsHtml}
    `

  // Call the function to set up event listeners after rendering
  setupEventListeners(product)
}

// Main function to fetch product details from the API
async function fetchProductDetails(id) {
  const container = document.getElementById("product-details-container")
  const apiUrl = `https://api.everrest.educata.dev/shop/products/id/${id}`

  try {
    const response = await axios.get(apiUrl)
    const product = response.data
    displayProductDetails(product)
  } catch (error) {
    console.error("An error occurred while fetching product details:", error)
    container.innerHTML =
      "<p>An error occurred while loading product details.</p>"
  }
}

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get("id")

  if (productId) {
    fetchProductDetails(productId)
  } else {
    const container = document.getElementById("product-details-container")
    container.innerHTML = "<p>Product ID not specified.</p>"
  }
})
