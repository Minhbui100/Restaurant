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
        const balance = card.balance !== null ? parseFloat(card.balance).toFixed(2) : ""; // Ensuring it's a number and formatted
        const row = `<tr>
                        <td>${card.id !== null ? card.id : ""}</td>
                        <td>${card.name !== null ? card.name : ""}</td>
                        <td>${card.ex_date !== "N/A" ? card.ex_date : ""}</td>
                        <td>${
                          card.ex_date !== "N/A" ? balance : ""
                        }</td>               
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

let businessChart; // Declare the chart globally to manage its instance

async function fetchTransaction() {
    const response = await fetch("http://localhost:3000/transaction");
    const transactions = await response.json();

    // Initialize variables
    const dates = [];
    const revenues = [];
    let lastBalance = 5000; // Original balance at the start

    transactions.forEach((transaction, index) => {
        const formattedDate = new Date(transaction.tdate)
            .toISOString()
            .slice(0, 10); // Format date as YYYY-MM-DD

        // Calculate the revenue for the current day by subtracting last day's balance from today's balance
        const revenueForDay = transaction.business_balance - lastBalance;

        // Check if the date already exists in the dates array
        if (!dates.includes(formattedDate)) {
            // If not, add the new date and its corresponding revenue
            dates.push(formattedDate);
            revenues.push(revenueForDay);
        } else {
            // If the date already exists, find the index and add the revenue for the day
            const index = dates.indexOf(formattedDate);
            revenues[index] += revenueForDay;
        }

        // Update the lastBalance to the current day's business_balance for the next iteration
        lastBalance = transaction.business_balance;
    });

    // Destroy the previous chart instance if it exists
    if (businessChart) {
        businessChart.destroy();
    }

    // Create the chart
    const ctx = document.getElementById("businessChart").getContext("2d");
    businessChart = new Chart(ctx, {
        type: "line", // Type of chart
        data: {
            labels: dates, // Dates on the x-axis
            datasets: [{
                label: "Total Transactions per Day",
                data: revenues, // Transaction revenues on the y-axis
                borderColor: "rgba(75, 192, 192, 1)", // Line color
                fill: false, // Don't fill the area under the line
                tension: 0.1, // Smoothing of the line
            }, ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Amount ($)",
                    },
                    beginAtZero: true,
                },
            },
        },
    });

    // Update the table
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";
    transactions.forEach((tran) => {
        const formattedDate = new Date(tran.tdate).toISOString().slice(0, 10); // Format date to YYYY-MM-DD
        const row = `<tr>
                        <td>${tran.tran_id}</td>
                        <td>${tran.total}</td>
                        <td>${tran.from_bankacct}</td> 
                        <td>${formattedDate}</td>
                        <td>${tran.business_balance}</td>                               
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

async function fetchEmployee() {
    const response = await fetch("http://localhost:3000/employee");
    const employees = await response.json();
    const table = document.getElementById("employeeTable");
    table.innerHTML = "";
    employees.forEach((employee) => {
        const row = `<tr>
                        <td>${employee.name}</td>
                        <td>${employee.ssn}</td>
                        <td>${employee.position}</td>     
                        <td>${employee.location_name}</td>                             
                     </tr>`;
        table.innerHTML += row;
    });
}

async function fetchSchedule() {
    const response = await fetch("http://localhost:3000/schedule");
    const schedules = await response.json();
    const table = document.getElementById("scheduleTable");
    table.innerHTML = "";
    schedules.forEach((schedule) => {
        const row = `<tr>
                        <td>${schedule.ssn}</td>
                        <td>${schedule.work_day}</td>     
                     </tr>`;
        table.innerHTML += row;
    });
}

async function fetchReview() {
    const response = await fetch("http://localhost:3000/review");
    const reviews = await response.json();
    const table = document.getElementById("reviewTable");
    table.innerHTML = "";
    reviews.forEach((review) => {
        const formattedDate = new Date(review.reviewdate)
            .toISOString()
            .slice(0, 10); // Format date to YYYY-MM-DD
        const row = `<tr>
                        <td>${formattedDate}</td>
                        <td>${review.customer_phone}</td>  
                        <td>${review.location_name}</td>
                        <td>${review.rating}</td>
                        <td>${review.review_text}</td>   
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
            await fetchOrders();
            await fetchBill();
            await overallview();
        } else {
            const errorMessage = await response.text();
            alert(`Error: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("An unexpected error occurred.");
    }
    document
        .querySelectorAll(".quantity-input")
        .forEach((input) => (input.value = ""));
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
        await overallview();
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
            await overallview();
        } else {
            console.error("An error occurred:", response.statusText);
        }
        await fetchBill(); // Refresh the bill data if necessary
        await fetchTransaction();
        await fetchCards();
        await fetchCustomers();
        await overallview();
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
        displayWarning(
            "This phone number cannot be deleted because it was used to pay bills."
        );
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

async function addMenu() {
    const name = document.getElementById("menuName").value;
    const price = document.getElementById("menuPrice").value;
    const image = document.getElementById("image").value;

    try {
        const response = await fetch("http://localhost:3000/menu", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                price,
                image,
            }),
        });

        if (response.status === 400) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning("warningMessage");
        } else if (response.ok) {
            await fetchMenu();
        } else {
            console.error("An error occurred:", response.statusText);
        }
        document.getElementById("menuName").value = "";
        document.getElementById("menuPrice").value = "";
        document.getElementById("image").value = "";
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function deleteMenu() {
    const name = document.getElementById("menuDelete").value;
    const response = await fetch(`http://localhost:3000/menu/${name}`, {
        method: "DELETE",
    });
    if (response.status === 500) {
        displayWarning(
            "This dish cannot be deleted because it was used to pay bills."
        );
    } else if (response.status === 400) {
        displayWarning("This dish name not found");
    } else if (response.ok) {
        // Clear input fields after successful submission
        await fetchMenu();
    } else {
        console.error("An error occurred:", response.statusText);
    }
    document.getElementById("menuDelete").value = "";
}

async function setMenuStatus() {
    const name = document.getElementById("statusName").value;
    const status = document.querySelector('input[name="status"]:checked');

    try {
        const response = await fetch(`http://localhost:3000/menu/status/${name}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: status.value,
            }),
        });

        if (response.status === 400) {
            displayWarning("Menu item not found.");
        } else if (response.ok) {
            await fetchMenu(); // Refresh the menu table
            document.getElementById("statusName").value = "";
            const radioButtons = document.querySelectorAll('input[name="status"]');
            radioButtons.forEach((radio) => {
                radio.checked = false;
            });
        } else {
            console.error("An error occurred:", response.statusText);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function addCard() {
    const id = document.getElementById("cardID").value;
    const name = document.getElementById("cardName").value;
    const date = document.getElementById("cardDate").value;
    const balance = document.getElementById("cardBalance").value;

    try {
        const response = await fetch("http://localhost:3000/cards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                name,
                date,
                balance,
            }),
        });

        if (response.status === 400) {
            // Read and display the warning message from the response
            const warningMessage = await response.text();
            displayWarning("warningMessage");
        } else if (response.ok) {
            await fetchCards();
        } else {
            console.error("An error occurred:", response.statusText);
        }
        document.getElementById("cardID").value = "";
        document.getElementById("cardName").value = "";
        document.getElementById("cardDate").value = "";
        document.getElementById("cardBalance").value = "";
    } catch (error) {
        console.error("Fetch error:", error);
    }
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
            await overallview();
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
            await overallview();
        } else {
            console.error("Unexpected response:", response.statusText);
        }
    } catch (error) {
        console.error("Failed to delete all locations:", error);
    }
}

async function overallview() {
    try {
        // Fetch overall view data
        const response = await fetch("http://localhost:3000/overallview");
        const data = await response.json();

        // Populate the table
        const tableBody = document.getElementById("businessOverviewTable");
        tableBody.innerHTML = `
        <tr>
          <td>${data.num_bills}</td>
          <td>${data.business_balance}</td>
          <td>${data.num_locations}</td>
        </tr>
      `;
    } catch (error) {
        console.error("Error fetching overall view:", error);
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
    fetchEmployee,
    fetchSchedule,
    fetchReview,
    displayWarning,
    addOrders,
    deleteOrders,
    payment,
    addCustomer,
    deleteCustomer,
    addMenu,
    deleteMenu,
    deleteAllCustomers,
    deleteAllBills,
    deleteAllOrders,
    deleteAllCards,
    deleteAllTransactions,
    deleteAllLocation,
    overallview,
    setMenuStatus,
    addCard,
};
