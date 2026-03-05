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
  // TOAST NOTIFICATION
  // ==============================
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2800);
  }

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
          var otherQty = other.querySelector('.cart-add-controls .qty-value');
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

      // Show toast notification
      var sizeText = sizeLabel(selectedSize);
      var toastMsg = itemName + (sizeText ? ' (' + sizeText + ')' : '') + ' added to order';
      showToast(toastMsg);
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
  var pillHiddenByObserver = false;

  function updateFloatingPill() {
    var count = getItemCount();
    if (count > 0 && !pillHiddenByObserver) {
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
  // INTERSECTION OBSERVER — hide pill when form visible
  // ==============================
  var formSection = document.getElementById('catering-form');
  if (formSection && floatingPill && 'IntersectionObserver' in window) {
    var pillObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          pillHiddenByObserver = true;
          floatingPill.classList.remove('visible');
        } else {
          pillHiddenByObserver = false;
          // Re-show pill if cart has items
          if (getItemCount() > 0) {
            pillCount.textContent = getItemCount();
            pillTotal.textContent = formatCurrency(getTotal());
            floatingPill.classList.add('visible');
          }
        }
      });
    }, { threshold: 0.1 });
    pillObserver.observe(formSection);
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
  // QUANTITY BADGES ON MENU ITEMS
  // ==============================
  function updateMenuItemBadges() {
    // Build a map: itemId -> { totalQty, entries: [{ size, qty }] }
    var itemMap = {};
    for (var i = 0; i < cart.length; i++) {
      var ci = cart[i];
      if (!itemMap[ci.id]) {
        itemMap[ci.id] = { totalQty: 0, entries: [] };
      }
      itemMap[ci.id].totalQty += ci.qty;
      itemMap[ci.id].entries.push({ size: ci.size, qty: ci.qty });
    }

    menuItems.forEach(function(menuItem) {
      var itemId = menuItem.getAttribute('data-item-id');
      if (!itemId) return;

      // Remove existing badge and inline controls
      var existingBadge = menuItem.querySelector('.cart-item-badge');
      if (existingBadge) existingBadge.parentNode.removeChild(existingBadge);
      var existingControls = menuItem.querySelector('.cart-inline-controls');
      if (existingControls) existingControls.parentNode.removeChild(existingControls);

      var data = itemMap[itemId];
      if (!data) return; // not in cart

      // Create badge
      var badge = document.createElement('div');
      badge.className = 'cart-item-badge';
      badge.textContent = data.totalQty;
      menuItem.appendChild(badge);

      // Create inline controls (compact +/- below item name)
      var inlineCtrl = document.createElement('div');
      inlineCtrl.className = 'cart-inline-controls';

      // Build size summary text
      var sizeParts = [];
      for (var j = 0; j < data.entries.length; j++) {
        var e = data.entries[j];
        var sl = sizeLabel(e.size);
        if (sl) {
          sizeParts.push(e.qty + 'x ' + sl);
        } else {
          sizeParts.push(e.qty + 'x');
        }
      }

      inlineCtrl.innerHTML =
        '<button type="button" class="qty-btn inline-dec" aria-label="Remove one">&minus;</button>' +
        '<span class="qty-value">' + data.totalQty + '</span>' +
        '<button type="button" class="qty-btn inline-inc" aria-label="Add one">+</button>' +
        '<span class="size-summary">' + sizeParts.join(', ') + '</span>';

      // Find the item-name element to insert after
      var nameEl = menuItem.querySelector('.item-name');
      if (nameEl && nameEl.parentNode === menuItem) {
        // Insert after the item-name div
        if (nameEl.nextSibling) {
          menuItem.insertBefore(inlineCtrl, nameEl.nextSibling);
        } else {
          menuItem.appendChild(inlineCtrl);
        }
      } else if (nameEl) {
        // Name is inside a wrapper div (e.g., whiting fish with notes)
        var wrapper = nameEl.parentNode;
        wrapper.appendChild(inlineCtrl);
      } else {
        menuItem.appendChild(inlineCtrl);
      }

      // Bind inline +/- events
      // Use the last entry's size for quick +/- (most recently added size)
      var lastEntry = data.entries[data.entries.length - 1];

      inlineCtrl.querySelector('.inline-dec').addEventListener('click', function() {
        // Find last entry that still exists
        var le = null;
        for (var k = cart.length - 1; k >= 0; k--) {
          if (cart[k].id === itemId) { le = cart[k]; break; }
        }
        if (le) {
          updateQty(le.id, le.size, le.qty - 1);
        }
      });

      inlineCtrl.querySelector('.inline-inc').addEventListener('click', function() {
        // Increment last entry
        var le = null;
        for (var k = cart.length - 1; k >= 0; k--) {
          if (cart[k].id === itemId) { le = cart[k]; break; }
        }
        if (le) {
          updateQty(le.id, le.size, le.qty + 1);
        }
      });
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
    updateMenuItemBadges();
    updateSubmitState();
    saveToSession();
  }

  // ==============================
  // FORM TAB SWITCHING
  // ==============================
  var formTabs = document.querySelectorAll('.form-tab');
  var panelBuild = document.getElementById('panel-build-order');
  var panelQuick = document.getElementById('panel-quick-inquiry');

  function switchToTab(tabName) {
    formTabs.forEach(function(t) {
      var isTarget = t.getAttribute('data-form-tab') === tabName;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    if (panelBuild) panelBuild.style.display = tabName === 'build-order' ? '' : 'none';
    if (panelQuick) panelQuick.style.display = tabName === 'quick-inquiry' ? '' : 'none';
  }

  formTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      switchToTab(tab.getAttribute('data-form-tab'));
    });
  });

  // ==============================
  // HERO QUICK INQUIRY LINK
  // ==============================
  var heroQuickLink = document.getElementById('hero-quick-inquiry-link');
  if (heroQuickLink) {
    heroQuickLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchToTab('quick-inquiry');
      var formEl = document.getElementById('catering-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==============================
  // INIT
  // ==============================
  loadFromSession();
  onCartChange();

})();
