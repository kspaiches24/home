const products = [
  { id: 1, name: "Wildflower Birthday", category: "cards", type: "Handmade card", price: 8, note: "Blank inside · A6 envelope", color: "rose", badge: "Bestseller", art: "card-art", rotation: "-4deg" },
  { id: 2, name: "Home Sweet Home", category: "stitch", type: "Cross stitch", price: 38, note: "5-inch hoop · Ready to hang", color: "sage", badge: "New", art: "stitch-art", rotation: "2deg" },
  { id: 3, name: "Golden Thank You", category: "cards", type: "Handmade card", price: 9, note: "Hand-painted details · A6 envelope", color: "gold", art: "card-art", rotation: "3deg" },
  { id: 4, name: "Tiny Blue Blooms", category: "stitch", type: "Cross stitch", price: 34, note: "4-inch hoop · Cotton floss", color: "blue", art: "stitch-art", rotation: "-3deg" },
  { id: 5, name: "A Little Note", category: "cards", type: "Handmade card", price: 7, note: "Blank inside · A6 envelope", color: "cream", art: "card-art", rotation: "-2deg" },
  { id: 6, name: "Garden Sampler", category: "stitch", type: "Cross stitch", price: 46, note: "6-inch hoop · Ready to hang", color: "clay", badge: "One of a kind", art: "stitch-art", rotation: "4deg" }
];

let cart = JSON.parse(localStorage.getItem("threadPaperCart") || "[]");
const grid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector(".cart-drawer");
const overlay = document.querySelector(".overlay");
const cartItems = document.querySelector(".cart-items");
const emptyCart = document.querySelector(".empty-cart");
const cartFooter = document.querySelector(".cart-footer");

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function renderProducts(filter = "all") {
  const visible = filter === "all" ? products : products.filter(product => product.category === filter);
  grid.innerHTML = visible.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 60}ms">
      <div class="product-image ${product.art}" data-color="${product.color}" style="--rotation:${product.rotation}" tabindex="0" aria-label="${product.name}">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <button class="quick-add" type="button" data-id="${product.id}">Add to basket · ${formatPrice(product.price)}</button>
      </div>
      <div class="product-info">
        <span class="product-type">${product.type}</span>
        <h3>${product.name}</h3>
        <span class="price">${formatPrice(product.price)}</span>
        <p>${product.note}</p>
      </div>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("threadPaperCart", JSON.stringify(cart));
}

function addToCart(id) {
  const line = cart.find(item => item.id === id);
  if (line) line.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  showToast();
}

function changeQuantity(id, amount) {
  const line = cart.find(item => item.id === id);
  if (!line) return;
  line.quantity += amount;
  if (line.quantity <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find(productItem => productItem.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".cart-total").textContent = formatPrice(total);
  emptyCart.classList.toggle("visible", cart.length === 0);
  cartFooter.style.display = cart.length ? "block" : "none";
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(productItem => productItem.id === item.id);
    return `
      <div class="cart-item">
        <div class="cart-thumb" style="background:var(--${product.color === "blue" ? "sage" : product.color})">✦</div>
        <div>
          <h4>${product.name}</h4>
          <div class="quantity">
            <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-item" type="button" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
        <span class="cart-price">${formatPrice(product.price * item.quantity)}</span>
      </div>
    `;
  }).join("");
}

function openCart() {
  overlay.hidden = false;
  requestAnimationFrame(() => cartDrawer.classList.add("open"));
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  document.querySelector(".close-cart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  setTimeout(() => { overlay.hidden = true; }, 350);
}

function showToast() {
  const toast = document.querySelector(".toast");
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelector(".filters").addEventListener("click", event => {
  const button = event.target.closest(".filter");
  if (!button) return;
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.filter);
});

grid.addEventListener("click", event => {
  const button = event.target.closest(".quick-add");
  if (button) addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", event => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const id = Number(control.dataset.id);
  if (control.dataset.action === "increase") changeQuantity(id, 1);
  if (control.dataset.action === "decrease") changeQuantity(id, -1);
  if (control.dataset.action === "remove") {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }
});

document.querySelector(".cart-button").addEventListener("click", openCart);
document.querySelector(".close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

document.querySelector(".menu-button").addEventListener("click", event => {
  const nav = document.querySelector(".main-nav");
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => {
  document.querySelector(".main-nav").classList.remove("open");
  document.querySelector(".menu-button").setAttribute("aria-expanded", "false");
}));

document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  const message = document.querySelector("#newsletter-message");
  message.textContent = "You’re on the list. Welcome to the worktable!";
  event.currentTarget.reset();
});

document.querySelector("#custom-order-request").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#custom-form-message");
  const submitButton = form.querySelector(".form-submit");
  const data = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.firstChild.textContent = "Sending... ";
  message.classList.remove("success");
  message.textContent = "";

  try {
    const response = await fetch("/api/custom-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Your request could not be sent.");
    }

    form.reset();
    message.classList.add("success");
    message.textContent = "Thank you! Your request was sent. We’ll be in touch within 2 business days.";
  } catch (error) {
    message.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.firstChild.textContent = "Send my request ";
    message.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  document.querySelector(".toast").textContent = "Demo checkout — your basket is saved";
  closeCart();
  showToast();
});

renderProducts();
renderCart();
