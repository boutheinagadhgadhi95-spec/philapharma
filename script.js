document.addEventListener('DOMContentLoaded', () => {

    // --- UTILS : Gestion du localStorage pour la persistance ---
    
    // Fonction pour charger le panier depuis localStorage
    const loadCart = () => {
        const cartData = localStorage.getItem('philaPharmaCart');
        return cartData ? JSON.parse(cartData) : [];
    };

    // Fonction pour sauvegarder le panier dans localStorage
    const saveCart = (cart) => {
        localStorage.setItem('philaPharmaCart', JSON.stringify(cart));
    };

    // Fonction pour mettre à jour le compteur du panier (Header Icon)
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

    // 1. DYNAMIQUE D'AJOUTER AU PANIER (sur index/produits/promotions)
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // Récupération des données du produit (simulées)
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = e.target.getAttribute('data-product-id');
            const name = card.querySelector('h3').textContent;
            // Extrait le prix (ex: 65.00 DT -> 65.00)
            const priceText = card.querySelector('.product-price').textContent.replace(' DT', '').replace(',', '.').trim();
            const price = parseFloat(priceText);
            
            // Gestion de l'ajout/mise à jour
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: productId, name, price, quantity: 1, image: 'https://via.placeholder.com/60x60' });
            }

            saveCart(cart);
            updateCartCount(cart);

            // Feedback visuel
            e.target.innerHTML = 'Ajouté ! <i class="fas fa-check"></i>';
            setTimeout(() => {
                e.target.innerHTML = 'Ajouter <i class="fas fa-cart-plus"></i>';
            }, 1000);
            
            console.log(`Produit ${name} ajouté. Nouveau total: ${updateCartCount(cart)}`);
        });
    });


    // 2. DYNAMIQUE D'AFFICHAGE DU PANIER (sur cart.html uniquement)
    const cartTableBody = document.querySelector('.cart-table tbody');
    const cartSummary = document.querySelector('.cart-summary');

    if (cartTableBody && cartSummary) {
        
        // Fonction principale de rendu
        const renderCart = () => {
            // Affiche le contenu dans le tableau (tbody)
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

        // Fonction pour mettre à jour le résumé (Total)
        const updateSummary = () => {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 99 ? 0 : 7.00; // Livraison gratuite dès 99 DT
            const total = subtotal + shipping;

            // Mise à jour des éléments dans la carte de résumé
            const subtotalEl = cartSummary.querySelector('.summary-line:nth-child(1) .value');
            const shippingEl = cartSummary.querySelector('.summary-line:nth-child(2) .value');
            const totalEl = cartSummary.querySelector('.total-value');
            
            if(subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} DT`;
            
            if(shippingEl) {
                shippingEl.textContent = shipping === 0 ? 'GRATUITS' : `${shipping.toFixed(2)} DT`;
                if (shipping === 0) {
                    shippingEl.classList.add('free-shipping');
                } else {
                    shippingEl.classList.remove('free-shipping');
                }
            }
            
            if(totalEl) totalEl.textContent = `${total.toFixed(2)} DT`;

            updateCartCount(cart);
        };
        
        // --- ÉVÉNEMENTS DANS LE PANIER ---

        // Gestion de la modification de quantité et de la suppression
        cartTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const productId = e.target.getAttribute('data-product-id');
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity <= 0) {
                    e.target.value = 1; // Empêche d'avoir 0
                    return;
                }
                
                const item = cart.find(i => i.id === productId);
                if (item) {
                    item.quantity = newQuantity;
                    saveCart(cart);
                    renderCart(); 
                }
            }
        });

        cartTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                e.preventDefault();
                const productId = e.target.closest('.remove-btn').getAttribute('data-product-id');
                
                // Filtre pour garder tous les éléments SAUF celui à supprimer
                cart = cart.filter(item => item.id !== productId);
                
                saveCart(cart);
                renderCart(); // Re-rend le tableau
            }
        });

        // Premier appel pour afficher le panier au chargement de la page
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
        // La classe fade-in-section est ajoutée dans le HTML, nous observons directement
        observer.observe(section);
    });
});
