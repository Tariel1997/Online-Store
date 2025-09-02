async function fetchCartData() {
  const cartUrl = "https://api.everrest.educata.dev/shop/cart";
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    document.getElementById("cart-items-container").innerHTML =
      "<p>Please log in to view your cart.</p>";
    return;
  }

  try {
    const cartResponse = await axios.get(cartUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const cartData = cartResponse.data;

    if (!cartData.products || cartData.products.length === 0) {
      document.getElementById("cart-items-container").innerHTML =
        "<p>Your cart is empty.</p>";
      document.getElementById("cart-total").innerHTML = "";
      return;
    }

    const productPromises = cartData.products.map(async (cartProduct) => {
      const productDetailUrl = `https://api.everrest.educata.dev/shop/products/id/${cartProduct.productId}`;
      try {
        const productResponse = await axios.get(productDetailUrl);
        return {
          ...cartProduct,
          ...productResponse.data,
        };
      } catch (error) {
        console.error(
          `Failed to fetch details for product ${cartProduct.productId}:`,
          error
        );
        return {
          ...cartProduct,
          title: "Product not found.",
          thumbnail: "",
          stock: 0,
          rating: 0,
          ratings: [],
        };
      }
    });

    const detailedProducts = await Promise.all(productPromises);
    displayCart(cartData.total, detailedProducts);

  } catch (error) {
    console.error("Failed to fetch cart data:", error);
    if (error.response && error.response.status === 401) {
      document.getElementById("cart-items-container").innerHTML =
        "<p>Your session has expired. Please log in again.</p>";
    } else {
      document.getElementById("cart-items-container").innerHTML =
        "<p>Cart could not be loaded. Please try again later.</p>";
    }
  }
}

function displayCart(totalData, products) {
  const container = document.getElementById("cart-items-container");
  const totalContainer = document.getElementById("cart-total");

  container.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "cart-item-card";

    productCard.innerHTML = `
      <img src="${product.thumbnail}" alt="${
      product.title
    }" class="product-image">
      <div class="product-details">
        <h3>${product.title}</h3>
        <p class="product-stock">In Stock: ${product.stock} units</p>
        <p class="product-rating">Rating: ${
      product.rating
    } <i class="fa-solid fa-star"></i></p>
        <p class="product-reviews">Reviews: ${product.ratings.length}</p>
        <p class="product-price">Price: $${product.price.current}</p>
        <div class="quantity-control">
          <button class="quantity-btn decrease-btn" data-id="${
            product._id
          }">-</button>
          <span class="quantity-number">${product.quantity}</span>
          <button class="quantity-btn increase-btn" data-id="${
            product._id
          }">+</button>
        </div>
      </div>
    `;
    container.appendChild(productCard);
  });

  totalContainer.innerHTML = `
    <h2>Cart summary</h2>
    <p>Total product: ${totalData.products}</p>
    <p>Total quantity: ${totalData.quantity}</p>
    <p>Total price: $${totalData.price.current}</p>
  `;

  attachQuantityListeners();
}

function attachQuantityListeners() {
  const increaseButtons = document.querySelectorAll(".increase-btn");
  const decreaseButtons = document.querySelectorAll(".decrease-btn");

  increaseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.dataset.id;
      updateQuantity(productId, 1);
    });
  });

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.dataset.id;
      updateQuantity(productId, -1);
    });
  });
}

async function updateQuantity(productId, amount) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("Please authenticate.");
    return;
  }

  try {
    const response = await axios.patch(
      "https://api.everrest.educata.dev/shop/cart/product",
      { id: productId, quantity: amount },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log("Quantity updated:", response.data);
    fetchCartData();
  } catch (error) {
    console.error("Failed to update quantity:", error);
    alert("The quantity could not be changed.");
  }
}

document.addEventListener("DOMContentLoaded", fetchCartData);