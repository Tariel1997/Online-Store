document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductDetails(productId);
    } else {
        const container = document.getElementById("product-details-container");
        container.innerHTML = "<p>Product ID not specified.</p>";
    }
});

async function fetchProductDetails(id) {
    const container = document.getElementById("product-details-container");
    const apiUrl = `https://api.everrest.educata.dev/shop/products/id/${id}`;

    try {
        const response = await axios.get(apiUrl);
        const product = response.data;
        displayProductDetails(product);
    } catch (error) {
        console.error("An error occurred while fetching product details:", error);
        container.innerHTML = "<p>An error occurred while loading product details.</p>";
    }
}

function displayProductDetails(product) {
    const container = document.getElementById("product-details-container");
    container.innerHTML = `
        <div class="product-detail">
            <h2>${product.title}</h2>
            <img src="${product.thumbnail}" alt="${product.title}">
            <p>${product.description}</p>
            <p><strong>Price:</strong> ${product.price.current} ${product.price.currency}</p>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Rating:</strong> ${product.rating.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            </div>
    `;
}