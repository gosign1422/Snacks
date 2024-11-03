// Cart state
let cart = [];
let total = 0;

// DOM Elements
const cartButton = document.getElementById('cart-button');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const shopPage = document.getElementById('shop-page');
const checkoutPage = document.getElementById('checkout-page');
const orderItems = document.getElementById('order-items');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const deliveryFee = document.querySelector('.delivery-fee');
const pickupTime = document.getElementById('pickup-time');
const roomNumber = document.getElementById('room-number');
const codWarning = document.getElementById('cod-warning');

// Add to cart functionality
document.querySelectorAll('.quantity-controls').forEach(control => {
    const addBtn = control.querySelector('.add-to-cart');
    const minusBtn = control.querySelector('.quantity-btn.minus');
    const quantitySpan = control.querySelector('.quantity');
    const productId = parseInt(control.dataset.id);

    addBtn.addEventListener('click', () => updateQuantity(productId, 1));
    minusBtn?.addEventListener('click', () => updateQuantity(productId, -1));
});

function updateQuantity(productId, change) {
    const control = document.querySelector(`.quantity-controls[data-id="${productId}"]`);
    const addBtn = control.querySelector('.add-to-cart');
    const minusBtn = control.querySelector('.quantity-btn.minus');
    const quantitySpan = control.querySelector('.quantity');
    const price = parseInt(addBtn.dataset.price);
    const name = control.closest('.product-card').querySelector('h3').textContent;

    let item = cart.find(i => i.id === productId);
    
    if (!item && change > 0) {
        item = { id: productId, name, price, quantity: 0 };
        cart.push(item);
    }

    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
            minusBtn.classList.add('hidden');
            quantitySpan.classList.add('hidden');
            addBtn.classList.remove('hidden');
        } else {
            minusBtn.classList.remove('hidden');
            quantitySpan.classList.remove('hidden');
            addBtn.classList.add('hidden');
            quantitySpan.textContent = item.quantity;
        }
    }

    updateCart();
}

// Update cart display
function updateCart() {
    if (cart.length === 0) {
        cartButton.classList.add('hidden');
        return;
    }

    cartButton.classList.remove('hidden');
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    cartTotal.textContent = `₹${total}`;
    
    updateCheckout();
}

// Update checkout display
function updateCheckout() {
    orderItems.innerHTML = cart.map(item => `
        <div class="flex justify-between mb-2">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
    
    subtotalElement.textContent = `₹${total}`;
    updateTotal();
}

// Handle delivery option change
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'instant') {
            pickupTime.classList.add('hidden');
            roomNumber.classList.remove('hidden');
            deliveryFee.classList.remove('hidden');
        } else {
            pickupTime.classList.remove('hidden');
            roomNumber.classList.add('hidden');
            deliveryFee.classList.add('hidden');
        }
        updateTotal();
    });
});

// Update total with delivery fee
function updateTotal() {
    const isInstantDelivery = document.querySelector('input[name="delivery"]:checked').value === 'instant';
    const deliveryFee = isInstantDelivery ? 15 : 0;
    const finalTotal = total + deliveryFee;
    totalElement.textContent = `₹${finalTotal}`;
}

// Handle COD warning
function handleCodClick() {
    codWarning.classList.remove('hidden');
}

// Navigation functions
function showCheckout() {
    shopPage.classList.remove('active');
    checkoutPage.classList.add('active');
    updateCheckout();
}

function showShop() {
    checkoutPage.classList.remove('active');
    shopPage.classList.add('active');
}