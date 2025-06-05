const minQty = {
  Embroidery: 12,
  'Use What I’ve Already Created': 12,
  Patches: 24,
  'Screen Print': 24
};

const qtyInputSelector = '.product-form__input quantity-input';
window.addEventListener('option:changed', async (e) => {
  if (e.detail.name === 'Customization Method') {
    const customizationMethod = e.detail.value;
    const qtyInput = document.querySelector(qtyInputSelector);
    const qty = minQty[customizationMethod].toString();

    qtyInput.input.setAttribute('min', qty);
    qtyInput.input.setAttribute('data-min', qty);
    qtyInput.input.value = qty;
    qtyInput.dispatchEvent(new Event('change'));

  }
});
