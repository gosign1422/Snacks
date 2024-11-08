// Cart state
let cart = [];
let total = 0;
let isFirstTimeUser = !localStorage.getItem('hasVisitedBefore');

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
const cartTooltip = document.getElementById('cart-tooltip');

// Add to cart functionality
document.querySelectorAll('.quantity-controls').forEach(control => {
    const addBtn = control.querySelector('.add-to-cart');
    const minusBtn = control.querySelector('.quantity-btn.minus');
    const quantitySpan = control.querySelector('.quantity');
    const productId = parseInt(control.dataset.id);
    const maxQuantity = parseInt(control.dataset.max);

    addBtn.addEventListener('click', () => updateQuantity(productId, 1, maxQuantity));
    minusBtn?.addEventListener('click', () => updateQuantity(productId, -1, maxQuantity));
});

function updateQuantity(productId, change, maxQuantity) {
    const controls = document.querySelectorAll(`.quantity-controls[data-id="${productId}"]`);
    controls.forEach(control => {
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
            const newQuantity = item.quantity + change;
            if (newQuantity <= maxQuantity && newQuantity >= 0) {
                item.quantity = newQuantity;
                
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
        }
    });

    updateCart();
    showTooltipIfFirstTime();
}

// Update cart display
function updateCart() {
    if (cart.length === 0) {
        cartButton.classList.add('hidden');
        cartTooltip.classList.add('hidden');
        return;
    }

    cartButton.classList.remove('hidden');
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    cartTotal.textContent = `₹${total}`;
    
    updateCheckout();
}

function showTooltipIfFirstTime() {
    if (isFirstTimeUser && cart.length > 0) {
        cartTooltip.classList.remove('hidden');
        localStorage.setItem('hasVisitedBefore', 'true');
    }
}

function dismissTooltip() {
    cartTooltip.classList.add('hidden');
    isFirstTimeUser = false;
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

// Payment Integration
function handleOnlinePayment() {
    try {
        const finalAmount = getFinalAmount();
        if (!finalAmount || finalAmount <= 0) {
            alert("Invalid payment amount. Please check your cart.");
            return;
        }

        const upiId = "yashgusain6002@okhdfcbank"; // actual UPI ID
        const merchantName = "Agrasen Mansion Hostel Snacks";
        const transactionNote = `Order Payment - ${cart.map(item => `${item.name} x ${item.quantity}`).join(', ')}`;

        // Ensure cart is not empty
        if (!cart.length) {
            alert("Your cart is empty. Please add items to proceed.");
            return;
        }

        // Create UPI intent link with common parameters for all UPI apps
        const upiIntent = {
            pa: upiId,
            pn: merchantName,
            tr: generateTransactionId(),
            am: finalAmount.toFixed(2), // Format to two decimal places for currency accuracy
            cu: 'INR',
            tn: transactionNote
        };
        const intentUrl = `upi://pay?${new URLSearchParams(upiIntent).toString()}`;

        // Display a "Processing Payment" message
        alert("Processing the payment. Please wait...");

        // Check if the user is on a mobile device
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // For iOS devices, use a slightly different approach
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                // Create an invisible iframe to attempt opening the UPI app
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = intentUrl;
                document.body.appendChild(iframe);

                // Fallback alert if the UPI app does not open within 2.5 seconds
                setTimeout(() => {
                    if (document.hidden) return; // User successfully left for the payment app
                    alert("If the UPI app didn't open, please try again from a supported UPI app.");
                    document.body.removeChild(iframe);
                }, 2500);
            } else {
                // For Android devices, redirect directly to the UPI intent URL
                window.location.href = intentUrl;

                // Fallback alert if the UPI app does not open within 2.5 seconds
                setTimeout(() => {
                    if (document.hidden) return; // User successfully left for the payment app
                    alert("If the UPI app didn't open, please try again from a supported UPI app.");
                }, 2500);
            }
        } else {
            // Notify the user if on desktop, as UPI payments require a mobile device
            alert("UPI payments can only be initiated from a mobile device. Please try using a mobile UPI app.");
        }
    } catch (error) {
        console.error("Error initiating payment:", error);
        alert("An error occurred while trying to initiate the payment. Please try again.");
    }
}

// Generate a unique transaction ID
function generateTransactionId() {
    return `ORDER${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate the final amount based on delivery type and cart total
function getFinalAmount() {
    const isInstantDelivery = document.querySelector('input[name="delivery"]:checked').value === 'instant';
    const deliveryFee = isInstantDelivery ? 15 : 0;
    return total + deliveryFee;                                        
  
  
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

// Handle COD warning
function handleCodClick() {
    codWarning.classList.remove('hidden');
}

