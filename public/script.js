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
const simulationBtn = document.getElementById("simulationBtn");
// Render the menu

function refreshPageAfterCheckout() {
    // Reset form fields to empty
    document.getElementById("customer-name").value = "";
    document.getElementById("phone-number").value = "";
    document.getElementById("payment-method").value = "card"; // Reset to default (if applicable)
    document.getElementById("credit-card-number").value = "";
    document.getElementById("credit-card-field").classList.remove("hidden");
    document.getElementById("expiration-date").value = "";
    document.getElementById("tip").value = "";
    document.getElementById("restaurant-location").value = "";
    cart = [];
    renderCart();
    document.getElementById("total").textContent = "Total: 0";
    cartModal.classList.add("hidden");
    checkoutModal.classList.add("hidden");
}

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

function totalAmount(cart) {
    let totalAmount = 0;
    cart.forEach((cartItem, index) => {
        totalAmount += cartItem.price * cartItem.quantity;
    });
    console.log(totalAmount);
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
            cart.push({...item, quantity: 1 });
        } else {
            cart[cartItemIndex].quantity++;
        }
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
        total.textContent = `Total: ${totalAmount(cart)}`;
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
    if (totalAmount(cart) === 0) {
        alert("Please add at least 1 item to cart!");
        return;
    }
    checkoutModal.classList.remove("hidden");
    cartModal.classList.add("hidden");
});

exitCheckoutBtn.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
    cartModal.classList.remove("hidden");
});

const checkout = async(orderDetails, cartItems, simulation) => {
    const orderId = await utilities2.addOrders(cartItems);
    let {
        customerName,
        customerPhone,
        paymentMethod,
        cardId,
        expireDate,
        tip,
        locationName,
    } = orderDetails;

    // Create an object to store all data (optional)
    orderDetails = {...orderDetails, orderId };
    let totalAfterTip = (totalAmount(cartItems) + parseFloat(tip)).toFixed(2);
    await utilities2.addCustomer(customerName, customerPhone);

    await utilities2.addCard(cardId, customerName, expireDate, totalAfterTip);

    await utilities2.payment(orderDetails, simulation);
    refreshPageAfterCheckout();
};

// Add an event listener for form submission
checkoutForm.addEventListener("submit", async(event) => {
    // Prevent the form from reloading the page
    event.preventDefault();

    // Get values from the form fields
    const customerName = document.getElementById("customer-name").value;
    const customerPhone = document.getElementById("phone-number").value;
    const paymentMethod = document.getElementById("payment-method").value;
    let cardId = document.getElementById("credit-card-number").value;
    let expireDate = document.getElementById("expiration-date").value;
    const tip = parseFloat(document.getElementById("tip").value); // Convert to number
    const locationName = document.getElementById("restaurant-location").value;
    // Validation for required fields
    if (!customerName) {
        alert("Please enter your name.");
        return;
    }

    if (!customerPhone) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    if (paymentMethod === "card") {
        if (!cardId) {
            alert("Please enter a validcredit card number.");
            return;
        }

        if (!expireDate) {
            alert("Please enter a valid expiration date in MM/YY format.");
            return;
        }
    }

    if (isNaN(tip) || tip < 0) {
        alert("Please enter a valid tip amount (0 or more).");
        return;
    }

    if (!locationName) {
        alert("Please select a restaurant location.");
        return;
    }
    if (paymentMethod == "cash") {
        cardId = `cash-${customerPhone}`;
        expireDate = "N/A";
    }
    const orderDetails = {
        customerName,
        customerPhone,
        paymentMethod,
        cardId,
        expireDate,
        tip,
        locationName,
    };
    await checkout(orderDetails, cart, false);
    // Show a confirmation message or handle the data as needed
});

// Listen for changes to the payment method
paymentMethodSelect.addEventListener("change", function() {
    if (paymentMethodSelect.value === "card") {
        creditCardField.classList.remove("hidden"); // Show credit card input
    } else {
        creditCardField.classList.add("hidden"); // Hide credit card input
    }
});
// Generate a random customer phone number
const generateRandomPhoneNumber = () => {
    return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

const generateRandomName = () => {
    const firstNames = [
        "John",
        "Jane",
        "Michael",
        "Emily",
        "David",
        "Sarah",
        "James",
        "Anna",
        "Robert",
        "Sophia",
        "Christopher",
        "Jessica",
        "Matthew",
        "Ashley",
        "Daniel",
        "Olivia",
        "Andrew",
        "Mia",
        "Joseph",
        "Isabella",
        "Ryan",
        "Charlotte",
        "William",
        "Amelia",
        "Alexander",
        "Emma",
        "Benjamin",
        "Grace",
        "Nicholas",
        "Lily",
    ];

    const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Gonzalez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
        "Lee",
        "Perez",
        "Clark",
        "Lewis",
        "Walker",
        "Hall",
        "Allen",
        "Young",
        "King",
        "Wright",
        "Scott",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;

    return name;
};

// Generate a random location from the available 3 locations
const generateRandomLocation = () => {
    const locations = [
        "Big Bend Fast Food",
        "Yosemite Fast Food",
        "Guadalupe Mountains Fast Food",
        "Carlsbad Caverns Fast Food",
        "Arches Fast Food",
        "Zion Fast Food",
        "Rocky Mountain Fast Food",
        "Redwood Fast Food",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
};

// Generate a random credit card number (Visa card starting with 4, 16 digits)
const generateRandomCreditCardNumber = () => {
    const cardNumber =
        "4" + Math.floor(100000000000000 + Math.random() * 900000000000000); // 16 digits starting with '4'
    return cardNumber;
};

// Generate a random expiration date (between 1 to 3 years from now)
const generateRandomExpirationDate = () => {
    const currentYear = new Date().getFullYear();
    const expirationYear = currentYear + Math.floor(Math.random() * 3) + 1; // 1 to 3 years from now
    const expirationMonth = Math.floor(Math.random() * 12) + 1; // Month from 1 to 12
    return `${expirationMonth.toString().padStart(2, "0")}/${expirationYear
    .toString()
    .slice(2)}`;
};

// Generate a random tip between 1 and 10
const generateRandomTip = () => {
    return (Math.floor(Math.random() * 10) + 1).toFixed(2); // Random tip between 1 and 10
};

const generateRandomCart = (menu) => {
    const cartRandom = [];
    const availableItems = menu.filter((item) => item.status === "Available");
    // Determine the number of items in the cart (1 to 3 items randomly)
    const numItems = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numItems; i++) {
        // Select a random item from the available items
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const item = availableItems[randomIndex];

        // Assign a random quantity (1 to 5) to the selected item
        const quantity = Math.floor(Math.random() * 5) + 1;

        // Add the item with quantity to the cart
        cartRandom.push({...item, quantity });

        // Optionally remove the selected item from available items to avoid duplicates
        availableItems.splice(randomIndex, 1);
    }

    return cartRandom;
};

const simulateCustomerOrders = async() => {
    const customers = [];
    const orders = [];
    for (let i = 0; i < 100; i++) {
        const customerName = generateRandomName();
        const customerPhone = generateRandomPhoneNumber();
        const locationName = generateRandomLocation();
        const paymentMethod = "card";
        const cardId = generateRandomCreditCardNumber();
        const expireDate = generateRandomExpirationDate();
        const tip = generateRandomTip();
        // customers.push({ name: customerName, phone: customerPhone });
        const cartRandom = generateRandomCart(menuItems);
        const orderDetails = {
            customerName,
            customerPhone,
            paymentMethod,
            cardId,
            expireDate,
            tip,
            locationName,
        };
        await checkout(orderDetails, cartRandom, true);
    }
};
simulationBtn.addEventListener("click", async() => {
    try {
        await simulateCustomerOrders();
        alert("100 customers ordered- simulation completed");
    } catch (e) {
        alert("Error during simulation", e);
    }
    // await simulateCustomerOrders().catch((e) => {
    //   alert("Error during simulation", e);
    // });
});
// Initialize the menu
renderMenu();
