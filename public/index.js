import * as utilities from "./utilities.js";

const billTable = document.getElementById("bill_table");
const orderTable = document.getElementById("order_table");
const cardTable = document.getElementById("card_table");
const customerTable = document.getElementById("customer_table");
const transactionTable = document.getElementById("transaction_table");
const createTableBtn = document.querySelector(".createTable");
const addOrderBtn = document.getElementById("addOrder");
const deleteOrderBtn = document.getElementById("deleteOrder");
const paymentBtn = document.getElementById("payment");
const addCustomerBtn = document.getElementById("addCustomer");
const deleteCustomerBtn = document.getElementById("deleteCustomer");
const deleteAllBillsBtn = document.getElementById("deleteAllBills");
const deleteAllOrdersBtn = document.getElementById("deleteAllOrders");
const deleteAllCardsBtn = document.getElementById("deleteAllCards");
const deleteAllCustomersBtn = document.getElementById("deleteAllCustomers");
const deleteAllTransactionsBtn = document.getElementById(
    "deleteAllTransactions"
);

// Create table with foreign keys
const billTableSql = `
CREATE TABLE IF NOT EXISTS bill (
    bill_id SERIAL PRIMARY KEY,
    cust_id INTEGER REFERENCES customers(id),  -- Added foreign key to customers
    total NUMERIC(10, 2) DEFAULT 0,
    tip NUMERIC(10, 2) DEFAULT 0,
    tax NUMERIC(10, 2) DEFAULT 0,
    card_id VARCHAR(16) REFERENCES cards(id),  -- Added foreign key to cards
    paid BOOLEAN DEFAULT false
);

INSERT INTO bill (cust_id, total, tip, tax, card_id, paid) VALUES
(8, 41.08, 12.00, 3.39, '8901234589012345', TRUE),
(5, 84.98, 10.00, 7.01, '5678901256789012', TRUE),
(NULL, 44.22, 0.00, 3.65, NULL, FALSE),
(2, 28.99, 10.00, 2.39, '4567890145678901', TRUE),
(1, 19.55, 2.00, 1.61, '2345678923456789', TRUE),
(NULL, 53.97, 0.00, 4.45, NULL, FALSE),
(10, 37.75, 8.00, 3.11, '7890123478901234', TRUE);
`;

const orderTableSql = `
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bill(bill_id),  -- Foreign key to bill
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

INSERT INTO orders (bill_id, name, price, quantity) VALUES
(1, 'Pizza', 17.99, 2),
(1, 'Soda', 2.55, 2),
(2, 'Chicken wings', 15.99, 1),
(2, 'Burger', 8.00, 3),
(2, 'Sparkling water', 5.00, 5),
(3, 'Fried fish', 12.11, 2),
(4, 'Combo 1', 19.99, 1),
(3, 'Cheese burger', 10.00, 2),
(2, 'Combo 1', 19.99, 1),
(4, 'Fries', 4.50, 2),
(5, 'Nuggets', 8.50, 2),
(5, 'Soda', 2.55, 1),
(6, 'Combo 2', 17.99, 3),
(7, 'Jumbo Pizza', 25.00, 1),
(7, 'Sprite', 2.55, 5);

`;

const cardTableSql = `
CREATE TABLE IF NOT EXISTS cards (
    id CHAR(16) PRIMARY KEY,
    name VARCHAR(20),
    ex_date VARCHAR(10),
    balance NUMERIC
);

INSERT INTO cards (id, name, ex_date, balance) VALUES
('1234567812345678', 'Alice Smith', '12/25', 500.00),
('2345678923456789', 'Bob Johnson', '11/27', 2500.00),
('3456789034567890', 'Charlie Brown', '01/26', 1030.00),
('4567890145678901', 'David Wilson', '02/27', 3000.00),
('5678901256789012', 'Eve Davis', '03/25', 1500.00),
('6789012367890123', 'Frank Moore', '04/26', 400.00),
('7890123478901234', 'Grace Lee', '05/27', 2000.00),
('8901234589012345', 'Hannah King', '06/25', 3500.00),
('9012345690123456', 'Ivy Clark', '07/26', 4500.00),
('0123456701234567', 'Jack Hall', '08/26', 600.00);

`;

const txSql = `
CREATE TABLE IF NOT EXISTS transaction (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bill(bill_id),  -- Foreign key to bill
    total NUMERIC(10, 2),
    from_bankacct VARCHAR(16) REFERENCES cards(id),  -- Foreign key to cards
    tdate DATE DEFAULT CURRENT_DATE,
    business_balance NUMERIC(10, 2)
);

INSERT INTO transaction (bill_id, total, from_bankacct, tdate, business_balance) VALUES
(2, 101.99, '5678901256789012', '2024-11-14', 5101.99),
(4, 41.38, '4567890145678901', '2024-11-14', 5143.37),
(1, 56.47, '8901234589012345', '2024-11-14', 5199.84),
(5, 23.16, '2345678923456789', '2024-11-14', 5223.00),
(7, 48.86, '7890123478901234', '2024-11-14', 5271.86);

`;

const customerSql = `
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20),
    phone VARCHAR(10),
    membership_point INTEGER DEFAULT 0  -- Fixed DEFAULT syntax
);

INSERT INTO customers (name, phone, membership_point) VALUES
('Alice Smith', '1234567890', 10),
('Bob Johnson', '2345678901', 17),
('Charlie Brown', '3456789012', 0),
('David Wilson', '4567890123', 0),
('Eve Davis', '5678901234', 6),
('Frank Moore', '6789012345', 0),
('Grace Lee', '7890123456', 9),
('Hannah King', '8901234567', 1),
('Ivy Clark', '9012345678', 4),
('Jack Hall', '0123456789', 8);
`;

const displayAllTables = function() {
    customerTable.style.display = "block";
    cardTable.style.display = "block";
    billTable.style.display = "block";
    orderTable.style.display = "block";
    transactionTable.style.display = "block";
};

window.onload = async function() {
    await utilities.fetchCustomers();
    await utilities.fetchCards();
    await utilities.fetchBill();
    await utilities.fetchOrders();
    await utilities.fetchTransaction();
    displayAllTables();
};

async function createTable(sql) {
    try {
        const response = await fetch("http://localhost:3000/createtable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql }), // Ensure the body is correctly formatted
        });

        if (!response.ok) {
            // Check for error response status
            console.error("Server error:", response.status, response.statusText);
            const errorResponse = await response.json(); // Parse the error body
            console.error("Error details:", errorResponse.error);
            utilities.displayWarning(errorResponse.error);
            return;
        }

        const result = await response.json(); // Parse the response as JSON
        console.log("Table creation result:", result);
    } catch (error) {
        console.error("Error creating table:", error); // Catch any network or parsing errors
    }
}

createTableBtn.addEventListener("click", async() => {
    if (customerTable.style.display != "block") {
        await createTable(customerSql);
        await utilities.fetchCustomers();

        await createTable(cardTableSql);
        await utilities.fetchCards();

        await createTable(billTableSql);
        await utilities.fetchBill();

        await createTable(orderTableSql);
        await utilities.fetchOrders();

        await createTable(txSql);
        await utilities.fetchTransaction();

        displayAllTables();
    }
});

// billCreateBtn.addEventListener("click", () => {
//   createTable(billTableSql);
//   utilities.fetchBill();
//   billTable.style.display = "block";
//   billCreateBtn.style.display = "none";
// });
// orderCreateBtn.addEventListener("click", () => {
//   createTable(orderTableSql);
//   utilities.fetchOrders();
//   orderTable.style.display = "block";
//   orderCreateBtn.style.display = "none";
// });

// cardCreateBtn.addEventListener("click", () => {
//   createTable(cardTableSql);
//   utilities.fetchCards();
//   cardTable.style.display = "block";
//   cardCreateBtn.style.display = "none";
// });

// customerCreateBtn.addEventListener("click", () => {
//   createTable(customerSql);
//   utilities.fetchCustomers();
//   customerTable.style.display = "block";
//   customerCreateBtn.style.display = "none";
// });

// transactionCreateBtn.addEventListener("click", () => {
//   createTable(txSql);
//   utilities.fetchTransaction();
//   transactionTable.style.display = "block";
//   transactionCreateBtn.style.display = "none";
// });

addOrderBtn.addEventListener("click", async() => {
    await utilities.addOrders();
});
deleteOrderBtn.addEventListener("click", async() => {
    await utilities.deleteOrders();
});
paymentBtn.addEventListener("click", async() => {
    await utilities.payment();
});
addCustomerBtn.addEventListener("click", async() => {
    await utilities.addCustomer();
});
deleteCustomerBtn.addEventListener("click", async() => {
    await utilities.deleteCustomer();
});

deleteAllBillsBtn.addEventListener("click", async() => {
    await utilities.deleteAllBills();
    await utilities.fetchBill();
});
deleteAllOrdersBtn.addEventListener("click", async() => {
    await utilities.deleteAllOrders();
    await utilities.fetchOrders();
});
deleteAllCardsBtn.addEventListener("click", async() => {
    await utilities.deleteAllCards();
    await utilities.fetchCards();
});
deleteAllCustomersBtn.addEventListener("click", async() => {
    await utilities.deleteAllCustomers();
    await utilities.fetchCustomers();
});
deleteAllTransactionsBtn.addEventListener("click", async() => {
    await utilities.deleteAllTransactions();
    await utilities.fetchTransaction();
});
