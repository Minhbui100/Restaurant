// CRUD operations for Students
async function fetchBill() {
    const response = await fetch("http://localhost:3000/bill");
    const bill = await response.json();
    const table = document.getElementById("billtable");
    table.innerHTML = "";
    bill.forEach((bills) => {
        const row = `<tr>
            <td>${bills.bill_id}</td>
            <td>${bills.cust_phone !== null ? bills.cust_phone : ""}</td>
            <td>${bills.location_name !== null ? bills.location_name : ""}</td>
            <td>${bills.total}</td>
            <td>${bills.tip !== null ? bills.tip : ""}</td>
            <td>${bills.tax}</td>
            <td>${bills.card_id !== null ? bills.card_id : ""}</td>
            <td>${bills.paid === true ? "paid" : ""}</td>
            </tr>`;
        table.innerHTML += row;
    });
}

// Fetch and display enrollments with student ID and enrollment date
async function fetchOrders() {
    const response = await fetch("http://localhost:3000/orders");
    const orders = await response.json();
    const table = document.getElementById("ordersTable");
    table.innerHTML = "";
    orders.forEach((order) => {
        const row = `<tr>
                        <td>${order.id}</td>
                        <td>${order.bill_id}</td>
                        <td>${order.name}</td>
                        <td>${order.price}</td>
                        <td>${order.quantity}</td>
                     </tr>`;
        table.innerHTML += row;
    });
}

async function fetchCards() {
    const response = await fetch("http://localhost:3000/cards");
    const cards = await response.json();
    const table = document.getElementById("cardsTable");
    table.innerHTML = "";
    cards.forEach((card) => {
        const row = `<tr>
                        <td>${card.id !== null ? card.id : ""}</td>
                        <td>${card.name !== null ? card.name : ""}</td>
                        <td>${card.ex_date !== null ? card.ex_date : ""}</td>
                        <td>${card.balance !== null ? card.balance : ""}</td>               
                     </tr>`;
        table.innerHTML += row;
    });
}

async function fetchCustomers() {
    const response = await fetch("http://localhost:3000/customers");
    const customers = await response.json();
    const table = document.getElementById("customersTable");
    table.innerHTML = "";
    customers.forEach((customer) => {
        const row = `<tr>
                        <td>${customer.name}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.membership_point}</td>                                
                     </tr>`;
        table.innerHTML += row;
    });
}

async function fetchTransaction() {
    const response = await fetch("http://localhost:3000/transaction");
    const transactions = await response.json();
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";
    transactions.forEach((transaction) => {
        const formattedDate = transaction.tdate ?
            new Date(transaction.tdate).toISOString().slice(0, 10) :
            ""; // Format the date to YYYY-MM-DD

        const row = `<tr>
                      <td>${
                        transaction.tran_id
                      }</td>
                      <td>${
                        transaction.total !== null ? transaction.total : ""
                      }</td>
                      <td>${
                        transaction.from_bankacct !== null
                          ? transaction.from_bankacct
                          : ""
                      }</td>
                      <td>${formattedDate}</td>
                      <td>${
                        transaction.business_balance
                      }</td>                                
                   </tr>`;
        table.innerHTML += row;
    });
}

async function fetchLocation() {
    const response = await fetch("http://localhost:3000/location");
    const location = await response.json();
    const table = document.getElementById("locationTable");
    table.innerHTML = "";
    location.forEach((local) => {
        const row = `<tr>
                      <td>${local.name}</td>
                      <td>${local.address}</td>  
                   </tr>`;
        table.innerHTML += row;
    });
}

async function fetchMenu() {
    const response = await fetch("http://localhost:3000/menu");
    const menu = await response.json();
    const table = document.getElementById("menuTable");
    table.innerHTML = "";
    menu.forEach((dish) => {
        const row = `<tr>
                        <td><img src="${dish.image}" alt="${dish.name}" width="100" height="100"></td>    
                        <td>${dish.name}</td>  
                        <td>${dish.price}</td>  
                        <td>${dish.status}</td>            
                     </tr>`;
        table.innerHTML += row;
    });
}

// Function to display a warning message on the webpage
function displayWarning(message) {
    let warningDiv = document.getElementById("warning");
    if (!warningDiv) {
        // Create a warning div if it doesn't exist
        warningDiv = document.createElement("div");
        warningDiv.id = "warning";

        // Style the warning box
        warningDiv.style.position = "fixed";
        warningDiv.style.top = "50%";
        warningDiv.style.left = "50%";
        warningDiv.style.transform = "translate(-50%, -50%)"; // Center the box
        warningDiv.style.backgroundColor = "rgba(255, 0, 0, 0.8)"; // Red background with some transparency
        warningDiv.style.color = "white"; // White text color for contrast
        warningDiv.style.padding = "20px";
        warningDiv.style.borderRadius = "8px";
        warningDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"; // Add a subtle shadow
        warningDiv.style.textAlign = "center";
        warningDiv.style.maxWidth = "300px";
        warningDiv.style.zIndex = "1000"; // Ensure it appears on top

        document.body.appendChild(warningDiv);
    }

    // Set the warning message text
    warningDiv.textContent = message;

    // Automatically hide the warning after 3 seconds
    setTimeout(() => {
        warningDiv.remove();
    }, 3000);
}

async function addOrders() {
    const orders = [];
    const dishRows = document.querySelectorAll(".dish-row");

    dishRows.forEach((row) => {
        const dishName = row.querySelector(".dish-name").textContent;
        const quantityInput = row.querySelector(".quantity-input");
        const quantity = parseInt(quantityInput.value);

        if (quantity && quantity > 0) {
            orders.push({ name: dishName, quantity });
        }
    });

    if (orders.length === 0) {
        alert("Please select at least one dish with a valid quantity.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders }),
        });

        if (response.status === 201) {
            document.querySelectorAll(".quantity-input").forEach((input) => (input.value = ""));
            await fetchOrders();
            await fetchBill();
        } else {
            const errorMessage = await response.text();
            alert(`Error: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("An unexpected error occurred.");
    }
}



async function deleteOrders() {
    const id = document.getElementById("orderIdDelete").value;
    const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: "DELETE",
    });
    if (response.status === 400) {
        // Read and display the warning message from the response
        const warningMessage = await response.text();
        displayWarning(warningMessage);
    } else if (response.ok) {
        // Clear input fields after successful submission
        await fetchOrders();
        await fetchBill();
    } else {
        console.error("An error occurred:", response.statusText);
    }
    document.getElementById("orderIdDelete").value = "";
}

async function payment() {
    const orderId = document.getElementById("paymentOrderId").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const locationName = document.querySelector('input[name="location"]:checked');
    const tip = document.getElementById("tip").value;
    const cardId = document.getElementById("cardId").value;

    try {
        const response = await fetch(`http://localhost:3000/bill/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customerPhone,
                locationName: locationName.value,
                tip,
                cardId,
            }),
        });

        if (response.status === 400) {
            // Bill is already paid - get and display the warning message
            const warningMessage = await response.text(); // Read warning message from the response
            displayWarning(warningMessage); // Display warning on the webpage
        } else if (response.ok) {
            // Clear input fields after successful submission
            await fetchBill(); // Refresh the bill data if necessary
            await fetchTransaction();
            await fetchCards();
            await fetchCustomers();
        } else {
            console.error("An error occurred:", response.statusText);
        }
        await fetchBill(); // Refresh the bill data if necessary
        await fetchTransaction();
        await fetchCards();
        await fetchCustomers();
        document.getElementById("paymentOrderId").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("tip").value = "";
        document.getElementById("cardId").value = "";
        const radioButtons = document.querySelectorAll('input[name="location"]');
        radioButtons.forEach((radio) => {
            radio.checked = false;
        });

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function addCustomer() {
    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;

    try {
        const response = await fetch("http://localhost:3000/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                phone,
            }),
        });

        if (response.status === 400) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning("warningMessage");
        } else if (response.ok) {
            await fetchCustomers();
        } else {
            console.error("An error occurred:", response.statusText);
        }
        document.getElementById("custName").value = "";
        document.getElementById("custPhone").value = "";
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function deleteCustomer() {
    const phone = document.getElementById("custDelete").value;
    const response = await fetch(`http://localhost:3000/customers/${phone}`, {
        method: "DELETE",
    });
    if (response.status === 500) {
        displayWarning("This phone number cannot be deleted because it was used to pay bills.");
    } else if (response.status === 400) {
        displayWarning("This phone number not found");
    } else if (response.ok) {
        // Clear input fields after successful submission
        await fetchCustomers();
    } else {
        console.error("An error occurred:", response.statusText);
    }
    document.getElementById("custDelete").value = "";
}

async function deleteAllCustomers() {
    try {
        const response = await fetch("http://localhost:3000/customers", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchCustomers();
        } else {
            console.error("An error occurred:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all customers:", error);
    }
}

async function deleteAllBills() {
    try {
        const response = await fetch("http://localhost:3000/bill", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchBill(); // Call function to refresh the list of locations
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all bills:", error);
    }
}

async function deleteAllOrders() {
    try {
        const response = await fetch("http://localhost:3000/orders", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchOrders(); // Call function to refresh the list of locations
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all orders:", error);
    }
}

async function deleteAllCards() {
    try {
        const response = await fetch("http://localhost:3000/cards", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchCards(); // Call function to refresh the list of locations
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all cards:", error);
    }
}

async function deleteAllTransactions() {
    try {
        const response = await fetch("http://localhost:3000/transaction", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchTransaction(); // Call function to refresh the list of locations
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all transactions:", error);
    }
}

async function deleteAllLocation() {
    try {
        const response = await fetch("http://localhost:3000/location", {
            method: "DELETE",
        });

        if (response.status === 500) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning(warningMessage);
        } else if (response.ok) {
            await fetchLocation(); // Call function to refresh the list of locations
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all locations:", error);
    }
}

export {
    fetchBill,
    fetchOrders,
    fetchCards,
    fetchCustomers,
    fetchTransaction,
    fetchLocation,
    fetchMenu,
    displayWarning,
    addOrders,
    deleteOrders,
    payment,
    addCustomer,
    deleteCustomer,
    deleteAllCustomers,
    deleteAllBills,
    deleteAllOrders,
    deleteAllCards,
    deleteAllTransactions,
    deleteAllLocation,


};