/* Catering Quote Builder — Cart + Form Tab Logic */
(function() {
  'use strict';

  // ==============================
  // CART STATE
  // ==============================
  var cart = [];
  // Each item: { id, name, size, price, qty }
  // size: 'half', 'full', or 'single'

  function findCartIndex(id, size) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].size === size) return i;
    }
    return -1;
  }

  function addItem(id, name, size, priceCents, qty) {
    var idx = findCartIndex(id, size);
    if (idx >= 0) {
      cart[idx].qty += qty;
    } else {
      cart.push({ id: id, name: name, size: size, price: priceCents, qty: qty });
    }
    onCartChange();
  }

  function removeItem(id, size) {
    var idx = findCartIndex(id, size);
    if (idx >= 0) {
      cart.splice(idx, 1);
      onCartChange();
    }
  }

  function updateQty(id, size, newQty) {
    if (newQty < 1) {
      removeItem(id, size);
      return;
    }
    var idx = findCartIndex(id, size);
    if (idx >= 0) {
      cart[idx].qty = newQty;
      onCartChange();
    }
  }

  function getTotal() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      total += cart[i].price * cart[i].qty;
    }
    return total;
  }

  function getItemCount() {
    var count = 0;
    for (var i = 0; i < cart.length; i++) {
      count += cart[i].qty;
    }
    return count;
  }

  function formatCurrency(cents) {
    var dollars = cents / 100;
    if (dollars % 1 === 0) return '$' + dollars.toLocaleString();
    return '$' + dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function sizeLabel(size) {
    if (size === 'half') return 'Half Pan';
    if (size === 'full') return 'Full Pan';
    return '';
  }

  function serializeForForm() {
    if (cart.length === 0) return '';
    var lines = [];
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var sizeText = sizeLabel(item.size);
      var lineTotal = formatCurrency(item.price * item.qty);
      if (sizeText) {
        lines.push(item.qty + 'x ' + item.name + ' (' + sizeText + ') - ' + lineTotal);
      } else {
        lines.push(item.qty + 'x ' + item.name + ' - ' + lineTotal);
      }
    }
    lines.push('---');
    lines.push('Estimated Total: ' + formatCurrency(getTotal()));
    return lines.join('\n');
  }

  // ==============================
  // SESSION STORAGE
  // ==============================
  function saveToSession() {
    try {
      sessionStorage.setItem('cravin-cart', JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }

  function loadFromSession() {
    try {
      var saved = sessionStorage.getItem('cravin-cart');
      if (saved) {
        cart = JSON.parse(saved);
        if (!Array.isArray(cart)) cart = [];
      }
    } catch (e) { cart = []; }
  }

  // ==============================
  // DOM REFERENCES
  // ==============================
  var cartSummary = document.getElementById('cart-summary');
  var cartEmpty = document.getElementById('cart-empty');
  var cartItemsList = document.getElementById('cart-items-list');
  var cartTotalRow = document.getElementById('cart-total-row');
  var cartTotalValue = document.getElementById('cart-total-value');
  var floatingPill = document.getElementById('floating-cart-pill');
  var pillCount = document.getElementById('pill-count');
  var pillTotal = document.getElementById('pill-total');
  var submitBtn = document.getElementById('bo-submit-btn');
  var buildOrderForm = document.getElementById('build-order-form');
  var menuItems = document.querySelectorAll('.catering-menu-item');

  // ==============================
  // INJECT ADD BUTTONS INTO MENU ITEMS
  // ==============================
  menuItems.forEach(function(item) {
    var itemId = item.getAttribute('data-item-id');
    if (!itemId) return; // skip items without data

    var priceHalf = item.getAttribute('data-price-half');
    var priceFull = item.getAttribute('data-price-full');
    var priceSingle = item.getAttribute('data-price-single');
    var isSinglePrice = !!priceSingle;
    var hasHalf = priceHalf && priceHalf !== '';
    var hasFull = priceFull && priceFull !== '';

    // Create Add button
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-to-cart';
    addBtn.textContent = '+ Add';
    addBtn.setAttribute('aria-label', 'Add ' + item.getAttribute('data-item-name') + ' to order');

    // Create inline controls
    var controls = document.createElement('div');
    controls.className = 'cart-add-controls';

    var controlsHTML = '';

    if (isSinglePrice) {
      // No size selector for extras
      controlsHTML += '<div class="cart-qty-controls">' +
        '<button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">&minus;</button>' +
        '<span class="qty-value">1</span>' +
        '<button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>' +
        '</div>';
    } else {
      // Size selector
      controlsHTML += '<div class="cart-size-select">';
      if (hasHalf) {
        controlsHTML += '<button type="button" class="size-btn active" data-size="half">Half Pan</button>';
      }
      if (hasFull) {
        controlsHTML += '<button type="button" class="size-btn' + (!hasHalf ? ' active' : '') + '" data-size="full">Full Pan</button>';
      }
      controlsHTML += '</div>';
      controlsHTML += '<div class="cart-qty-controls">' +
        '<button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">&minus;</button>' +
        '<span class="qty-value">1</span>' +
        '<button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>' +
        '</div>';
    }

    controlsHTML += '<button type="button" class="cart-confirm-add">Add to Order</button>';
    controlsHTML += '<button type="button" class="cart-cancel-add">Cancel</button>';
    controls.innerHTML = controlsHTML;

    item.appendChild(addBtn);
    item.appendChild(controls);

    // Event: Click Add button to show controls
    addBtn.addEventListener('click', function() {
      // Close any other open controls first
      document.querySelectorAll('.catering-menu-item.adding').forEach(function(other) {
        if (other !== item) {
          other.classList.remove('adding');
          var otherQty = other.querySelector('.qty-value');
          if (otherQty) otherQty.textContent = '1';
        }
      });
      item.classList.add('adding');
    });

    // Event: Cancel
    var cancelBtn = controls.querySelector('.cart-cancel-add');
    cancelBtn.addEventListener('click', function() {
      item.classList.remove('adding');
      controls.querySelector('.qty-value').textContent = '1';
      // Reset size selection to first available
      var sizeBtns = controls.querySelectorAll('.size-btn');
      sizeBtns.forEach(function(s, i) { s.classList.toggle('active', i === 0); });
    });

    // Event: Size buttons
    var sizeBtns = controls.querySelectorAll('.size-btn');
    sizeBtns.forEach(function(sBtn) {
      sBtn.addEventListener('click', function() {
        sizeBtns.forEach(function(s) { s.classList.remove('active'); });
        sBtn.classList.add('active');
      });
    });

    // Event: Quantity buttons
    var qtyBtns = controls.querySelectorAll('.qty-btn');
    var qtyDisplay = controls.querySelector('.qty-value');
    qtyBtns.forEach(function(qBtn) {
      qBtn.addEventListener('click', function() {
        var current = parseInt(qtyDisplay.textContent, 10);
        if (qBtn.getAttribute('data-action') === 'increase') {
          qtyDisplay.textContent = Math.min(current + 1, 99);
        } else {
          qtyDisplay.textContent = Math.max(current - 1, 1);
        }
      });
    });

    // Event: Confirm Add
    var confirmBtn = controls.querySelector('.cart-confirm-add');
    confirmBtn.addEventListener('click', function() {
      var itemName = item.getAttribute('data-item-name');
      var qty = parseInt(qtyDisplay.textContent, 10);
      var selectedSize, selectedPrice;

      if (isSinglePrice) {
        selectedSize = 'single';
        selectedPrice = parseInt(priceSingle, 10);
      } else {
        var activeSize = controls.querySelector('.size-btn.active');
        selectedSize = activeSize.getAttribute('data-size');
        selectedPrice = parseInt(selectedSize === 'half' ? priceHalf : priceFull, 10);
      }

      addItem(itemId, itemName, selectedSize, selectedPrice, qty);

      // Reset and close controls
      item.classList.remove('adding');
      item.classList.add('in-cart');
      qtyDisplay.textContent = '1';
      sizeBtns.forEach(function(s, i) { s.classList.toggle('active', i === 0); });

      // Update add button to show "Added"
      addBtn.textContent = '✓ Added';
      addBtn.classList.add('added');
      setTimeout(function() {
        addBtn.textContent = '+ Add';
        addBtn.classList.remove('added');
      }, 2000);
    });
  });

  // ==============================
  // RENDER CART SUMMARY
  // ==============================
  function renderCartSummary() {
    if (cart.length === 0) {
      cartEmpty.style.display = '';
      cartItemsList.style.display = 'none';
      cartTotalRow.style.display = 'none';
      return;
    }

    cartEmpty.style.display = 'none';
    cartItemsList.style.display = '';
    cartTotalRow.style.display = '';

    var html = '';
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var lineTotal = formatCurrency(item.price * item.qty);
      var sizeText = sizeLabel(item.size);

      html += '<div class="cart-item-row" data-cart-id="' + item.id + '" data-cart-size="' + item.size + '">';
      html += '<div class="cart-item-info">';
      html += '<div class="cart-item-name">' + item.name + '</div>';
      if (sizeText) {
        html += '<div class="cart-item-size">' + sizeText + '</div>';
      }
      html += '</div>';
      html += '<div class="cart-item-qty">';
      html += '<button type="button" class="qty-btn cart-qty-dec" aria-label="Decrease quantity">&minus;</button>';
      html += '<span class="qty-value">' + item.qty + '</span>';
      html += '<button type="button" class="qty-btn cart-qty-inc" aria-label="Increase quantity">+</button>';
      html += '</div>';
      html += '<div class="cart-item-price">' + lineTotal + '</div>';
      html += '<button type="button" class="cart-item-remove" aria-label="Remove ' + item.name + '">&times;</button>';
      html += '</div>';
    }
    cartItemsList.innerHTML = html;
    cartTotalValue.textContent = formatCurrency(getTotal());

    // Bind cart item events (event delegation)
    cartItemsList.querySelectorAll('.cart-item-row').forEach(function(row) {
      var id = row.getAttribute('data-cart-id');
      var size = row.getAttribute('data-cart-size');

      row.querySelector('.cart-qty-dec').addEventListener('click', function() {
        var idx = findCartIndex(id, size);
        if (idx >= 0) updateQty(id, size, cart[idx].qty - 1);
      });

      row.querySelector('.cart-qty-inc').addEventListener('click', function() {
        var idx = findCartIndex(id, size);
        if (idx >= 0) updateQty(id, size, cart[idx].qty + 1);
      });

      row.querySelector('.cart-item-remove').addEventListener('click', function() {
        removeItem(id, size);
      });
    });
  }

  // ==============================
  // UPDATE FLOATING PILL
  // ==============================
  function updateFloatingPill() {
    var count = getItemCount();
    if (count > 0) {
      pillCount.textContent = count;
      pillTotal.textContent = formatCurrency(getTotal());
      floatingPill.classList.add('visible');
    } else {
      floatingPill.classList.remove('visible');
    }
  }

  // Floating pill click: scroll to form
  if (floatingPill) {
    floatingPill.addEventListener('click', function() {
      var formSection = document.getElementById('catering-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==============================
  // UPDATE HIDDEN FORM FIELDS
  // ==============================
  function updateHiddenFields() {
    if (!buildOrderForm) return;
    var cartTextarea = buildOrderForm.querySelector('textarea[name="cart_items"]');
    var cartTotalInput = buildOrderForm.querySelector('input[name="cart_total"]');
    if (cartTextarea) cartTextarea.value = serializeForForm();
    if (cartTotalInput) cartTotalInput.value = cart.length > 0 ? formatCurrency(getTotal()) : '';
  }

  // ==============================
  // UPDATE MENU ITEM STATES
  // ==============================
  function updateMenuItemStates() {
    menuItems.forEach(function(item) {
      var itemId = item.getAttribute('data-item-id');
      if (!itemId) return;
      var inCart = false;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === itemId) { inCart = true; break; }
      }
      item.classList.toggle('in-cart', inCart);
    });
  }

  // ==============================
  // SUBMIT BUTTON STATE
  // ==============================
  function updateSubmitState() {
    if (!submitBtn || !buildOrderForm) return;
    var name = buildOrderForm.querySelector('#bo-name');
    var email = buildOrderForm.querySelector('#bo-email');
    var phone = buildOrderForm.querySelector('#bo-phone');
    var hasItems = cart.length > 0;
    var hasName = name && name.value.trim() !== '';
    var hasEmail = email && email.value.trim() !== '';
    var hasPhone = phone && phone.value.trim() !== '';
    submitBtn.disabled = !(hasItems && hasName && hasEmail && hasPhone);
  }

  // Listen on contact fields
  if (buildOrderForm) {
    ['#bo-name', '#bo-email', '#bo-phone'].forEach(function(sel) {
      var input = buildOrderForm.querySelector(sel);
      if (input) {
        input.addEventListener('input', updateSubmitState);
      }
    });

    // Form submit: populate hidden fields
    buildOrderForm.addEventListener('submit', function(e) {
      updateHiddenFields();
      if (cart.length === 0) {
        e.preventDefault();
        return;
      }
    });
  }

  // ==============================
  // ON CART CHANGE — master update
  // ==============================
  function onCartChange() {
    renderCartSummary();
    updateFloatingPill();
    updateHiddenFields();
    updateMenuItemStates();
    updateSubmitState();
    saveToSession();
  }

  // ==============================
  // FORM TAB SWITCHING
  // ==============================
  var formTabs = document.querySelectorAll('.form-tab');
  var panelBuild = document.getElementById('panel-build-order');
  var panelQuick = document.getElementById('panel-quick-inquiry');

  formTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      formTabs.forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var target = tab.getAttribute('data-form-tab');
      if (panelBuild) panelBuild.style.display = target === 'build-order' ? '' : 'none';
      if (panelQuick) panelQuick.style.display = target === 'quick-inquiry' ? '' : 'none';
    });
  });

  // ==============================
  // INIT
  // ==============================
  loadFromSession();
  onCartChange();

})();
