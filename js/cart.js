async function fetchCartData() {
  console.log("Fetching cart data...")

  const cartUrl = "https://api.everrest.educata.dev/shop/cart"
  const accessToken = localStorage.getItem("accessToken")

  if (!accessToken) {
    console.log("Access token not found. Displaying login message.")
    document.getElementById("cart-items-container").innerHTML =
      "<p>Please log in to view your cart.</p>"
    return
  }

  try {
    console.log("Sending request to fetch cart with token.")
    const timestamp = new Date().getTime()
    const cartResponse = await axios.get(`${cartUrl}?t=${timestamp}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const cartData = cartResponse.data
    console.log("Cart data received:", cartData)

    if (!cartData.products || cartData.products.length === 0) {
      console.log("Cart is empty. Displaying empty cart message.")
      document.getElementById("cart-items-container").innerHTML =
        "<p>Your cart is empty.</p>"
      document.getElementById("cart-total").innerHTML = ""
      return
    }

    console.log("Fetching detailed product info for each item.")
    const productPromises = cartData.products.map(async (cartProduct) => {
      const productDetailUrl = `https://api.everrest.educata.dev/shop/products/id/${cartProduct.productId}`
      try {
        const productResponse = await axios.get(productDetailUrl)
        return {
          ...cartProduct,
          ...productResponse.data,
        }
      } catch (error) {
        console.error(
          `Failed to fetch details for product ${cartProduct.productId}:`,
          error
        )
        return {
          ...cartProduct,
          title: "Product not found.",
          thumbnail: "",
          stock: 0,
          rating: 0,
          ratings: [],
        }
      }
    })

    const detailedProducts = await Promise.all(productPromises)
    console.log("All product details fetched. Displaying cart.")
    displayCart(cartData.total, detailedProducts)
  } catch (error) {
    console.error("Failed to fetch cart data:", error)
    if (error.response && error.response.status === 401) {
      console.error("Authorization error: Token expired or invalid.")
      document.getElementById("cart-items-container").innerHTML =
        "<p>Your session has expired. Please log in again.</p>"
    } else {
      console.error("Unknown error fetching cart data.")
      document.getElementById("cart-items-container").innerHTML =
        "<p>Cart could not be loaded. Please try again later.</p>"
    }
  }
}

function displayCart(totalData, products) {
  const container = document.getElementById("cart-items-container")
  const totalContainer = document.getElementById("cart-total")

  console.log("displayCart called. Container:", container)
  console.log("displayCart called. Total Container:", totalContainer)
  console.log("displayCart called. Products to display:", products)

  if (!container || !totalContainer) {
    console.error("Critical error: Cart container elements not found!")
    return
  }

  container.innerHTML = ""
  products.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = "cart-item-card"

    productCard.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
    <div class="product-details">
        <h3>${product.title}</h3>
        <p class="product-stock">In Stock: ${product.stock} units</p>
        <p class="product-rating">Rating: ${product.rating} <i class="fa-solid fa-star"></i></p>
        <p class="product-reviews">Reviews: ${product.ratings.length}</p>
        <p class="product-price">Price: $${product.price.current}</p>
        <div class="quantity-control">
            <button class="quantity-btn decrease-btn" data-id="${product._id}" data-current-quantity="${product.quantity}">-</button>
            <span class="quantity-number">${product.quantity}</span>
            <button class="quantity-btn increase-btn" data-id="${product._id}" data-current-quantity="${product.quantity}">+</button>
        </div>
    </div>
    <div class="delete-product-container">
        <button class="delete-btn" data-id="${product._id}"><i class="fa-solid fa-trash"></i></button>
    </div>
    `
    container.appendChild(productCard)
  })

  totalContainer.innerHTML = `
    <h2>Cart summary</h2>
    <p>Total product: ${totalData.products}</p>
    <p>Total quantity: ${totalData.quantity}</p>
    <p>Total price: $${totalData.price.current}</p>
  `

  attachQuantityListeners()
}

async function deleteProduct(productId) {
  const accessToken = localStorage.getItem("accessToken")
  if (!accessToken) {
    alert("Please authenticate.")
    return
  }

  try {
    const response = await axios.delete(
      "https://api.everrest.educata.dev/shop/cart/product",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          id: productId,
        },
      }
    )

    console.log("Product deleted successfully:", response.data)

    // Re-fetch and display cart data to update the UI
    await fetchCartData()
  } catch (error) {
    console.error("Failed to delete product:", error)
    alert("The product could not be removed. Please try again later.")
  }
}

function attachQuantityListeners() {
  const increaseButtons = document.querySelectorAll(".increase-btn")
  const decreaseButtons = document.querySelectorAll(".decrease-btn")
  const deleteButtons = document.querySelectorAll(".delete-btn")

  increaseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.dataset.id
      const currentQuantity = parseInt(event.target.dataset.currentQuantity)
      if (currentQuantity < 10) {
        // Limit to 10 products
        const newQuantity = currentQuantity + 1
        updateQuantity(productId, newQuantity)
      }
    })
  })

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.dataset.id
      const currentQuantity = parseInt(event.target.dataset.currentQuantity)
      if (currentQuantity > 1) {
        // Prevent quantity from going below 1
        const newQuantity = currentQuantity - 1
        updateQuantity(productId, newQuantity)
      } else {
        alert("Cannot decrease quantity below 1. Add remove functionality.")
      }
    })
  })

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.currentTarget.dataset.id
      deleteProduct(productId)
    })
  })
}

async function updateQuantity(productId, newQuantity) {
  const accessToken = localStorage.getItem("accessToken")
  if (!accessToken) {
    alert("Please authenticate.")
    return
  }

  try {
    const response = await axios.patch(
      "https://api.everrest.educata.dev/shop/cart/product",
      {
        id: productId,
        quantity: newQuantity,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    console.log("Quantity updated successfully:", response.data)

    await fetchCartData()
  } catch (error) {
    console.error("Failed to update quantity:", error)
    if (
      error.response &&
      error.response.data.errorKeys &&
      error.response.data.errorKeys.includes(
        "errors.not_enough_stock_to_purchase"
      )
    ) {
      alert("Sorry, this product is currently out of stock.")
    } else {
      alert("The quantity could not be changed. Please try again later.")
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchCartData)
