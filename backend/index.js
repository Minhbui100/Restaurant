import * as utilities from "./utilities.js";

const billTable = document.getElementById("bill_table");
const orderTable = document.getElementById("order_table");
const cardTable = document.getElementById("card_table");
const customerTable = document.getElementById("customer_table");
const transactionTable = document.getElementById("transaction_table");
const locationTable = document.getElementById("location_table");
const menuTable = document.getElementById("menu_table");
const createTableBtn = document.querySelector(".createTable");

const addOrderBtn = document.getElementById("addOrder");
const deleteOrderBtn = document.getElementById("deleteOrder");
const paymentBtn = document.getElementById("payment");
const addCustomerBtn = document.getElementById("addCustomer");
const deleteCustomerBtn = document.getElementById("deleteCustomer");
const addMenuBtn = document.getElementById("addMenu");
const deleteMenuBtn = document.getElementById("deleteMenu");
const statusMenuBtn = document.getElementById("setStatus");
const addCardBtn = document.getElementById("addCard");

const deleteAllBillsBtn = document.getElementById("deleteAllBills");
const deleteAllOrdersBtn = document.getElementById("deleteAllOrders");
const deleteAllCardsBtn = document.getElementById("deleteAllCards");
const deleteAllCustomersBtn = document.getElementById("deleteAllCustomers");
const deleteAllTransactionsBtn = document.getElementById(
  "deleteAllTransactions"
);
const deleteAllLocationBtn = document.getElementById("deleteAllLocation");

const overallTable = document.getElementById("business_overview_table");

const billTableSql = `
CREATE TABLE IF NOT EXISTS bill (
    bill_id integer PRIMARY KEY,
    cust_phone VARCHAR(15) REFERENCES customers(phone),  -- Added foreign key to customers
    location_name varchar(45) REFERENCES location(name),
    total NUMERIC(10, 2) DEFAULT 0,
    tip NUMERIC(10, 2) DEFAULT 0,
    tax NUMERIC(10, 2) DEFAULT 0,
    card_id VARCHAR(16) REFERENCES cards(id),  -- Added foreign key to cards
    paid BOOLEAN DEFAULT false
);

INSERT INTO bill (bill_id, cust_phone, location_name, total, tip, tax, card_id, paid) VALUES
(101, '8901234567', 'Big Bend Fast Food', 35.96, 3.00, 2.25, '8901234589012345', TRUE),
(102, '5678901234', 'Guadalupe Mountains Fast Food', 71.96, 4.00, 4.50, '5678901256789012', TRUE),
(103, NULL, NULL, 32.97, 0.00, 2.06, NULL, FALSE),
(104, '2345678901', 'Zion Fast Food', 53.95, 5.00, 3.37, '4567890145678901', TRUE),
(105, '1234567890', 'Zion Fast Food', 40.97, 2.00, 2.56, '2345678923456789', TRUE),
(106, NULL, NULL, 23.97, 0.00, 1.50, NULL, FALSE),
(107, '0123456789', 'Yosemite Fast Food', 43.97, 2.00, 2.75, '7890123478901234', TRUE);
`;

const orderTableSql = `
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bill(bill_id),  -- Foreign key to bill
    name VARCHAR(50) REFERENCES menu(name),
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

INSERT INTO orders (bill_id, name, price, quantity) VALUES
(101, 'Caesar Salad', 9.99, 2),
(101, 'Chocolate Lava Cake', 7.99, 2),
(102, 'Grilled Salmon', 18.99, 3),
(102, 'Spaghetti Carbonara', 14.99, 1),
(103, 'Caesar Salad', 9.99, 2),
(103, 'Cheeseburger Deluxe', 12.99, 1),
(104, 'Cheeseburger Deluxe', 12.99, 2),
(104, 'Chocolate Lava Cake', 7.99, 1),
(104, 'Caesar Salad', 9.99, 2),
(105, 'Margherita Pizza', 13.99, 2),
(105, 'Cheeseburger Deluxe', 12.99, 1),
(106, 'Chocolate Lava Cake', 7.99, 3),
(107, 'Margherita Pizza', 13.99, 1),
(107, 'Spaghetti Carbonara', 14.99, 2);
`;

const cardTableSql = `
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(16) PRIMARY KEY,
    name VARCHAR(20),
    ex_date VARCHAR(10),
    balance NUMERIC
);

INSERT INTO cards (id, name, ex_date, balance) VALUES
('cash', NULL, NULL, NULL),
('1234567812345678', 'Alice Smith', '12/25', 500.00),
('2345678923456789', 'Bob Johnson', '11/27', 2500.00),
('3456789034567890', 'Amy Brown', '01/26', 1030.00),
('4567890145678901', 'Zack Wilson', '02/27', 3000.00),
('5678901256789012', 'Eve Davis', '03/25', 1500.00),
('6789012367890123', 'Frank Moore', '04/26', 400.00),
('7890123478901234', 'Grace Lee', '05/27', 2000.00),
('8901234589012345', 'Hannah King', '06/25', 3500.00),
('9012345690123456', 'Ivy Clark', '07/26', 4500.00),
('0123456701234567', 'Lisa Hall', '08/26', 600.00);

`;

const txSql = `
CREATE TABLE IF NOT EXISTS transaction (
    tran_id serial PRIMARY KEY, 
    total NUMERIC(10, 2),
    from_bankacct VARCHAR(16) REFERENCES cards(id),  -- Foreign key to cards
    tdate DATE DEFAULT CURRENT_DATE,
    business_balance NUMERIC(10, 2)
);

INSERT INTO transaction (total, from_bankacct, tdate, business_balance) VALUES
(80.46, 'cash', '2024-11-25', 5080.46),
(62.32, 'cash', '2024-11-25', 5142.78),
(41.21, 'cash', '2024-11-25', 5183.99),
(45.53, 'cash', '2024-11-25', 5229.52),
(48.72, 'cash', '2024-11-25', 5278.24),
(75.85, 'cash', '2024-11-26', 5354.09),
(55.42, 'cash', '2024-11-26', 5410.51),
(35.67, 'cash', '2024-11-26', 5446.18),
(50.12, 'cash', '2024-11-26', 5496.30),
(60.89, 'cash', '2024-11-26', 5557.19),
(66.40, 'cash', '2024-11-27', 5623.59),
(52.30, 'cash', '2024-11-27', 5675.89),
(47.89, 'cash', '2024-11-27', 5723.78),
(63.11, 'cash', '2024-11-27', 5786.89),
(58.75, 'cash', '2024-11-27', 5845.64),
(69.22, 'cash', '2024-11-28', 5914.86),
(44.53, 'cash', '2024-11-28', 5959.39),
(56.71, 'cash', '2024-11-28', 6016.10),
(62.30, 'cash', '2024-11-28', 6078.40),
(70.40, 'cash', '2024-11-28', 6148.80);

`;

const customerSql = `
CREATE TABLE IF NOT EXISTS customers (
    name VARCHAR(20),
    phone VARCHAR(15) primary key,
    membership_point INTEGER DEFAULT 0  -- Fixed DEFAULT syntax
);

INSERT INTO customers (name, phone, membership_point) VALUES
('Alice Smith', '1234567890', 10),
('Bob Johnson', '2345678901', 17),
('Amy Brown', '3456789012', 0),
('Zack Wilson', '4567890123', 0),
('Eve Davis', '5678901234', 6),
('Frank Moore', '6789012345', 0),
('Grace Lee', '7890123456', 9),
('Hannah King', '8901234567', 1),
('Ivy Clark', '9012345678', 4),
('Lisa Hall', '0123456789', 8);
`;

const locaTableSql = `
CREATE TABLE IF NOT EXISTS location (
    name VARCHAR(45) primary key,
    address varchar(120)
);

INSERT INTO location (name, address) VALUES
('Big Bend Fast Food', '9 Basin Rural Station Big Bend National Park, TX'),
('Yosemite Fast Food', '1206 Village Dr Yosemite Village, Yosemite National Park, CA'),
('Guadalupe Mountains Fast Food', '4010 National Parks Hwy Carlsbad, NM'),
('Carlsbad Caverns Fast Food', '24 Carlsbad Cavern Highway, Carlsbad Caverns National Park, NM'),
('Arches Fast Food', '617 S Highway 191 Moab, UT'),
('Zion Fast Food', '999 S Cross Hollow Rd Cedar City, UT'),
('Rocky Mountain Fast Food', '5046 Alpine Visitors Center, Rocky Mountain National Park, CO'),
('Redwood Fast Food', '2095 US Highway 199, Hiouchi, CA');
`;

const menuTableSql = `
CREATE TABLE menu(
    name VARCHAR(50) PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(700),
    status VARCHAR(20) CHECK(Status IN('Available', 'Out of Stock'))
);
INSERT INTO menu(Name, Price, Image, Status) VALUES
    ('Grilled Salmon', 18.99, 'https://www.cookingclassy.com/wp-content/uploads/2018/05/grilled-salmon-3.jpg', 'Available'),
    ('Spaghetti Carbonara', 14.99, 'https://bellyfull.net/wp-content/uploads/2023/02/Spaghetti-Carbonara-blog-1.jpg', 'Available'),
    ('Caesar Salad', 9.99, 'https://www.allrecipes.com/thmb/JTW0AIVY5PFxqLrf_-CDzT4OZQY=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/229063-Classic-Restaurant-Caesar-Salad-ddmfs-4x3-231-89bafa5e54dd4a8c933cf2a5f9f12a6f.jpg', 'Out of Stock'),
    ('Cheeseburger Deluxe', 12.99, 'https://www.tysonfoodservice.com/adobe/dynamicmedia/deliver/dm-aid--92a52f1f-9d97-4118-93d0-a54d82e85a68/deluxe-cheeseburger-pickles-onion-pub-burger-137353-768x522.jpg?preferwebp=true&width=1200&quality=75', 'Available'),
    ('Margherita Pizza', 13.99, 'https://foodbyjonister.com/wp-content/uploads/2020/01/MargheritaPizza.jpg', 'Out of Stock'),
    ('Chocolate Lava Cake', 7.99, 'https://www.melskitchencafe.com/wp-content/uploads/2023/01/updated-lava-cakes7.jpg', 'Available');
`;

const displayAllTables = function () {
  customerTable.style.display = "block";
  cardTable.style.display = "block";
  billTable.style.display = "block";
  orderTable.style.display = "block";
  transactionTable.style.display = "block";
  locationTable.style.display = "block";
  menuTable.style.display = "block";
  overallTable.style.display = "block";
};

window.onload = async function () {
  await utilities.fetchMenu();
  await utilities.fetchCustomers();
  await utilities.fetchCards();
  await utilities.fetchLocation();
  await utilities.fetchBill();
  await utilities.fetchOrders();
  await utilities.fetchTransaction();
  await utilities.overallview();
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

createTableBtn.addEventListener("click", async () => {
  if (customerTable.style.display != "block") {
    await createTable(menuTableSql);
    await utilities.fetchMenu();

    await createTable(customerSql);
    await utilities.fetchCustomers();

    await createTable(cardTableSql);
    await utilities.fetchCards();

    await createTable(locaTableSql);
    await utilities.fetchLocation();

    await createTable(billTableSql);
    await utilities.fetchBill();

    await createTable(orderTableSql);
    await utilities.fetchOrders();

    await createTable(txSql);
    await utilities.fetchTransaction();

    await utilities.overallview();

    displayAllTables();
    createTableBtn.style.display = "none";
  }
});

addOrderBtn.addEventListener("click", async () => {
  await utilities.addOrders();
});
deleteOrderBtn.addEventListener("click", async () => {
  await utilities.deleteOrders();
});
paymentBtn.addEventListener("click", async () => {
  await utilities.payment();
});
addCustomerBtn.addEventListener("click", async () => {
  await utilities.addCustomer();
});
deleteCustomerBtn.addEventListener("click", async () => {
  await utilities.deleteCustomer();
});
addMenuBtn.addEventListener("click", async () => {
  await utilities.addMenu();
});
deleteMenuBtn.addEventListener("click", async () => {
  await utilities.deleteMenu();
});
statusMenuBtn.addEventListener("click", async () => {
  await utilities.setMenuStatus();
});
addCardBtn.addEventListener("click", async () => {
  await utilities.addCard();
});

deleteAllBillsBtn.addEventListener("click", async () => {
  await utilities.deleteAllBills();
  await utilities.fetchBill();
});
deleteAllOrdersBtn.addEventListener("click", async () => {
  await utilities.deleteAllOrders();
  await utilities.fetchOrders();
});
deleteAllCardsBtn.addEventListener("click", async () => {
  await utilities.deleteAllCards();
  await utilities.fetchCards();
});
deleteAllCustomersBtn.addEventListener("click", async () => {
  await utilities.deleteAllCustomers();
  await utilities.fetchCustomers();
});
deleteAllTransactionsBtn.addEventListener("click", async () => {
  await utilities.deleteAllTransactions();
  await utilities.fetchTransaction();
});
deleteAllLocationBtn.addEventListener("click", async () => {
  await utilities.deleteAllLocation();
  await utilities.fetchLocation();
});
document.querySelectorAll(".dashboard-tab").forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.target.getAttribute("data-target");

    // Hide all forms
    document.querySelectorAll(".form-container").forEach((form) => {
      form.classList.add("hidden");
      form.classList.remove("active");
    });

    // Show the targeted form
    const targetForm = document.getElementById(target);
    if (targetForm) {
      targetForm.classList.remove("hidden");
      targetForm.classList.add("active");
    }
  });
});
