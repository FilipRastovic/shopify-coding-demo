document.addEventListener('DOMContentLoaded', function() {
  // State object to hold the state of the application
  const state = {
    selectedVariantId: null,
    quantity: 1,
    currentIndex: 0,
    images: [],
  };

  // Initialize state and add event listeners
  function initialize() {
    state.selectedVariantId = document.getElementById('variant-select').value;
    state.images = Array.from(document.querySelectorAll('.small-product-image')).map(img => img.getAttribute('data-large-src'));

    // Add the border class to the first image by default
    const firstImage = document.querySelector('.small-product-image');
    if (firstImage) {
      firstImage.classList.add('border', 'p-1');
    }

    // Set initial main image
    document.getElementById('main-product-image').setAttribute('src', state.images[0]);

    // Add event listeners
    addEventListeners();
  }

  // Update main image based on the current index
  function updateMainImage(index) {
    state.currentIndex = index;
    const mainImage = document.getElementById('main-product-image');
    mainImage.setAttribute('src', state.images[index]);

    // Update border classes
    document.querySelectorAll('.small-product-image').forEach((img, idx) => {
      img.classList.toggle('border', idx === index);
      img.classList.toggle('p-1', idx === index);
    });
  }

  // Update quantity and price
  function updateQuantity(newQuantity) {
    state.quantity = newQuantity;
    document.getElementById('quantity').value = newQuantity.toString().padStart(2, '0');
    updatePrice();
  }

  // Update price based on the selected variant and quantity
  function updatePrice() {
    const variantSelect = document.getElementById('variant-select');
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    const newPrice = selectedOption.getAttribute('data-price');
    const totalPrice = parseFloat(newPrice) * state.quantity;
    document.getElementById('add-to-cart-button').innerHTML = `ADD TO CART - $${totalPrice.toFixed(2)} <span class="text-[#AD9F98]">$${(totalPrice + 10).toFixed(2)}</span>`;
  }

  // Add event listeners to handle user interactions
  function addEventListeners() {
    document.querySelectorAll('.small-product-image').forEach((image, index) => {
      image.addEventListener('click', () => updateMainImage(index));
    });

    document.getElementById('next-button').addEventListener('click', () => {
      const nextIndex = (state.currentIndex + 1) % state.images.length;
      updateMainImage(nextIndex);
    });

    document.getElementById('prev-button').addEventListener('click', () => {
      const prevIndex = (state.currentIndex - 1 + state.images.length) % state.images.length;
      updateMainImage(prevIndex);
    });

    document.querySelectorAll('.qtybox .btnqty').forEach(button => {
      button.addEventListener('click', () => {
        const newQuantity = state.quantity + (button.classList.contains('qtyplus') ? 1 : -1);
        if (newQuantity > 0) {
          updateQuantity(newQuantity);
        }
      });
    });

    document.getElementById('variant-select').addEventListener('change', function() {
      state.selectedVariantId = this.value;
      updatePrice();
    });

    document.getElementById('add-to-cart-button').addEventListener('click', function() {
      const quantity = state.quantity;
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: state.selectedVariantId,
          quantity: quantity
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Product added to cart:', data);
        const notificationBox = document.getElementById('notification-box');
        notificationBox.classList.remove('hidden');
        notificationBox.classList.add('fade-in');
        setTimeout(() => notificationBox.classList.remove('fade-in'), 500);
        setTimeout(() => notificationBox.classList.add('hidden'), 3000);
      })
      .catch(error => console.error('Error adding product to cart:', error));
    });

    document.querySelectorAll('.color-swatch').forEach(function(swatch) {
      swatch.addEventListener('click', function() {
        var newImageSrc = this.getAttribute('data-image');
        var newColor = this.getAttribute('data-color');
        state.selectedVariantId = this.getAttribute('data-variant-id');
        console.log('Selected Variant ID:', state.selectedVariantId); // Debugging log
        document.querySelectorAll('.main-product-image').forEach(function(mainImage) {
          mainImage.setAttribute('src', newImageSrc);
        });

        // Remove the Tailwind border classes from all swatches
        document.querySelectorAll('.color-swatch').forEach(function(swatch) {
          swatch.classList.remove('border-2', 'border-gray-300');
        });

        // Add the Tailwind border classes to the clicked swatch
        this.classList.add('border-2', 'border-gray-300');

        // Update the notification swatch background color
        var notificationSwatch = document.querySelector('.notification-swatch');
        if (notificationSwatch) {
          notificationSwatch.style.backgroundColor = newColor;
        }
      });
    });
  }

  // Initialize the application
  initialize();
});