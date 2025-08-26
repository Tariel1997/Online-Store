const productsContainer = document.getElementById("products-container");
const apiUrl =
  "https://api.everrest.educata.dev/shop/products/all?page_index=1&page_size=50";

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.style.width = "18rem";

  const imageUrl = `${product.thumbnail}`;
  const price = product.price ? product.price.current : "N/A";
  const currency = product.price ? product.price.currency : "";
  const rating = product.rating ? product.rating.toFixed(2) : "N/A";
  const title = product.title || "No Title";
  const productId = product._id;

  async function addToCart(productId) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            alert("Please log in to add the product to your cart.");
            return;
        }

        const response = await axios.patch(
            "https://api.everrest.educata.dev/shop/cart/product",
            {
                id: productId,
                quantity: 1
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        console.log("Product successfully added to cart:", response.data);
        alert("Product is in cart!");

    } catch (error) {
        console.error("An error occurred while adding to cart:", error);
        
        if (error.response && error.response.data.errorKeys.includes("errors.not_enough_stock_to_purchase")) {
            alert("Sorry, this product is currently out of stock.");
        } 
        else if (error.response && error.response.status === 401) {
            alert("Your session has expired. Please log in again.");
        } 
        else {
            alert("Unable to add product to cart. Please try again later.");
        }
    }
}

  card.innerHTML = `
        <img src="${imageUrl}" class="card-img-top" alt="Product image">
        <div class="card-body">
            <h5 class="product-name">${title}</h5>
            <p class="product-rating">Rating: ${rating}</p>
        </div>
        <div class="cart-price-btn">
            <h5 class="price">${price} ${currency}</h5>
            <a href="#" class="btn btn-primary add-to-cart-btn" data-product-id="${productId}">Add to cart</a>
        </div>
    `;
    
    const addToCartButton = card.querySelector(".add-to-cart-btn");
    addToCartButton.addEventListener("click", function (event) {
        event.preventDefault();
        const productId = event.target.dataset.productId;
        addToCart(productId);
    });

  return card;
}

function renderProducts(productsToRender) {
  productsContainer.innerHTML = "";

  if (productsToRender && productsToRender.length > 0) {
    productsToRender.forEach((product) => {
      if (product.thumbnail) {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
      }
    });
  } else {
    productsContainer.innerHTML = "<p>Product not found.</p>";
  }
}

async function fetchAllProducts() {
  try {
    const response = await axios.get(apiUrl);
    renderProducts(response.data.products);
  } catch (error) {
    console.error("An error occurred while requesting:", error);
    productsContainer.innerHTML = "<p>An error occurred while retrieving data.</p>";
  }
}

async function fetchCategories() {
  try {
    const response = await axios.get(
      "https://api.everrest.educata.dev/shop/products/categories"
    );
    const select = document.getElementById("category");

    response.data.forEach((category) => {
      const option = document.createElement("option");
      option.textContent = category.name;
      option.value = category.id;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("An error occurred while retrieving categories:", error);
  }
}

async function filterData(event) {
  event.preventDefault();

  const keyword = document.getElementById("keyword").value;
  const category = document.getElementById("category").value;
  const brand = document.getElementById("brand").value;
  const rating = document.getElementById("rating").value;
  const priceFrom = document.getElementById("priceFrom").value;
  const priceTo = document.getElementById("priceTo").value;

  let searchString = "https://api.everrest.educata.dev/shop/products/search?";

  if (keyword) searchString += `keywords=${keyword}&`;
  if (category) searchString += `category_id=${category}&`;
  if (brand) searchString += `brand=${brand}&`;
  if (rating) searchString += `rating=${rating}&`;
  if (priceFrom) searchString += `price_min=${priceFrom}&`;
  if (priceTo) searchString += `price_max=${priceTo}&`;

  searchString = searchString.slice(0, -1);

  try {
    const response = await axios.get(searchString);
    renderProducts(response.data.products);
  } catch (err) {
    console.error("An error occurred while requesting filtering:", err);
    productsContainer.innerHTML =
      "<p>No products were found with the given criteria.</p>";
  }
}

const searchInput = document.querySelector('.search-block input[type="search"]')
const searchButton = document.querySelector('.search-block .search-button')

searchButton.addEventListener("click", function (event) {
  event.preventDefault();

  document.getElementById("keyword").value = "";
  document.getElementById("category").value = "";
  document.getElementById("brand").value = "";
  document.getElementById("rating").value = "";
  document.getElementById("priceFrom").value = "";
  document.getElementById("priceTo").value = "";

  document.getElementById("keyword").value = searchInput.value;
  filterData(event);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchAllProducts();
  fetchCategories();

  const categoriesLink = document.querySelector('nav ul li a[href=""]');
  const filterDropdown = document.getElementById("filter-dropdown");

  categoriesLink.addEventListener("click", function (event) {
    event.preventDefault();
    filterDropdown.classList.toggle("show");
  });
});