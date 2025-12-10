document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DYNAMIQUE DU COMPTEUR DE PANIER
    let cartCount = 0;
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

    // Tente de lire le nombre actuel de produits dans le panier (pour les pages cart/register)
    if (cartCountElement) {
        cartCount = parseInt(cartCountElement.textContent) || 0;
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // Mise à jour du compteur
            cartCount++;
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
            }

            // Feedback visuel rapide (Ajouté !)
            e.target.textContent = 'Ajouté !';
            setTimeout(() => {
                // Rétablit le bouton après 1 seconde
                e.target.innerHTML = 'Ajouter <i class="fas fa-cart-plus"></i>';
            }, 1000);
            
            console.log(`Un produit a été ajouté au panier. Nouveau total : ${cartCount}`);
        });
    });

    // 2. DYNAMIQUE D'APPARITION AU SCROLL (Fade-in)
    const sections = document.querySelectorAll('section, footer, .form-container');

    // On utilise IntersectionObserver pour détecter l'entrée dans la zone de vue
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // Déclenchement à 10% de visibilité
    });

    sections.forEach(section => {
        section.classList.add('fade-in-section'); // Classe de base pour l'effet
        observer.observe(section);
    });
});
