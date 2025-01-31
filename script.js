document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        let productos = data.productos;
        let cartItems = {};
        let cartCount = 0;
        let cartTotal = 0;

        const listaProductos = document.getElementById('lista-productos');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const cartCountElement = document.getElementById('cart-count');
        const cartTotalElements = document.querySelectorAll('#cart-total span, .cart-total span');
        const notification = document.getElementById('notification');
        const cartPopup = document.getElementById('cart-popup');
        const cartContainer = document.getElementById('cart-container');
        const closeCart = document.getElementById('close-cart');
        const clearCart = document.getElementById('clear-cart');
        const cartItemsContainer = document.getElementById('cart-items');

        function showNotification(message) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        function updateCartDisplay() {
            cartCount = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
            cartTotal = Object.values(cartItems).reduce((sum, item) => sum + (item.precio * item.quantity), 0);
            
            cartCountElement.textContent = cartCount;
            cartTotalElements.forEach(el => el.textContent = cartTotal.toFixed(2));

            cartItemsContainer.innerHTML = '';
            Object.values(cartItems).forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="http://localhost:3000${item.imagen}" alt="${item.nombre}">
                    <div class="cart-item-details">
                        <h3>${item.nombre}</h3>
                        <p>${item.precio}€</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-id="${item.nombre}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.nombre}">+</button>
                        <button class="remove-btn" data-id="${item.nombre}">🗑️</button>
                    </div>
                `;

                const removeBtn = itemElement.querySelector('.remove-btn');
                const decreaseBtn = itemElement.querySelector('.decrease');
                const increaseBtn = itemElement.querySelector('.increase');

                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFromCart(item.nombre);
                });

                decreaseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cartItems[item.nombre].quantity--;
                    if (cartItems[item.nombre].quantity <= 0) {
                        removeFromCart(item.nombre);
                    } else {
                        updateCartDisplay();
                    }
                });

                increaseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cartItems[item.nombre].quantity++;
                    updateCartDisplay();
                });

                cartItemsContainer.appendChild(itemElement);
            });

            if (cartCount === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
            }
        }

        function addToCart(producto) {
            if (cartItems[producto.nombre]) {
                cartItems[producto.nombre].quantity++;
            } else {
                cartItems[producto.nombre] = {
                    ...producto,
                    quantity: 1
                };
            }
            updateCartDisplay();
            showNotification('¡Producto añadido al carrito!');
        }

        function removeFromCart(productName) {
            delete cartItems[productName];
            updateCartDisplay();
            showNotification('Producto eliminado del carrito');
        }

        function sortProducts(productos, criterio) {
            switch(criterio) {
                case 'precio-asc':
                    return [...productos].sort((a, b) => a.precio - b.precio);
                case 'precio-desc':
                    return [...productos].sort((a, b) => b.precio - a.precio);
                case 'nombre':
                    return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
                default:
                    return productos;
            }
        }

        function mostrarProductos(productos) {
            listaProductos.innerHTML = '';
            productos.forEach(producto => {
                const li = document.createElement('li');
                li.className = 'producto-item';
                li.innerHTML = `
                    <div class="producto-imagen">
                        <img src="http://localhost:3000${producto.imagen}" alt="${producto.nombre}">
                        <div class="producto-hover">
                            <span>Ver detalles</span>
                        </div>
                    </div>
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <div class="precio">
                        <span>${producto.precio}€</span>
                        <button class="btn-comprar">Comprar</button>
                    </div>
                    <div class="producto-tags">
                        <span class="tag">Música</span>
                        <span class="tag">Instrumento</span>
                    </div>
                `;

                const btnComprar = li.querySelector('.btn-comprar');
                btnComprar.addEventListener('click', () => {
                    btnComprar.classList.add('clicked');
                    addToCart(producto);
                    setTimeout(() => btnComprar.classList.remove('clicked'), 200);
                });

                li.querySelector('.producto-imagen').addEventListener('click', () => {
                    showNotification('Característica de detalles próximamente...');
                });

                listaProductos.appendChild(li);
            });
        }

        searchInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase();
            const productosFiltrados = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(busqueda) ||
                producto.descripcion.toLowerCase().includes(busqueda)
            );
            mostrarProductos(productosFiltrados);
        });

        sortSelect.addEventListener('change', (e) => {
            const productosFiltrados = sortProducts(productos, e.target.value);
            mostrarProductos(productosFiltrados);
        });

        // Mostrar/ocultar el popup del carrito
        cartContainer.addEventListener('click', (e) => {
            if (!cartPopup.contains(e.target)) {
                cartPopup.classList.add('show');
                e.stopPropagation();
            }
        });

        closeCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartPopup.classList.remove('show');
        });

        clearCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartItems = {};
            updateCartDisplay();
            showNotification('Carrito vaciado');
        });

        // Cerrar el popup cuando se hace clic fuera
        document.addEventListener('click', (e) => {
            if (!cartContainer.contains(e.target)) {
                cartPopup.classList.remove('show');
            }
        });

        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
});