/**
 * Live Product Options Component
 * Handles dynamic product customization, quantity rules, and cart item matching
 */

// =============================================================================
// CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Minimum quantity requirements for different customization methods
 */
const MINIMUM_QUANTITIES = {
  'Embroidery': 12,
  "Use What I’ve Already Created": 12,
  'Patches': 24,
  'Screen Print': 24
};

/**
 * DOM selectors used throughout the component
 */
const SELECTORS = {
  quantityInput: '.product-form__input quantity-input',
  addToCartForm: 'form[action="/cart/add"]',
  cartItemData: '.item-properties-data-1',
  customizerOptions: '.cl-po--option[data-option="Use What I’ve Already Created"]',
  useWhatCreatedChoices: '.choices__item[data-value="Use What I’ve Already Created"]',
  customizationMethodSelect: 'select[name="properties[Customization Method]"]',
  customizationTypeInputs: 'input[name="properties[Customization Type]"]',
  additionalInstructionsTextarea: 'textarea[name="properties[Additional instructions]"]',
  cartItemPropertyInputs: '.cart-item-property'
};

// =============================================================================
// GLOBAL STATE
// =============================================================================

/**
 * Stores matching cart item properties for reuse functionality
 * @type {Array|null}
 */
let matchingCartItemProperties = null;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Decodes HTML entities in text
 * @param {string} text - Text containing HTML entities
 * @returns {string} Decoded text
 */
function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Retrieves a property value from cart item properties array
 * @param {Array} properties - Array of property key-value pairs
 * @param {string} propertyName - Name of the property to find
 * @returns {string|null} Property value or null if not found
 */
function getPropertyValue(properties, propertyName) {
  const propertyArray = properties.find(prop => prop[0] === propertyName);
  return propertyArray ? propertyArray[1] : null;
}

/**
 * Updates quantity input with new minimum value and sets appropriate quantity list
 * @param {string} quantity - New quantity value
 * @param {string} customizationMethod - The customization method to determine quantity list
 */
function updateQuantityInput(quantity, customizationMethod = null) {
  const qtyInput = document.querySelector(SELECTORS.quantityInput);
  if (!qtyInput) return;
  
  // Set the appropriate quantity list based on customization method
  if (customizationMethod && typeof qtyInput.setQuantityListForMethod === 'function') {
    qtyInput.setQuantityListForMethod(customizationMethod);
  }
  
  qtyInput.input.setAttribute('min', quantity);
  qtyInput.input.setAttribute('data-min', quantity);
  qtyInput.input.value = quantity;
  qtyInput.dispatchEvent(new Event('change'));
}

// =============================================================================
// QUANTITY MANAGEMENT
// =============================================================================

/**
 * Handles quantity rules based on customization method changes
 * @param {CustomEvent} event - Option changed event
 */
function handleQuantityRules(event) {
  if (event.detail.name !== 'Customization Method') return;
  
  const customizationMethod = event.detail.value;
  
  // Store the customization method for cart matching
  if (window.cartMatchingProducts) {
    window.cartMatchingProducts.currentCustomizationMethod = customizationMethod;
  }
  
  if (customizationMethod === "Use What I've Already Created") {
    handleUseWhatCreatedQuantity();
  } else if (MINIMUM_QUANTITIES[customizationMethod]) {
    const quantity = MINIMUM_QUANTITIES[customizationMethod].toString();
    updateQuantityInput(quantity, customizationMethod);
  }
}

/**
 * Handles quantity for "Use What I've Already Created" option
 */
function handleUseWhatCreatedQuantity() {
  let quantity = "12"; // default quantity
  let customizationMethod = null;
  
  if (matchingCartItemProperties) {
    const cartCustomizationMethod = getPropertyValue(matchingCartItemProperties, 'Customization Method');
    customizationMethod = cartCustomizationMethod;
    if (cartCustomizationMethod === "Patches" || cartCustomizationMethod === "Screen Print") {
      quantity = "24";
    }
  }
  
  updateQuantityInput(quantity, customizationMethod);
}

// =============================================================================
// FORM PROPERTY MANAGEMENT
// =============================================================================

/**
 * Adds cart item properties to the product form as hidden inputs
 * @param {Array} cartItemProperties - Array of property key-value pairs
 */
function passCartItemPropertiesToForm(cartItemProperties) {
  const form = document.querySelector(SELECTORS.addToCartForm);
  if (!form) return;
  
  // Remove existing property inputs (except SKU and Brand)
  removeExistingPropertyInputs(form);
  
  // Add cart item properties to form
  cartItemProperties.forEach(([propertyName, propertyValue]) => {
    if (shouldSkipProperty(propertyName)) return;
    
    const decodedPropertyName = decodeHTMLEntities(propertyName);
    const hiddenInput = createPropertyInput(decodedPropertyName, propertyValue);
    form.appendChild(hiddenInput);
  });
}

/**
 * Removes existing property inputs from form (except protected ones)
 * @param {HTMLElement} form - The form element
 */
function removeExistingPropertyInputs(form) {
  const existingPropertyInputs = form.querySelectorAll('input[name^="properties["]');
  existingPropertyInputs.forEach(input => {
    if (!input.name.includes('SKU') && !input.name.includes('Brand')) {
      input.remove();
    }
  });
}

/**
 * Determines if a property should be skipped when adding to form
 * @param {string} propertyName - Name of the property
 * @returns {boolean} True if property should be skipped
 */
function shouldSkipProperty(propertyName) {
  const skipProperties = [
    'SKU', 
    'Brand', 
    '_cl_options_quantity_id',
    '_cl_options_id',
    '_cl_options_quantity_discount',
    '_cl_options'
  ];
  
  return skipProperties.includes(propertyName);
}

/**
 * Creates a hidden input element for a property
 * @param {string} propertyName - Name of the property
 * @param {string} propertyValue - Value of the property
 * @returns {HTMLInputElement} Hidden input element
 */
function createPropertyInput(propertyName, propertyValue) {
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = `properties[${propertyName}]`;
  hiddenInput.value = propertyValue;
  hiddenInput.classList.add('cart-item-property');
  return hiddenInput;
}

/**
 * Removes all cart item property inputs from the form
 */
function removeCartItemPropertiesFromForm() {
  const form = document.querySelector(SELECTORS.addToCartForm);
  if (!form) return;
  
  const cartItemPropertyInputs = form.querySelectorAll(SELECTORS.cartItemPropertyInputs);
  cartItemPropertyInputs.forEach(input => input.remove());
}

/**
 * Handles additional instructions before form submission
 */
function handleAdditionalInstructionsBeforeSubmit() {
  const additionalInstructionsTextarea = document.querySelector(SELECTORS.additionalInstructionsTextarea);
  if (!additionalInstructionsTextarea) return;
  
  const value = additionalInstructionsTextarea.value.trim();
  const existingHiddenInput = document.querySelector('.cart-item-property[name="properties[Additional instructions]"]');
  
  if (value && existingHiddenInput) {
    existingHiddenInput.value = value;
  }
}

// =============================================================================
// CUSTOMIZER OPTIONS MANAGEMENT
// =============================================================================

/**
 * Matches and clicks customizer options based on cart item properties
 */
function matchAndClickCustomizerOptions() {
  const cartItemProperties = document.querySelectorAll(SELECTORS.cartItemPropertyInputs);

  cartItemProperties.forEach(cartProperty => {
    const propertyName = cartProperty.name.match(/properties\[(.*)\]/)?.[1] || '';
    if (propertyName.startsWith('Left - ') ||
      propertyName.startsWith('Right - ') ||
      propertyName.startsWith('Back') ||
      propertyName.startsWith('_cl_options_json')) {
      return;
    }

    const cartValue = cartProperty.value;

    const customizerOptions = document.querySelectorAll('.cl-po--option[data-option="Use What I’ve Already Created"] [value="' + cartValue + '"]');
    customizerOptions.forEach(option => {
      if (option.value === cartValue) {
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
      }
    });
  });
}

/**
 * Extracts property name from input name attribute
 * @param {string} inputName - Input name attribute
 * @returns {string} Extracted property name
 */
function extractPropertyName(inputName) {
  return inputName.match(/properties\[(.*)\]/)?.[1] || '';
}

/**
 * Determines if a property should be skipped for customizer options
 * @param {string} propertyName - Name of the property
 * @returns {boolean} True if property should be skipped
 */
function shouldSkipCustomizerProperty(propertyName) {
  return propertyName.startsWith('Left - ') ||
         propertyName.startsWith('Right - ') ||
         propertyName.startsWith('Back') ||
         propertyName.startsWith('_cl_options_json');
}

/**
 * Clicks an option element if it's not already selected
 * @param {HTMLElement} option - Option element to click
 */
function clickOptionIfNeeded(option) {
  if (option.type === 'checkbox' || option.type === 'radio') {
    if (!option.checked) option.click();
  } else if (option.tagName.toLowerCase() === 'option') {
    if (!option.selected) option.click();
  } else {
    if (!option.checked && !option.selected) option.click();
  }
}

/**
 * Resets all customizer options (checkboxes and radio buttons)
 */
function resetCustomizerOptions() {
  // Reset checkboxes
  const checkboxes = document.querySelectorAll(
    `${SELECTORS.customizerOptions} input[type="checkbox"]`
  );
  resetInputElements(checkboxes);
  
  // Reset radio buttons
  const radios = document.querySelectorAll(
    `${SELECTORS.customizerOptions} input[type="radio"]`
  );
  resetInputElements(radios);
}

/**
 * Resets input elements and triggers change events
 * @param {NodeList} elements - Input elements to reset
 */
function resetInputElements(elements) {
  elements.forEach(element => {
    if (element.checked) {
      element.checked = false;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// =============================================================================
// "USE WHAT I'VE ALREADY CREATED" FUNCTIONALITY
// =============================================================================

/**
 * Main function to handle "Use What I've Already Created" functionality
 */
function useWhatIHaveAlreadyCreated() {
  const cartItem = document.querySelector(SELECTORS.cartItemData);
  if (!cartItem) return;
  
  const itemPropertiesData = cartItem.dataset.itemProperties;
  const properties = JSON.parse(itemPropertiesData);
  
  setTimeout(() => {
    const shouldShow = shouldShowUseWhatCreated(properties);
    toggleUseWhatCreatedVisibility(shouldShow);
    
    if (shouldShow) {
      handleUseWhatCreatedSelection(properties);
    } else {
      matchingCartItemProperties = null;
    }
  }, 300);
}

/**
 * Determines if "Use What I've Already Created" option should be shown
 * @param {Array} properties - Cart item properties
 * @returns {boolean} True if option should be shown
 */
function shouldShowUseWhatCreated(properties) {
  const cartCustomizationMethod = getPropertyValue(properties, 'Customization Method');
  if (!cartCustomizationMethod) return false;
  
  const choicesItems = document.querySelectorAll('.choices__item--choice[data-value]');
  const matchingChoice = Array.from(choicesItems).find(choice =>
    choice.getAttribute('data-value') === cartCustomizationMethod
  );
  
  if (!matchingChoice) return false;
  
  const productPageSelectedMethod = document.querySelector(SELECTORS.customizationMethodSelect).value;
  
  // Special handling for Embroidery
  if (cartCustomizationMethod === "Embroidery" && productPageSelectedMethod === "Embroidery") {
    return checkEmbroideryMatch(properties);
  }
  
  matchingCartItemProperties = properties;
  return true;
}

/**
 * Checks if embroidery customization type matches
 * @param {Array} properties - Cart item properties
 * @returns {boolean} True if embroidery types match
 */
function checkEmbroideryMatch(properties) {
  const cartCustomizationType = getPropertyValue(properties, 'Customization Type');
  if (!cartCustomizationType) return false;
  
  const productPageCustomizationType = document.querySelectorAll(SELECTORS.customizationTypeInputs);
  
  for (const input of productPageCustomizationType) {
    if (cartCustomizationType === input.value) {
      matchingCartItemProperties = properties;
      return true;
    }
  }
  
  return false;
}

/**
 * Toggles visibility of "Use What I've Already Created" option
 * @param {boolean} show - Whether to show the option
 */
function toggleUseWhatCreatedVisibility(show) {
  const useWhatCreatedChoices = document.querySelectorAll(SELECTORS.useWhatCreatedChoices);
  useWhatCreatedChoices.forEach(choice => {
    choice.style.display = show ? 'block' : 'none';
  });
}

/**
 * Handles selection of "Use What I've Already Created" option
 * @param {Array} properties - Cart item properties
 */
function handleUseWhatCreatedSelection(properties) {
  const currentSelectedMethod = document.querySelector(SELECTORS.customizationMethodSelect).value;
  
  if (currentSelectedMethod === "Use What I’ve Already Created" && matchingCartItemProperties) {
    passCartItemPropertiesToForm(matchingCartItemProperties);
    matchAndClickCustomizerOptions();
    handleAdditionalInstructionsBeforeSubmit();
    handlePatchesQuantity();
  } else {
    removeCartItemPropertiesFromForm();
  }
}

/**
 * Handles special quantity rules for Patches and Screen Print customization methods
 * Note: Both start at 24, but Screen Print max is 1008 while Patches max is 1500
 */
function handlePatchesQuantity() {
  const cartCustomizationMethod = getPropertyValue(matchingCartItemProperties, 'Customization Method');
  if (cartCustomizationMethod === "Patches" || cartCustomizationMethod === "Screen Print") {
    updateQuantityInput("24", cartCustomizationMethod);
  }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

window.addEventListener('option:changed', handleQuantityRules);
window.addEventListener('option:changed', useWhatIHaveAlreadyCreated);
document.addEventListener('AppOptionsLoaded', useWhatIHaveAlreadyCreated);

// Add event listener for form submission to handle Additional instructions
document.addEventListener('DOMContentLoaded', () => {
  const addToCartForm = document.querySelector('form[action="/cart/add"]');
  if (addToCartForm) {
    addToCartForm.addEventListener('submit', (e) => {
      handleAdditionalInstructionsBeforeSubmit();
      resetCustomizerOptions();
    });
  }
});