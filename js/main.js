const productsContainer = document.getElementById('products-container');
const apiUrl = 'https://api.everrest.educata.dev/shop/products/all?page_index=1&page_size=50';

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('card');

    const imageUrl = `${product.thumbnail}`;
    const price = product.price ? product.price.current : 'N/A';
    const currency = product.price ? product.price.currency : '';
    const rating = product.rating ? product.rating.toFixed(2) : 'N/A';
    const title = product.title || 'No Title';

    card.innerHTML = `
        <img src="${imageUrl}" alt="Product image">
        <div class="card-body">
            <h5 class="product-name">${title}</h5>
            <p class="product-rating">Rating: ${rating}</p>
        </div>
        <div class="cart-price-btn">
            <h5 class="price">${price} ${currency}</h5>
            <a href="#" class="btn btn-primary">Add to cart</a>
        </div>
    `;
    return card;
}


async function fetchProducts() {
    try {
        const response = await axios.get(apiUrl);
        const products = response.data.products;

        if (products && products.length > 0) {
            products.forEach(product => {
                if (product.thumbnail) {
                    const card = createProductCard(product);
                    productsContainer.appendChild(card);
                }
            });
        } else {
            productsContainer.innerHTML = '<p>პროდუქტი ვერ მოიძებნა.</p>';
        }
    } catch (error) {
        console.error('მოთხოვნისას შეცდომა მოხდა:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p>მონაცემების მიღებისას შეცდომა მოხდა.</p>';
        }
    }
}

fetchProducts();