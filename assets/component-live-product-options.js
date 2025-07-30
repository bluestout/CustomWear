/*
====================================================
START - QUANTITY RULES EVENT LISTENER
====================================================
*/
const minQty = {
  'Embroidery': 12,
  "Use What I've Already Created": 12,
  'Patches': 24,
  'Screen Print': 12
};

// Store matching cart item properties
let matchingCartItemProperties = null;

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

const qtyInputSelector = '.product-form__input quantity-input';
window.addEventListener('option:changed', async (e) => {
  if (e.detail.name === 'Customization Method') {
    const customizationMethod = e.detail.value;

    // Store the customization method for cart matching
    if (window.cartMatchingProducts) {
      window.cartMatchingProducts.currentCustomizationMethod = customizationMethod;
    }

    const qtyInput = document.querySelector(qtyInputSelector);
    if (customizationMethod === "Use What I’ve Already Created") {
      // Check if there's a matching cart item with Patches customization method
      let qty = "12"; // default quantity
      if (matchingCartItemProperties) {
        const cartCustomizationMethod = getPropertyValue(matchingCartItemProperties, 'Customization Method');
        if (cartCustomizationMethod === "Patches") {
          qty = "24";
        }
      }
      qtyInput.input.setAttribute('min', qty);
      qtyInput.input.setAttribute('data-min', qty);
      qtyInput.input.value = qty;
      qtyInput.dispatchEvent(new Event('change'));

    } else if (minQty[customizationMethod]) {
      const qty = minQty[customizationMethod].toString();
      qtyInput.input.setAttribute('min', qty);
      qtyInput.input.setAttribute('data-min', qty);
      qtyInput.input.value = qty;
      qtyInput.dispatchEvent(new Event('change'));
    }
  }
});


/*
====================================================
END - QUANTITY RULES EVENT LISTENER
====================================================
*/

function getPropertyValue(properties, propertyName) {
  const propertyArray = properties.find(prop => prop[0] === propertyName);
  return propertyArray ? propertyArray[1] : null;
}

function passCartItemPropertiesToForm(cartItemProperties) {
  const form = document.querySelector('form[action="/cart/add"]');
  if (!form) return;

  // Remove existing hidden property inputs that might conflict
  const existingPropertyInputs = form.querySelectorAll('input[name^="properties["]');
  existingPropertyInputs.forEach(input => {
    if (!input.name.includes('SKU') &&
      !input.name.includes('Brand') &&
      !input.name.includes('Additional instructions')) {
      input.remove();
    }
  });

  // Add all properties from the cart item to the form
  cartItemProperties.forEach(([propertyName, propertyValue]) => {
    if (propertyName === 'SKU' || propertyName === 'Brand') {
      return;
    }

    // Skip Additional instructions only if it's empty
    if (propertyName === 'Additional instructions' && (!propertyValue || propertyValue.trim() === '')) {
      return;
    }

    // Skip customizer options properties
    if (propertyName === '_cl_options_quantity_id' ||
      propertyName === '_cl_options_id' ||
      propertyName === '_cl_options_price' ||
      propertyName === '_cl_options_quantity_discount' ||
      propertyName === '_cl_options') {
      return;
    }


    // Decode HTML entities in property name
    const decodedPropertyName = decodeHTMLEntities(propertyName);
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `properties[${decodedPropertyName}]`;
    hiddenInput.value = propertyValue;
    hiddenInput.classList.add('cart-item-property');
    form.appendChild(hiddenInput);
  });
}

function removeCartItemPropertiesFromForm() {
  const form = document.querySelector('form[action="/cart/add"]');
  if (!form) return;

  // Remove all hidden inputs that were added from cart item properties
  const cartItemPropertyInputs = form.querySelectorAll('input.cart-item-property');
  cartItemPropertyInputs.forEach(input => {
    input.remove();
  });
}

function matchAndClickCustomizerOptions() {
  const cartItemProperties = document.querySelectorAll('.cart-item-property');
  
  // Track values we've already processed to avoid duplicates
  const processedValues = new Set();
  
  cartItemProperties.forEach(cartProperty => {
    const cartValue = cartProperty.value;
    const propertyName = cartProperty.name;
    
    // Skip if we've already processed this value
    if (processedValues.has(cartValue)) {
      return;
    }
    
    // Skip certain properties that shouldn't be matched automatically
    // Skip specific sub-properties for additional locations, but allow main "Additional Location" property
    if (propertyName.includes('Right -') || 
        propertyName.includes('Left -') || 
        propertyName.includes('Back -') ||
        propertyName.includes('_cl_options') ||
        propertyName.includes('SKU') ||
        propertyName.includes('Brand')) {
      return;
    }
    
    // Skip empty values
    if (!cartValue || cartValue.trim() === '') {
      return;
    }
    
    // Add to processed values
    processedValues.add(cartValue);
    
    const customizerOptions = document.querySelectorAll('.cl-po--option[data-option="Use What I’ve Already Created"] [value="' + cartValue + '"]');
    customizerOptions.forEach(option => {
      setTimeout(() => {
        if (option.value === cartValue) {
          if (option.type === 'checkbox' || option.type === 'radio') {
            if (!option.checked) {
              option.click();
            }
          } else if (option.tagName.toLowerCase() === 'option') {
            if (!option.selected) {
              option.click();
            }
          } else {
            if (!option.checked && !option.selected) {
              option.click();
            }
          }
        }
      }, 200);
    });
  });
}

function useWhatIHaveAlreadyCreated() {
  const cartItem = document.querySelector('.item-properties-data-1');
  const itemPropertiesData = cartItem.dataset.itemProperties;
  const properties = JSON.parse(itemPropertiesData);
  let showUseWhatIHaveAlreadyCreated = false;

  setTimeout(() => {
    const cartCustomizationMethod = getPropertyValue(properties, 'Customization Method');
    if (cartCustomizationMethod) {
      const choicesItems = document.querySelectorAll('.choices__item--choice[data-value]');
      const matchingChoice = Array.from(choicesItems).find(choice =>
        choice.getAttribute('data-value') === cartCustomizationMethod
      );

      const productPageSelectedCustomizationMethod = document.querySelector('select[name="properties[Customization Method]"]').value;
      if (cartCustomizationMethod === "Embroidery" && productPageSelectedCustomizationMethod === "Embroidery") {
        const cartCustomizationType = getPropertyValue(properties, 'Customization Type');
        if (matchingChoice && cartCustomizationType) {
          const productPageCustomizationType = document.querySelectorAll('input[name="properties[Customization Type]"]');
          productPageCustomizationType.forEach(input => {
            if (cartCustomizationType === input.value) {
              showUseWhatIHaveAlreadyCreated = true;
              matchingCartItemProperties = properties;
            }
          });
        }
      } else if (matchingChoice) {
        showUseWhatIHaveAlreadyCreated = true;
        matchingCartItemProperties = properties;
      }
    }

    if (showUseWhatIHaveAlreadyCreated) {
      const useWhatIHaveAlreadyCreated = document.querySelectorAll('.choices__item[data-value="Use What I’ve Already Created"]')
      useWhatIHaveAlreadyCreated.forEach(choice => {
        choice.style.display = 'block';
      });

      const currentSelectedMethod = document.querySelector('select[name="properties[Customization Method]"]').value;
      if (currentSelectedMethod === "Use What I’ve Already Created" && matchingCartItemProperties) {
        passCartItemPropertiesToForm(matchingCartItemProperties);
        matchAndClickCustomizerOptions();

        const cartCustomizationMethod = getPropertyValue(matchingCartItemProperties, 'Customization Method');
        if (cartCustomizationMethod === "Patches") {
          const qtyInput = document.querySelector(qtyInputSelector);
          if (qtyInput) {
            const qty = "24";
            qtyInput.input.setAttribute('min', qty);
            qtyInput.input.setAttribute('data-min', qty);
            qtyInput.input.value = qty;
            qtyInput.dispatchEvent(new Event('change'));
          }
        }

      } else {
        removeCartItemPropertiesFromForm(matchingCartItemProperties);
      }
    } else {
      const useWhatIHaveAlreadyCreated = document.querySelectorAll('.choices__item[data-value="Use What I’ve Already Created"]')
      useWhatIHaveAlreadyCreated.forEach(choice => {
        choice.style.display = 'none';
      });
      matchingCartItemProperties = null;
    }

  }, 300);
}

document.addEventListener('AppOptionsLoaded', () => {
  useWhatIHaveAlreadyCreated();
});

window.addEventListener('option:changed', () => {
  useWhatIHaveAlreadyCreated();
});

window.addEventListener('cart:items-updated', () => {
  useWhatIHaveAlreadyCreated();
});