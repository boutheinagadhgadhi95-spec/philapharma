document.addEventListener('DOMContentLoaded', () => {

    // --- UTILS : Gestion du localStorage pour la persistance ---
    
    const loadCart = () => {
        const cartData = localStorage.getItem('philaPharmaCart');
        return cartData ? JSON.parse(cartData) : [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('philaPharmaCart', JSON.stringify(cart));
    };

    const updateCartCount = (cart) => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
        return totalItems;
    };

    let cart = loadCart();
    updateCartCount(cart);

    // 1. DYNAMIQUE D'AJOUTER AU PANIER
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = e.target.getAttribute('data-product-id');
            const name = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.product-price').textContent.replace(' DT', '').replace(',', '.').trim();
            const price = parseFloat(priceText);
            
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: productId, name, price, quantity: 1, image: 'https://via.placeholder.com/60x60' });
            }

            saveCart(cart);
            updateCartCount(cart);

            e.target.innerHTML = 'Ajouté ! <i class="fas fa-check"></i>';
            setTimeout(() => {
                e.target.innerHTML = 'Ajouter <i class="fas fa-cart-plus"></i>';
            }, 1000);
        });
    });


    // 2. DYNAMIQUE D'AFFICHAGE ET GESTION DU PANIER (sur cart.html uniquement)
    const cartTableBody = document.querySelector('.cart-table tbody');
    const cartSummary = document.querySelector('.cart-summary');

    if (cartTableBody && cartSummary) {
        
        const updateSummary = () => {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 99 ? 0 : 7.00; 
            const total = subtotal + shipping;

            const subtotalEl = cartSummary.querySelector('.summary-line:nth-child(1) .value');
            const shippingEl = cartSummary.querySelector('.summary-line:nth-child(2) .value');
            const totalEl = cartSummary.querySelector('.total-value');
            
            if(subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} DT`;
            
            if(shippingEl) {
                shippingEl.textContent = shipping === 0 ? 'GRATUITS' : `${shipping.toFixed(2)} DT`;
                shippingEl.classList.toggle('free-shipping', shipping === 0);
            }
            
            if(totalEl) totalEl.textContent = `${total.toFixed(2)} DT`;

            updateCartCount(cart);
        };
        
        const renderCart = () => {
            cartTableBody.innerHTML = '';
            
            if (cart.length === 0) {
                cartTableBody.innerHTML = '<tr><td colspan="5" class="empty-cart-message">Votre panier est vide. <a href="index.html">Commencez vos achats !</a></td></tr>';
            } else {
                cart.forEach(item => {
                    const totalItemPrice = (item.price * item.quantity).toFixed(2);
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td class="product-info" data-label="Produit">
                            <img src="${item.image}" alt="${item.name}">
                            <span>${item.name}</span>
                        </td>
                        <td data-label="Prix Unitaire">${item.price.toFixed(2)} DT</td>
                        <td data-label="Quantité">
                            <input type="number" value="${item.quantity}" min="1" class="qty-input" data-product-id="${item.id}">
                        </td>
                        <td class="item-total" data-label="Total">${totalItemPrice} DT</td>
                        <td data-label="Action">
                            <a href="#" class="remove-btn" data-product-id="${item.id}"><i class="fas fa-times-circle"></i></a>
                        </td>
                    `;
                    cartTableBody.appendChild(row);
                });
            }
            
            updateSummary();
        };

        // GESTION DU CHANGEMENT DE QUANTITÉ
        cartTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const productId = e.target.getAttribute('data-product-id');
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity <= 0) { e.target.value = 1; return; }
                
                const item = cart.find(i => i.id === productId);
                if (item) {
                    item.quantity = newQuantity;
                    saveCart(cart);
                    renderCart(); 
                }
            }
        });

        // GESTION DE LA SUPPRESSION D'UN ARTICLE
        cartTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                e.preventDefault();
                const productId = e.target.closest('.remove-btn').getAttribute('data-product-id');
                cart = cart.filter(item => item.id !== productId);
                saveCart(cart);
                renderCart();
            }
        });
        
        // GESTION DU BOUTON "VIDER LE PANIER" (SUPPRESSION TOTALE)
        const clearCartButton = document.querySelector('.clear-cart-btn');

        if (clearCartButton) {
            clearCartButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir vider l\'intégralité de votre panier ?')) {
                    cart = [];
                    saveCart(cart);
                    renderCart(); 
                    alert('Votre panier a été vidé.');
                }
            });
        }

        renderCart(); 
    }

    // 3. EFFETS DYNAMIQUES (Fade-in)
    const sections = document.querySelectorAll('.fade-in-section, .contact-header, .page-header, .trust-builders');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});
