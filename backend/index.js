import * as utilities from "./utilities.js";

const billTable = document.getElementById("bill_table");
const orderTable = document.getElementById("order_table");
const cardTable = document.getElementById("card_table");
const customerTable = document.getElementById("customer_table");
const transactionTable = document.getElementById("transaction_table");
const locationTable = document.getElementById("location_table");
const menuTable = document.getElementById("menu_table");
const createTableBtn = document.querySelector(".createTable");
const employeeTable = document.getElementById("employee_table");
const scheduleTable = document.getElementById("schedule_table");
const reviewTable = document.getElementById("review_table");


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
const refreshBtn = document.querySelector(".refresh");

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
CREATE INDEX idx_bill_cust_phone ON bill(cust_phone);
CREATE INDEX idx_bill_location_name ON bill(location_name);
CREATE INDEX idx_bill_card_id ON bill(card_id);

INSERT INTO bill (bill_id, cust_phone, location_name, total, tip, tax, card_id, paid) VALUES
(101, '8901234567', 'Big Bend Fast Food', 35.96, 3.00, 2.25, '8901234589012345', TRUE),
(102, '5678901234', 'Guadalupe Mountains Fast Food', 71.96, 4.00, 4.50, '5678901256789012', TRUE),
(103, '0123456789', 'Guadalupe Mountains Fast Food', 32.97, 0.00, 2.06, '7890123478901234', TRUE),
(104, '2345678901', 'Zion Fast Food', 53.95, 5.00, 3.37, '4567890145678901', TRUE),
(105, '1234567890', 'Zion Fast Food', 40.97, 2.00, 2.56, '2345678923456789', TRUE),
(106, '3215554877', 'Rocky Mountain Fast Food', 23.97, 0.00, 1.50, 'cash-3215554877', TRUE),
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

CREATE INDEX idx_orders_bill_id ON orders(bill_id);
CREATE INDEX idx_orders_name ON orders(name);
CREATE INDEX idx_orders_bill_id_name ON orders(bill_id, name);

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
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(35),
    ex_date VARCHAR(10),
    balance NUMERIC
);

INSERT INTO cards (id, name, ex_date, balance) VALUES
    ('cash-3215554877', 'Lee Chung', 'N/A', 0),
    ('1234567812345678', 'Alice Smith', '12/25', 500.00),
    ('2345678923456789', 'Bob Johnson', '11/27', 2500.00),
    ('3456789034567890', 'Amy Brown', '01/26', 1030.00),
    ('4567890145678901', 'Zack Wilson', '02/27', 3000.00),
    ('5678901256789012', 'Eve Davis', '03/25', 1500.00),
    ('6789012367890123', 'Frank Moore', '04/26', 400.00),
    ('7890123478901234', 'Grace Lee', '05/27', 2000.00),
    ('8901234589012345', 'Hannah King', '06/25', 3500.00),
    ('9012345690123456', 'Ivy Clark', '07/26', 4500.00),
    ('0123456701234567', 'Lisa Hall', '08/26', 600.00),
    ('2233445622334456', 'James Miller', '09/25', 1200.00),
    ('3344556733445567', 'Olivia Martin', '10/26', 2500.00),
    ('4455667844556678', 'Liam Wilson', '11/25', 3500.00),
    ('5566778955667789', 'Emma Garcia', '12/26', 1500.00),
    ('6677889066778890', 'Noah Anderson', '01/27', 2000.00),
    ('7788990177889901', 'Sophia Thomas', '02/26', 1800.00),
    ('8899001288990012', 'Mason Hernandez', '03/25', 2200.00),
    ('9900112399001123', 'Isabella Lopez', '04/27', 2700.00),
    ('1011123410111234', 'Ethan Martinez', '05/26', 1600.00),
    ('1122334511223345', 'Ava Rodriguez', '06/27', 2900.00),
    ('2233445622334457', 'Logan Walker', '07/25', 1000.00),
    ('3344556733445568', 'Charlotte Hill', '08/26', 2500.00),
    ('4455667844556679', 'Lucas Scott', '09/27', 2800.00),
    ('5566778955667790', 'Mia Green', '10/25', 1300.00),
    ('6677889066778891', 'Alexander Adams', '11/26', 2200.00),
    ('7788990177889902', 'Aria Baker', '12/27', 900.00),
    ('8899001288990013', 'Henry Nelson', '01/25', 2100.00),
    ('9900112399001124', 'Amelia Carter', '02/26', 2400.00),
    ('1011123410111235', 'Elijah Mitchell', '03/27', 1800.00),
    ('1122334511223346', 'Ella Perez', '04/25', 2500.00),
    ('2233445622334458', 'Benjamin Roberts', '05/26', 3000.00),
    ('3344556733445569', 'Chloe Turner', '06/27', 1600.00),
    ('4455667844556680', 'Sebastian Phillips', '07/25', 2300.00),
    ('5566778955667791', 'Emily Campbell', '08/26', 2700.00),
    ('6677889066778892', 'Jack Evans', '09/27', 2000.00),
    ('7788990177889903', 'Luna Edwards', '10/25', 1500.00),
    ('8899001288990014', 'Jackson Morgan', '11/26', 1700.00),
    ('9900112399001125', 'Avery Rivera', '12/27', 1900.00),
    ('1011123410111236', 'Michael Simmons', '01/25', 2800.00),
    ('1122334511223347', 'Harper Ramirez', '02/26', 2300.00),
    ('2233445622334459', 'Evelyn Bennett', '03/25', 1800.00),
    ('3344556733445570', 'Oliver Gray', '04/27', 2400.00),
    ('4455667844556681', 'Scarlett Sanchez', '05/25', 3000.00),
    ('5566778955667792', 'Matthew Foster', '06/26', 1200.00),
    ('6677889066778893', 'Abigail Brooks', '07/27', 2500.00),
    ('7788990177889904', 'Daniel Bell', '08/25', 2000.00),
    ('8899001288990015', 'Victoria Russell', '09/26', 2700.00),
    ('9900112399001126', 'Aiden Price', '10/27', 1300.00),
    ('1011123410111237', 'Layla Howard', '11/25', 1800.00),
    ('1122334511223348', 'Elena Perry', '12/26', 2200.00),
    ('2233445622334460', 'Julian Cook', '01/27', 1900.00),
    ('3344556733445571', 'Lily Ward', '02/25', 2500.00),
    ('4455667844556682', 'Carter Cox', '03/26', 3000.00),
    ('5566778955667793', 'Victoria Butler', '04/25', 1000.00),
    ('6677889066778894', 'Wyatt Flores', '05/27', 2400.00),
    ('7788990177889905', 'Aubrey Peterson', '06/25', 2800.00),
    ('8899001288990016', 'Luke Simmons', '07/26', 1500.00),
    ('9900112399001127', 'Zoe Bailey', '08/27', 2200.00),
    ('1011123410111238', 'Isaac Rogers', '09/25', 2700.00),
    ('1122334511223349', 'Penelope Hayes', '10/26', 2000.00),
    ('2233445622334461', 'Dylan Myers', '11/25', 2300.00),
    ('3344556733445572', 'Stella Kelly', '12/26', 1800.00),
    ('4455667844556683', 'Levi Sanders', '01/27', 2100.00),
    ('5566778955667794', 'Nora Barnes', '02/25', 1900.00),
    ('6677889066778895', 'Andrew Powell', '03/26', 1600.00),
    ('7788990177889906', 'Hazel Long', '04/27', 2500.00),
    ('8899001288990017', 'Hunter Hayes', '05/25', 3000.00),
    ('9900112399001128', 'Brooklyn Hughes', '06/26', 2700.00),
    ('1011123410111239', 'Eleanor Price', '07/25', 1300.00),
    ('1122334511223350', 'Miles Woods', '08/26', 2000.00),
    ('2233445622334462', 'Aurora Hall', '09/27', 2200.00),
    ('3344556733445573', 'Caleb Ellis', '10/25', 1500.00),
    ('4455667844556684', 'Sophie Cooper', '11/27', 1800.00),
    ('5566778955667795', 'Gabriel Bryant', '12/25', 2400.00),
    ('6677889066778896', 'Audrey Jenkins', '01/26', 3000.00),
    ('7788990177889907', 'Grayson Barnes', '02/25', 1000.00),
    ('8899001288990018', 'Hannah Fisher', '03/27', 2500.00),
    ('9900112399001129', 'Ezekiel Morales', '04/25', 2800.00),
    ('1011123410111240', 'Mila Nguyen', '05/26', 2100.00),
    ('1122334511223351', 'David Reyes', '06/25', 2300.00),
    ('2233445622334463', 'Savannah Foster', '07/26', 2600.00),
    ('3344556733445574', 'Jacob Reed', '08/27', 1200.00),
    ('4455667844556685', 'Leah Gonzales', '09/25', 1500.00),
    ('5566778955667796', 'Christopher Knight', '10/26', 1800.00),
    ('6677889066778897', 'Madelyn Chavez', '11/27', 1900.00),
    ('7788990177889908', 'Asher Palmer', '12/25', 2500.00),
    ('8899001288990019', 'Skylar Hart', '01/26', 1400.00),
    ('9900112399001130', 'Cameron Torres', '02/27', 1700.00),
    ('1011123410111241', 'Ella Montgomery', '03/25', 2200.00);

`;

const txSql = `
CREATE TABLE IF NOT EXISTS transaction (
    tran_id serial PRIMARY KEY, 
    total NUMERIC(10, 2),
    from_bankacct VARCHAR(16) REFERENCES cards(id),  -- Foreign key to cards
    tdate DATE DEFAULT '2024-12-05',
    business_balance NUMERIC(10, 2)
);
CREATE INDEX idx_transaction_from_bankacct ON transaction(from_bankacct);
CREATE INDEX idx_transaction_from_bankacct_tdate ON transaction(from_bankacct, tdate);
CREATE INDEX idx_transaction_business_balance ON transaction(business_balance);


CREATE INDEX IF NOT EXISTS idx_transaction_from_bankacct ON transaction (from_bankacct);
CREATE INDEX IF NOT EXISTS idx_transaction_tdate ON transaction (tdate);
CREATE INDEX IF NOT EXISTS idx_transaction_business_balance ON transaction (business_balance);
CREATE INDEX IF NOT EXISTS idx_transaction_from_bankacct_tdate ON transaction (from_bankacct, tdate);

INSERT INTO transaction (total, from_bankacct, tdate, business_balance) VALUES
(80.46, '1234567812345678', '2024-12-02', 5080.46),
(62.32, '3456789034567890', '2024-12-02', 5142.78),
(41.21, '2345678923456789', '2024-12-02', 5183.99),
(45.53, '5678901256789012', '2024-12-02', 5229.52),
(48.72, '3456789034567890', '2024-12-02', 5278.24),
(75.85, '5678901256789012', '2024-12-03', 5354.09),
(55.42, '7890123478901234', '2024-12-03', 5410.51),
(35.67, '1234567812345678', '2024-12-03', 5446.18),
(50.12, '4567890145678901', '2024-12-03', 5496.30),
(60.89, '2345678923456789', '2024-12-03', 5557.19),
(66.40, '9012345690123456', '2024-12-04', 5623.59),
(52.30, '0123456701234567', '2024-12-04', 5675.89),
(47.89, '8901234589012345', '2024-12-04', 5723.78),
(63.11, '9012345690123456', '2024-12-04', 5786.89),
(58.75, '3456789034567890', '2024-12-04', 5845.64),
(69.22, '2345678923456789', '2024-12-05', 5914.86),
(44.53, '4567890145678901', '2024-12-05', 5959.39),
(56.71, 'cash-3215554877', '2024-12-05', 6016.10),
(62.30, '8901234589012345', '2024-12-05', 6078.40),
(70.40, '9012345690123456', '2024-12-05', 6148.80),
(141.64, 'cash-3215554877', '2024-12-05', 6290.44);

`;

const customerSql = `
CREATE TABLE IF NOT EXISTS customers (
    name VARCHAR(20),
    phone VARCHAR(15) primary key,
    membership_point INTEGER DEFAULT 0  -- Fixed DEFAULT syntax
);
CREATE INDEX idx_customers_name ON customers(name);

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
    ('Lisa Hall', '0123456789', 8),
    ('Lee Chung', '3215554877', 1),
    ('James Miller', '1234509876', 12),
    ('Olivia Martin', '2345610987', 25),
    ('Liam Wilson', '3456721098', 5),
    ('Emma Garcia', '4567832109', 14),
    ('Noah Anderson', '5678943210', 0),
    ('Sophia Thomas', '6789054321', 19),
    ('Mason Hernandez', '7890165432', 2),
    ('Isabella Lopez', '8901276543', 7),
    ('Ethan Martinez', '9012387654', 0),
    ('Ava Rodriguez', '0123498765', 10),
    ('Logan Walker', '2233445566', 3),
    ('Charlotte Hill', '3344556677', 22),
    ('Lucas Scott', '4455667788', 0),
    ('Mia Green', '5566778899', 18),
    ('Alexander Adams', '6677889900', 9),
    ('Aria Baker', '7788990011', 8),
    ('Henry Nelson', '8899001122', 30),
    ('Amelia Carter', '9900112233', 6),
    ('Elijah Mitchell', '1011123344', 11),
    ('Ella Perez', '1122334455', 4),
    ('Benjamin Roberts', '2233445567', 15),
    ('Chloe Turner', '3344556678', 0),
    ('Sebastian Phillips', '4455667789', 20),
    ('Emily Campbell', '5566778890', 1),
    ('Jack Evans', '6677889901', 13),
    ('Luna Edwards', '7788990012', 16),
    ('Jackson Morgan', '8899001123', 12),
    ('Avery Rivera', '9900112234', 2),
    ('Michael Simmons', '1011123345', 27),
    ('Harper Ramirez', '1122334456', 5),
    ('Evelyn Bennett', '1233214567', 0),
    ('Oliver Gray', '2344325678', 23),
    ('Scarlett Sanchez', '3455436789', 18),
    ('Matthew Foster', '4566547890', 6),
    ('Abigail Brooks', '5677658901', 1),
    ('Daniel Bell', '6788769012', 0),
    ('Victoria Russell', '7899870123', 9),
    ('Aiden Price', '8900981234', 14),
    ('Layla Howard', '9012092345', 7),
    ('Elena Perry', '0123103456', 0),
    ('Julian Cook', '1234214567', 12),
    ('Lily Ward', '2345325678', 5),
    ('Carter Cox', '3456436789', 8),
    ('Victoria Butler', '4567547890', 10),
    ('Wyatt Flores', '5678658901', 4),
    ('Aubrey Peterson', '6789769012', 13),
    ('Luke Simmons', '7890870123', 6),
    ('Zoe Bailey', '8901981234', 17),
    ('Isaac Rogers', '9012092346', 3),
    ('Penelope Hayes', '0123203457', 11),
    ('Dylan Myers', '1234314568', 7),
    ('Stella Kelly', '2345425679', 15),
    ('Levi Sanders', '3456536780', 2),
    ('Nora Barnes', '4567647891', 19),
    ('Andrew Powell', '5678758902', 5),
    ('Hazel Long', '6789869013', 1),
    ('Hunter Hayes', '7890970124', 26),
    ('Brooklyn Hughes', '8901081235', 12),
    ('Eleanor Price', '9012192346', 0),
    ('Miles Woods', '0123303458', 20),
    ('Aurora Hall', '1234414569', 3),
    ('Caleb Ellis', '2345525680', 8),
    ('Sophie Cooper', '3456636781', 0),
    ('Gabriel Bryant', '4567747892', 14),
    ('Audrey Jenkins', '5678858903', 6),
    ('Grayson Barnes', '6789969014', 18),
    ('Hannah Fisher', '7891070125', 5),
    ('Ezekiel Morales', '8902181236', 11),
    ('Mila Nguyen', '9013292347', 9),
    ('David Reyes', '0124403459', 13),
    ('Savannah Foster', '1235514570', 6),
    ('Jacob Reed', '2346625681', 0),
    ('Leah Gonzales', '3457736782', 8),
    ('Christopher Knight', '4568847893', 25),
    ('Madelyn Chavez', '5679958904', 5),
    ('Asher Palmer', '6781069015', 9),
    ('Skylar Hart', '7892170126', 1),
    ('Cameron Torres', '8903281237', 7),
    ('Ella Montgomery', '9014392348', 19);
`;

const locaTableSql = `
CREATE TABLE IF NOT EXISTS location (
    name VARCHAR(45) primary key,
    address varchar(120)
);

CREATE INDEX idx_location_address ON location(address);


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
CREATE INDEX idx_menu_status ON menu(status);
CREATE INDEX idx_menu_status_price ON menu(status, price);
INSERT INTO menu(Name, Price, Image, Status) VALUES
    ('Grilled Salmon', 18.99, 'https://www.cookingclassy.com/wp-content/uploads/2018/05/grilled-salmon-3.jpg', 'Available'),
    ('Spaghetti Carbonara', 14.99, 'https://bellyfull.net/wp-content/uploads/2023/02/Spaghetti-Carbonara-blog-1.jpg', 'Available'),
    ('Caesar Salad', 9.99, 'https://www.allrecipes.com/thmb/JTW0AIVY5PFxqLrf_-CDzT4OZQY=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/229063-Classic-Restaurant-Caesar-Salad-ddmfs-4x3-231-89bafa5e54dd4a8c933cf2a5f9f12a6f.jpg', 'Out of Stock'),
    ('Cheeseburger Deluxe', 12.99, 'https://www.tysonfoodservice.com/adobe/dynamicmedia/deliver/dm-aid--92a52f1f-9d97-4118-93d0-a54d82e85a68/deluxe-cheeseburger-pickles-onion-pub-burger-137353-768x522.jpg?preferwebp=true&width=1200&quality=75', 'Available'),
    ('Margherita Pizza', 13.99, 'https://foodbyjonister.com/wp-content/uploads/2020/01/MargheritaPizza.jpg', 'Out of Stock'),
    ('Chocolate Lava Cake', 7.99, 'https://www.melskitchencafe.com/wp-content/uploads/2023/01/updated-lava-cakes7.jpg', 'Available');
`;


const employeeSql = `
CREATE TABLE IF NOT EXISTS employee (
    name VARCHAR(30),
    ssn VARCHAR(11) primary key,
    position varchar(20),
    location_name varchar(45) REFERENCES location(name)
);
CREATE INDEX idx_employee_position ON employee(position);
CREATE INDEX idx_employee_location_name ON employee(location_name);
CREATE INDEX idx_employee_position_location_name ON employee(position, location_name);

INSERT INTO employee (name, ssn, position, location_name) VALUES
    ('Alice Smith', '111-22-3333', 'Manager', 'Big Bend Fast Food'),
    ('Bob Johnson', '222-33-4444', 'Chef', 'Big Bend Fast Food'),
    ('Charlie Brown', '333-44-5555', 'Server', 'Big Bend Fast Food'),
    ('Diana Prince', '444-55-6666', 'Cashier', 'Big Bend Fast Food'),
    ('Ethan Hunt', '555-66-7777', 'Chef', 'Big Bend Fast Food'),
    ('Fiona Apple', '666-77-8888', 'Server', 'Big Bend Fast Food'),
    ('George King', '777-88-9999', 'Cashier', 'Big Bend Fast Food'),
    ('Hannah Lee', '888-99-0000', 'Manager', 'Yosemite Fast Food'),
    ('Ian Wright', '999-00-1111', 'Chef', 'Yosemite Fast Food'),
    ('Jack White', '000-11-2222', 'Server', 'Yosemite Fast Food'),
    ('Karen Black', '111-22-3334', 'Cashier', 'Yosemite Fast Food'),
    ('Liam Stone', '222-33-4445', 'Chef', 'Yosemite Fast Food'),
    ('Mona Lisa', '333-44-5556', 'Server', 'Yosemite Fast Food'),
    ('Nathan Drake', '444-55-6667', 'Cashier', 'Yosemite Fast Food'),
    ('Olivia Pope', '555-66-7778', 'Manager', 'Guadalupe Mountains Fast Food'),
    ('Peter Parker', '666-77-8889', 'Chef', 'Guadalupe Mountains Fast Food'),
    ('Quinn Harper', '777-88-9990', 'Server', 'Guadalupe Mountains Fast Food'),
    ('Rachel Green', '888-99-0001', 'Cashier', 'Guadalupe Mountains Fast Food'),
    ('Steve Rogers', '999-00-1112', 'Chef', 'Guadalupe Mountains Fast Food'),
    ('Tony Stark', '000-11-2223', 'Server', 'Guadalupe Mountains Fast Food'),
    ('Uma Thurman', '111-22-3335', 'Cashier', 'Guadalupe Mountains Fast Food'),
    ('Victor Creed', '222-33-4446', 'Manager', 'Carlsbad Caverns Fast Food'),
    ('Wanda Maximoff', '333-44-5557', 'Chef', 'Carlsbad Caverns Fast Food'),
    ('Xander Cage', '444-55-6668', 'Server', 'Carlsbad Caverns Fast Food'),
    ('Yvonne Strahovski', '555-66-7779', 'Cashier', 'Carlsbad Caverns Fast Food'),
    ('Zachary Levi', '666-77-8880', 'Chef', 'Carlsbad Caverns Fast Food'),
    ('Andrea Lopez', '777-88-9991', 'Server', 'Carlsbad Caverns Fast Food'),
    ('Brian Adams', '888-99-0002', 'Cashier', 'Carlsbad Caverns Fast Food'),
    ('Catherine Bell', '999-00-1113', 'Manager', 'Arches Fast Food'),
    ('Daniel Craig', '000-11-2224', 'Chef', 'Arches Fast Food'),
    ('Ella Fitzgerald', '111-22-3336', 'Server', 'Arches Fast Food'),
    ('Frank Sinatra', '222-33-4447', 'Cashier', 'Arches Fast Food'),
    ('Grace Kelly', '333-44-5558', 'Chef', 'Arches Fast Food'),
    ('Harry Styles', '444-55-6669', 'Server', 'Arches Fast Food'),
    ('Isabella Rossellini', '555-66-7780', 'Cashier', 'Arches Fast Food'),
    ('Jackie Chan', '666-77-8881', 'Manager', 'Zion Fast Food'),
    ('Kylie Jenner', '777-88-9992', 'Chef', 'Zion Fast Food'),
    ('Leonardo DiCaprio', '888-99-0003', 'Server', 'Zion Fast Food'),
    ('Meryl Streep', '999-00-1114', 'Cashier', 'Zion Fast Food'),
    ('Nicholas Cage', '000-11-2225', 'Chef', 'Zion Fast Food'),
    ('Oprah Winfrey', '111-22-3337', 'Server', 'Zion Fast Food'),
    ('Penelope Cruz', '222-33-4448', 'Cashier', 'Zion Fast Food'),
    ('Quincy Jones', '333-44-5559', 'Manager', 'Rocky Mountain Fast Food'),
    ('Robert Downey', '444-55-6670', 'Chef', 'Rocky Mountain Fast Food'),
    ('Sandra Bullock', '555-66-7781', 'Server', 'Rocky Mountain Fast Food'),
    ('Tom Hanks', '666-77-8882', 'Cashier', 'Rocky Mountain Fast Food'),
    ('Uma Thurman', '777-88-9993', 'Chef', 'Rocky Mountain Fast Food'),
    ('Vin Diesel', '888-99-0004', 'Server', 'Rocky Mountain Fast Food'),
    ('Will Smith', '999-00-1115', 'Cashier', 'Rocky Mountain Fast Food'),
    ('Xena Warrior', '000-11-2226', 'Manager', 'Redwood Fast Food'),
    ('Yoda Green', '111-22-3338', 'Chef', 'Redwood Fast Food'),
    ('Zelda Fitzgerald', '222-33-4449', 'Server', 'Redwood Fast Food'),
    ('Aaron Paul', '333-44-5560', 'Cashier', 'Redwood Fast Food'),
    ('Beth Harmon', '444-55-6671', 'Chef', 'Redwood Fast Food'),
    ('Chris Evans', '555-66-7782', 'Server', 'Redwood Fast Food'),
    ('Don Draper', '666-77-8883', 'Cashier', 'Redwood Fast Food'),
    ('Emma Watson', '777-88-9994', 'Manager', 'Redwood Fast Food');

`;

const scheduleSql = `
CREATE TABLE schedule (
    ssn VARCHAR(11),
    work_day VARCHAR(10),
    PRIMARY KEY (ssn, work_day),
    FOREIGN KEY (ssn) REFERENCES Employee(ssn)
);
CREATE INDEX idx_schedule_work_day ON schedule(work_day);
CREATE INDEX idx_schedule_ssn ON schedule(ssn);


INSERT INTO schedule (ssn, work_day) VALUES
    ('111-22-3333', 'Mon'),
    ('111-22-3333', 'Wed'),
    ('111-22-3333', 'Fri'),
    ('222-33-4444', 'Tue'),
    ('222-33-4444', 'Thu'),
    ('333-44-5555', 'Mon'),
    ('333-44-5555', 'Wed'),
    ('333-44-5555', 'Fri'),
    ('444-55-6666', 'Tue'),
    ('444-55-6666', 'Thu'),
    ('555-66-7777', 'Mon'),
    ('555-66-7777', 'Wed'),
    ('555-66-7777', 'Sat'),
    ('666-77-8888', 'Tue'),
    ('666-77-8888', 'Thu'),
    ('777-88-9999', 'Fri'),
    ('777-88-9999', 'Sat'),
    ('888-99-0000', 'Mon'),
    ('888-99-0000', 'Tue'),
    ('888-99-0000', 'Fri'),
    ('999-00-1111', 'Wed'),
    ('999-00-1111', 'Thu'),
    ('000-11-2222', 'Mon'),
    ('000-11-2222', 'Tue'),
    ('000-11-2222', 'Fri'),
    ('111-22-3334', 'Wed'),
    ('111-22-3334', 'Thu'),
    ('222-33-4445', 'Tue'),
    ('222-33-4445', 'Fri'),
    ('333-44-5556', 'Mon'),
    ('333-44-5556', 'Sat'),
    ('444-55-6667', 'Tue'),
    ('444-55-6667', 'Sun'),
    ('555-66-7778', 'Mon'),
    ('555-66-7778', 'Fri'),
    ('666-77-8889', 'Tue'),
    ('666-77-8889', 'Thu'),
    ('777-88-9990', 'Wed'),
    ('777-88-9990', 'Sat'),
    ('888-99-0001', 'Mon'),
    ('888-99-0001', 'Tue'),
    ('888-99-0001', 'Thu'),
    ('999-00-1112', 'Fri'),
    ('999-00-1112', 'Sat'),
    ('000-11-2223', 'Wed'),
    ('000-11-2223', 'Sun'),
    ('111-22-3335', 'Mon'),
    ('111-22-3335', 'Tue'),
    ('111-22-3335', 'Fri'),
    ('222-33-4446', 'Thu'),
    ('222-33-4446', 'Sat'),
    ('333-44-5557', 'Wed'),
    ('333-44-5557', 'Sun'),
    ('444-55-6668', 'Mon'),
    ('444-55-6668', 'Tue'),
    ('444-55-6668', 'Thu'),
    ('555-66-7779', 'Fri'),
    ('555-66-7779', 'Sat'),
    ('666-77-8880', 'Wed'),
    ('666-77-8880', 'Sun'),
    ('777-88-9991', 'Mon'),
    ('777-88-9991', 'Tue'),
    ('777-88-9991', 'Fri'),
    ('888-99-0002', 'Thu'),
    ('888-99-0002', 'Sat'),
    ('999-00-1113', 'Wed'),
    ('999-00-1113', 'Sun'),
    ('000-11-2224', 'Mon'),
    ('000-11-2224', 'Tue'),
    ('000-11-2224', 'Thu'),
    ('111-22-3336', 'Fri'),
    ('111-22-3336', 'Sat'),
    ('222-33-4447', 'Wed'),
    ('222-33-4447', 'Sun'),
    ('333-44-5558', 'Mon'),
    ('333-44-5558', 'Tue'),
    ('333-44-5558', 'Fri'),
    ('444-55-6669', 'Thu'),
    ('444-55-6669', 'Sat'),
    ('555-66-7780', 'Wed'),
    ('555-66-7780', 'Sun'),
    ('666-77-8881', 'Mon'),
    ('666-77-8881', 'Tue'),
    ('666-77-8881', 'Fri'),
    ('777-88-9992', 'Thu'),
    ('777-88-9992', 'Sat'),
    ('888-99-0003', 'Wed'),
    ('888-99-0003', 'Sun'),
    ('999-00-1114', 'Mon'),
    ('999-00-1114', 'Tue'),
    ('999-00-1114', 'Thu'),
    ('000-11-2225', 'Fri'),
    ('000-11-2225', 'Sat'),
    ('111-22-3337', 'Wed'),
    ('111-22-3337', 'Sun'),
    ('222-33-4448', 'Mon'),
    ('222-33-4448', 'Tue'),
    ('222-33-4448', 'Fri');
`;

const reviewSql = `
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(15) REFERENCES customers(phone),
    location_name VARCHAR(45) REFERENCES location(name),
    reviewdate DATE DEFAULT CURRENT_DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT
);
CREATE INDEX idx_review_customer_phone ON review(customer_phone);
CREATE INDEX idx_review_location_name ON review(location_name);
CREATE INDEX idx_review_rating ON review(rating);
CREATE INDEX idx_review_customer_phone_reviewdate ON review(customer_phone, reviewdate);


INSERT INTO review (customer_phone, location_name, reviewdate, rating, review_text) VALUES
    ('1234567890', 'Big Bend Fast Food', '2024-12-01', 4, 'Great service and delicious food. Will definitely come back.'),
    ('2345678901', 'Yosemite Fast Food', '2024-12-02', 5, 'Amazing experience! The food was fresh and the staff was friendly.'),
    ('3456789012', 'Guadalupe Mountains Fast Food', '2024-12-03', 3, 'Good food, but the wait time was a bit long.'),
    ('4567890123', 'Carlsbad Caverns Fast Food', '2024-12-01', 2, 'The food was average, and the atmosphere could be improved.'),
    ('5678901234', 'Arches Fast Food', '2024-12-05', 4, 'Fast service and tasty food. I would recommend the burgers!'),
    ('6789012345', 'Zion Fast Food', '2024-12-01', 1, 'Very disappointed. The food was cold, and the staff was not very helpful.'),
    ('7890123456', 'Rocky Mountain Fast Food', '2024-12-04', 5, 'Excellent food and beautiful setting. A great stop after hiking!'),
    ('8901234567', 'Redwood Fast Food', '2024-12-02', 3, 'The food was decent, but the portion size was small for the price.'),
    ('9012345678', 'Big Bend Fast Food', '2024-12-03', 4, 'Loved the atmosphere and the variety of food options.'),
    ('0123456789', 'Yosemite Fast Food', '2024-12-04', 5, 'Fantastic food and very clean. I had a great meal here!'),
    ('2345610987', 'Carlsbad Caverns Fast Food', '2024-12-01', 5, 'This place never disappoints. Great food every time I visit.'),
    ('3456721098', 'Arches Fast Food', '2024-12-03', 3, 'The food was good, but I was expecting a bit more from the reviews.'),
    ('4567832109', 'Zion Fast Food', '2024-12-04', 2, 'Not the best experience. The food was just okay, and the staff seemed tired.'),
    ('5678943210', 'Rocky Mountain Fast Food', '2024-12-02', 5, 'The best fast food experience I have had! Everything was perfect!'),
    ('6789054321', 'Redwood Fast Food', '2024-12-01', 4, 'Delicious food and great ambiance, would recommend it.'),
    ('7890165432', 'Big Bend Fast Food', '2024-12-05', 3, 'Nice food, but the service could have been faster.'),
    ('8901276543', 'Yosemite Fast Food', '2024-12-03', 5, 'The food was amazing! Definitely a must-visit if you are in the area.'),
    ('9012387654', 'Guadalupe Mountains Fast Food', '2024-12-02', 1, 'Very disappointed. The food was bland and cold.'),
    ('0123498765', 'Carlsbad Caverns Fast Food', '2024-12-04', 4, 'Good meal, but I expected a bit more variety on the menu.'),
    ('1233214567', 'Arches Fast Food', '2024-12-01', 2, 'The food was fine, but the wait was too long for the quality of food.'),
    ('2344325678', 'Zion Fast Food', '2024-12-05', 3, 'Decent food, but nothing special. Service was friendly.'),
    ('3455436789', 'Rocky Mountain Fast Food', '2024-12-03', 4, 'Great place to grab a quick meal after a hike. I liked the fries.'),
    ('4566547890', 'Redwood Fast Food', '2024-12-02', 5, 'Loved everything about this place. The food was fresh, and the staff was friendly.'),
    ('5677658901', 'Big Bend Fast Food', '2024-12-01', 1, 'The food was bad, and the customer service was worse.'),
    ('6788769012', 'Yosemite Fast Food', '2024-12-05', 3, 'Good food, but it was not as good as I expected.'),
    ('7899870123', 'Guadalupe Mountains Fast Food', '2024-12-04', 2, 'Not great food, but at least the service was friendly.'),
    ('8900981234', 'Carlsbad Caverns Fast Food', '2024-12-02', 5, 'Great meal and friendly service! Would definitely return.'),
    ('9012092345', 'Arches Fast Food', '2024-12-03', 4, 'Food was good, but not amazing. Still worth a stop for a quick bite.'),
    ('0123103456', 'Zion Fast Food', '2024-12-01', 2, 'Not impressed. The food did not live up to the hype.'),
    ('1234214567', 'Rocky Mountain Fast Food', '2024-12-05', 4, 'Food was tasty and the view was spectacular!'),
    ('2345325678', 'Redwood Fast Food', '2024-12-04', 1, 'Very poor quality. Would not recommend this location.'),
    ('3456436789', 'Big Bend Fast Food', '2024-12-02', 5, 'Great food and service. A perfect place for a meal on the go.'),
    ('4567547890', 'Yosemite Fast Food', '2024-12-01', 3, 'Decent food but a little expensive for fast food.'),
    ('5678658901', 'Guadalupe Mountains Fast Food', '2024-12-05', 4, 'Good meal, though the seating area could use a bit of cleaning.'),
    ('6789769012', 'Carlsbad Caverns Fast Food', '2024-12-03', 5, 'Everything was perfect – quick service and fresh food.'),
    ('7890870123', 'Arches Fast Food', '2024-12-04', 4, 'Good spot for a quick meal. The food was fresh and tasty.'),
    ('8901981234', 'Zion Fast Food', '2024-12-02', 5, 'Loved this place. Great food and even better service!'),
    ('9012092346', 'Rocky Mountain Fast Food', '2024-12-01', 3, 'Food was fine but did not stand out compared to other locations.'),
    ('0123203457', 'Redwood Fast Food', '2024-12-05', 2, 'Not great, but it was okay for a quick stop.'),
    ('1234314568', 'Big Bend Fast Food', '2024-12-03', 4, 'Good food with a great view of the park. Definitely worth a visit.'),
    ('2345425679', 'Yosemite Fast Food', '2024-12-01', 5, 'Best fast food I have had in a while. Very happy with the meal!'),
    ('3456536780', 'Guadalupe Mountains Fast Food', '2024-12-05', 1, 'Awful experience. The food was cold and tasteless.'),
    ('4567647891', 'Carlsbad Caverns Fast Food', '2024-12-02', 5, 'Delicious food and great atmosphere. A must-visit in the park.'),
    ('5678758902', 'Arches Fast Food', '2024-12-01', 4, 'Nice fast food, though a little crowded. Still a great option.'),
    ('6789869013', 'Zion Fast Food', '2024-12-03', 3, 'Food was decent but not worth the wait.'),
    ('7890970124', 'Rocky Mountain Fast Food', '2024-12-04', 4, 'Great food and service, would visit again.'),
    ('8901081235', 'Redwood Fast Food', '2024-12-01', 5, 'Perfect stop after a hike. Loved the food and service!');


`;

const displayAllTables = function() {
    customerTable.style.display = "block";
    cardTable.style.display = "block";
    billTable.style.display = "block";
    orderTable.style.display = "block";
    transactionTable.style.display = "block";
    locationTable.style.display = "block";
    menuTable.style.display = "block";
    overallTable.style.display = "block";
    employeeTable.style.display = "block";
    scheduleTable.style.display = "block";
    reviewTable.style.display = "block";
};

window.onload = async function() {
    await utilities.fetchMenu();
    await utilities.fetchCustomers();
    await utilities.fetchCards();
    await utilities.fetchLocation();
    await utilities.fetchBill();
    await utilities.fetchOrders();
    await utilities.fetchTransaction();
    await utilities.fetchEmployee();
    await utilities.fetchSchedule();
    await utilities.fetchReview();
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

createTableBtn.addEventListener("click", async() => {
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

        await createTable(employeeSql);
        await utilities.fetchEmployee();

        await createTable(scheduleSql);
        await utilities.fetchSchedule();

        await createTable(reviewSql);
        await utilities.fetchReview();

        await utilities.overallview();

        displayAllTables();
        createTableBtn.style.display = "none";
    }
    createTableBtn.style.display = "none";
});

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
addMenuBtn.addEventListener("click", async() => {
    await utilities.addMenu();
});
deleteMenuBtn.addEventListener("click", async() => {
    await utilities.deleteMenu();
});
statusMenuBtn.addEventListener("click", async() => {
    await utilities.setMenuStatus();
});
addCardBtn.addEventListener("click", async() => {
    await utilities.addCard();
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
deleteAllLocationBtn.addEventListener("click", async() => {
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
refreshBtn.addEventListener("click", async() => {
    try {
        await utilities.fetchMenu();
        await utilities.fetchCustomers();
        await utilities.fetchCards();
        await utilities.fetchLocation();
        await utilities.fetchBill();
        await utilities.fetchOrders();
        await utilities.fetchTransaction();
        await utilities.fetchEmployee();
        await utilities.fetchSchedule();
        await utilities.fetchReview();
        await utilities.overallview();

        // Display an alert at the end
        alert("Data refetched successfully!");
    } catch (error) {
        console.error("Error refetched data:", error);
        alert("An error occurred while refetching the data. Please try again.");
    }
});

window.addEventListener("DOMContentLoaded", () => {
    const defaultTab = document.querySelector(".dashboard-tab[data-target='paymentForm']");
    if (defaultTab) {
        defaultTab.click(); // Simulate a click on the "Bill" button
    }
});
