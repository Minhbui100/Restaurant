import * as utilities2 from "./utilities2.js";

const menuItems = await utilities2.getMenuItems();
// Cart data structure
let cart = [];
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const cartModal = document.getElementById("cart-modal");
const exitCheckoutBtn = document.getElementById("exit-checkout-btn");
const total = document.getElementById("total");
const checkoutForm = document.getElementById("checkout-form");
const paymentMethodSelect = document.getElementById("payment-method");
const creditCardField = document.getElementById("credit-card-field");
// Render the menu
function renderMenu() {
  const menuTableBody = document.querySelector("#menu-table tbody");
  menuTableBody.innerHTML = "";

  menuItems.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image}" alt="${item.name}" width="50"></td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.status}</td>
      <td><button class="add-to-cart-btn" data-index="${index}" ${
      item.status === "Out of Stock" ? "disabled" : ""
    }>Add Order</button></td>
    `;
    menuTableBody.appendChild(row);
  });
}

function calculateTotalQuantities() {
  let totalQuantities = 0;
  for (const item of cart) {
    totalQuantities += item.quantity;
  }
  return totalQuantities;
}

// async function addOrders() {
//   // const id = document.getElementById("billNumber").value;
//   // const name = document.getElementById("orderName").value;
//   // const price = document.getElementById("orderPrice").value;
//   // const quantity = document.getElementById("orderQuantity").value;

//   try {
//     const response = await fetch("http://localhost:3000/orders", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         id,
//         name,
//         price,
//         quantity,
//       }),
//     });

//     if (response.status === 400) {
//       // Read and display the warning message from the response
//       const warningMessage = await response.text();
//       displayWarning(warningMessage);
//     } else if (response.ok) {
//       // Clear input fields after successful submission

//       await fetchOrders();
//       await fetchBill();
//     } else {
//       console.error("An error occurred:", response.statusText);
//     }
//     document.getElementById("billNumber").value = "";
//     document.getElementById("orderName").value = "";
//     document.getElementById("orderPrice").value = "";
//     document.getElementById("orderQuantity").value = "";
//   } catch (error) {
//     console.error("Fetch error:", error);
//   }
// }

function totalAmount() {
  let totalAmount = 0;
  cart.forEach((cartItem, index) => {
    totalAmount += cartItem.price * cartItem.quantity;
  });
  return totalAmount;
}

// Render the cart
function renderCart() {
  const cartTableBody = document.querySelector("#cart-table tbody");
  cartTableBody.innerHTML = "";
  let totalAmount = 0;
  cart.forEach((cartItem, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cartItem.name}</td>
      <td><input type="number" value="${
        cartItem.quantity
      }" min="1" class="update-quantity" data-index="${index}"></td>
      <td>$${cartItem.price.toFixed(2)}</td>
      <td>$${(cartItem.price * cartItem.quantity).toFixed(2)}</td>
      <td><button class="remove-item-btn" data-index="${index}">Remove</button></td>
    `;
    totalAmount += cartItem.price * cartItem.quantity;
    total.textContent = `Total: ${totalAmount.toFixed(2)}`;
    cartTableBody.appendChild(row);
  });

  document.getElementById(
    "view-cart-btn"
  ).innerText = `View Cart (${calculateTotalQuantities()})`;
}

// Add to cart
document.querySelector("#menu-table").addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const index = e.target.dataset.index;
    const item = menuItems[index];
    const cartItemIndex = cart.findIndex(
      (cartItem) => cartItem.name === item.name
    );
    if (cartItemIndex === -1) {
      cart.push({ ...item, quantity: 1 });
    } else {
      cart[cartItemIndex].quantity++;
    }
    console.log(cart);
    renderCart();
  }
});

// Update quantity
document.querySelector("#cart-table").addEventListener("input", (e) => {
  if (e.target.classList.contains("update-quantity")) {
    const index = e.target.dataset.index;
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1) {
      cart[index].quantity = newQuantity;
      renderCart();
    }
  }
});

// Remove from cart
document.querySelector("#cart-table").addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item-btn")) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    renderCart();
  }
});

// View cart
document.getElementById("view-cart-btn").addEventListener("click", () => {
  document.getElementById("cart-modal").classList.remove("hidden");
  renderCart();
});

// Exit cart
document.getElementById("exit-cart-btn").addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

checkoutBtn.addEventListener("click", () => {
  checkoutModal.classList.remove("hidden");
  cartModal.classList.add("hidden");
});

exitCheckoutBtn.addEventListener("click", () => {
  checkoutModal.classList.add("hidden");
  cartModal.classList.remove("hidden");
});

// Add an event listener for form submission
checkoutForm.addEventListener("submit", async (event) => {
  // Prevent the form from reloading the page
  event.preventDefault();

  // Get values from the form fields
  const customerName = document.getElementById("customer-name").value;
  const customerPhone = document.getElementById("phone-number").value;
  const paymentMethod = document.getElementById("payment-method").value;
  let cardId = document.getElementById("credit-card-number").value;
  const expireDate = document.getElementById("expiration-date").value;
  const tip = parseFloat(document.getElementById("tip").value); // Convert to number
  const locationName = document.getElementById("restaurant-location").value;

  const billId = await utilities2.addOrders(cart);
  console.log(billId);
  // Create an object to store all data (optional)
  const orderDetails = {
    billId,
    customerName,
    customerPhone,
    paymentMethod,
    cardId,
    expireDate,
    tip,
    locationName,
  };
  let totalAfterTip = totalAmount() + tip;
  await utilities2.addCustomer(customerName, customerPhone);
  if (paymentMethod == "Cash") {
    await utilities2.addCard(cardId, customerName, expireDate, totalAfterTip);
  }

  await utilities2.payment(orderDetails);
  // Show a confirmation message or handle the data as needed
});

// Listen for changes to the payment method
paymentMethodSelect.addEventListener("change", function () {
  if (paymentMethodSelect.value === "card") {
    creditCardField.classList.remove("hidden"); // Show credit card input
  } else {
    creditCardField.classList.add("hidden"); // Hide credit card input
  }
});

// Initialize the menu
renderMenu();
