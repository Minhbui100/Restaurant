const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const config = require("./config.json");
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "Restaurant")));

/*
const pool = new Pool({
    user: 'aayushgupta',
    host: 'localhost',
    database: 'school',
    password: '2126',
    port: 5432,
});
*/

const pool = new Pool({
    user: config.user,
    host: "localhost",
    database: "restaurant",
    password: config.password,
    port: config.port,
});

console.log(pool);

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Tables Data</title>
    <style>
        caption {
                  font-size: 1.5em; /* Make the table name larger */
                  font-weight: bold;
                  margin: 10px 0;
                  text-align: left;
              }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>

<h1>All Tables Data</h1>

<div id="tables-container">
    <!-- Tables will be inserted here by JavaScript -->
</div>

<script>
// Function to fetch and display data for each table
async function fetchDataAndDisplay(tableName) {
    const response = await fetch('/' + tableName);
    const data = await response.json();

    // Create table element
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    table.appendChild(caption);

    // Generate table headers based on object keys
    if (data.length > 0) {
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Populate table rows with data
        data.forEach(row => {
            const rowElement = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                rowElement.appendChild(td);
            });
            table.appendChild(rowElement);
        });
    } else {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 5;
        noDataCell.textContent = 'No data available';
        noDataRow.appendChild(noDataCell);
        table.appendChild(noDataRow);
    }

    document.getElementById('tables-container').appendChild(table);
}

// List of tables to display
const tables = ['bill', 'orders', 'cards', 'customers', 'location', 'transaction'];

// Fetch and display data for each table
tables.forEach(fetchDataAndDisplay);

</script>
</body>
</html>
`);
});

// Fetch data from PostgreSQL
app.get("/bill", async(req, res) => {
    try {
        await pool.query(`
            WITH numbered_bill AS (
                SELECT 
                    c.*,
                    ROW_NUMBER() OVER (ORDER BY c.bill_id) AS new_id
                FROM 
                    bill c
            )
            UPDATE bill
            SET bill_id = new_id
            FROM numbered_bill
            WHERE bill.bill_id = numbered_bill.bill_id;
        `);

        const result = await pool.query(`select * from bill`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/orders", async(req, res) => {
    try {
        await pool.query(`
            WITH numbered_order AS (
                SELECT 
                    c.*,
                    ROW_NUMBER() OVER (ORDER BY c.id) AS new_id
                FROM 
                    orders c
            )
            UPDATE orders
            SET id = new_id
            FROM numbered_order
            WHERE orders.id = numbered_order.id;
        `);

        const result = await pool.query(`select * from orders`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/cards", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cards");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/customers", async(req, res) => {
    try {
        await pool.query(`
            WITH numbered_customer AS (
                SELECT 
                    c.*,
                    ROW_NUMBER() OVER (ORDER BY c.id) AS new_id
                FROM 
                    customers c
            )
            UPDATE customers
            SET id = new_id
            FROM numbered_customer
            WHERE customers.id = numbered_customer.id;
        `);

        const result = await pool.query("SELECT * FROM customers");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/transaction", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM transaction");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.post("/orders", async(req, res) => {
    const { id, name, price, quantity } = req.body;

    // Check if both id and name are provided
    if (!id || !name || !price || !quantity) {
        return res.status(400).send("ID, name, price and quantiry are required");
    }

    try {
        const result = await pool.query(
            "SELECT paid FROM bill WHERE bill_id = $1", [id]
        );

        // If the bill is already paid, send a response and exit the function
        if (result.rows.length > 0 && result.rows[0].paid === true) {
            return res.status(400).send("Warning: The bill ID is already paid");
        }

        const billCheck = await pool.query(
            "SELECT 1 FROM Bill WHERE bill_id = $1", [id]
        );
        if (billCheck.rowCount === 0) {
            await pool.query(
                "INSERT INTO Bill (bill_id) VALUES ($1)", [id] // Default values for total and tax
            );
        }
        await pool.query(
            "INSERT INTO orders (bill_id, name, price, quantity) VALUES ($1, $2, $3, $4)", [id, name, price, quantity]
        );
        await pool.query(
            "UPDATE Bill SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM Orders WHERE Orders.bill_id = Bill.bill_id);"
        );
        await pool.query("UPDATE Bill SET tax = total * 0.0825;");
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.post("/createtable", async(req, res) => {
    const sql = req.body.sql;
    try {
        const result = await pool.query(sql);
        res.status(200).json({ success: true, result: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        console.log("here1", error.message);
    }
});

app.delete("/orders/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT bill_id FROM Orders WHERE id = $1", [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        const orderId = result.rows[0].bill_id;

        const result1 = await pool.query(
            "SELECT paid FROM bill WHERE bill_id = $1", [orderId]
        );
        if (result1.rows.length > 0 && result1.rows[0].paid === true) {
            return res.status(400).send("Warning: The bill ID is already paid");
        }

        await pool.query("DELETE FROM orders WHERE id = $1", [id]);
        await pool.query(
            "UPDATE Bill SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM Orders WHERE Orders.bill_id = Bill.bill_id);"
        );
        await pool.query(`UPDATE Bill SET tax = total * 0.0825`);
        // Step 4: Check if there are any remaining orders with this order_id
        const orderCheck = await pool.query(
            "SELECT 1 FROM Orders WHERE bill_id = $1", [orderId]
        );
        if (orderCheck.rowCount === 0) {
            // Step 5: Delete the Bill record if no more orders exist for this order_id
            await pool.query("DELETE FROM Bill WHERE bill_id = $1", [orderId]);
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//add customer
app.post("/customers", async(req, res) => {
    const { name, phone } = req.body;

    // Check if both id and name are provided
    if (!name || !phone) {
        return res.status(400).send("Name and phone are required");
    }

    try {
        const billCheck = await pool.query(
            "SELECT 1 FROM customers WHERE phone = $1", [phone]
        );
        if (billCheck.rowCount === 1) {
            return res.status(400).send("This phone number is already used");
        }
        await pool.query("INSERT INTO customers (name, phone) VALUES ($1, $2)", [
            name,
            phone,
        ]);
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//delete customer
app.delete("/customers/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id FROM customers WHERE id = $1", [
            id,
        ]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "ID not found" });
        }

        await pool.query("DELETE FROM customers WHERE id = $1", [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//transaction
app.put("/bill/:bill_id", async(req, res) => {
    const { bill_id } = req.params;
    const { customerId, tip, cardId } = req.body;

    try {
        // Retrieve the current bill details including total, tip, and tax
        const billResult = await pool.query(
            "SELECT total, tip, tax, paid FROM bill WHERE bill_id = $1", [bill_id]
        );

        // If the bill does not exist, send an error
        if (billResult.rowCount === 0) {
            return res.status(404).send("Bill not found");
        }

        const billData = billResult.rows[0];

        // Check if the bill is already paid
        if (billData.paid) {
            return res.status(400).send("Warning: The bill ID is already paid");
        }

        // Update the bill to mark it as paid
        await pool.query(
            "UPDATE bill SET cust_id = $1, tip=$2, card_id = $3, paid = TRUE WHERE bill_id = $4", [customerId, tip, cardId, bill_id]
        );

        // Calculate the total amount to deduct from the card balance
        const formattedTotalAmount =
            parseFloat(billData.total) + parseFloat(tip) + parseFloat(billData.tax);
        const totalAmount = parseFloat(formattedTotalAmount.toFixed(2));

        // Update the customer's membership points
        await pool.query(
            "UPDATE customers SET membership_point = membership_point + 1 WHERE id = $1", [customerId]
        );

        // Deduct the total amount from the card balance
        await pool.query("UPDATE cards SET balance = balance - $1 WHERE id = $2", [
            totalAmount,
            cardId,
        ]);

        const businessBalanceResult = await pool.query(
            "SELECT business_balance FROM transaction ORDER BY id DESC LIMIT 1"
        );

        const currentBusinessBalance =
            businessBalanceResult.rowCount > 0 ?
            businessBalanceResult.rows[0].business_balance :
            5000.0; // Set to default if no transactions

        // Calculate the new business balance
        const x = parseFloat(currentBusinessBalance) + parseFloat(totalAmount);
        const newcurrentBusinessBalance = parseFloat(x.toFixed(2));
        console.log(currentBusinessBalance, totalAmount, newcurrentBusinessBalance);

        // Insert the transaction record
        await pool.query(
            `INSERT INTO transaction (bill_id, total, from_bankacct, business_balance) 
             VALUES ($1, $2, $3, $4)`, [bill_id, formattedTotalAmount, cardId, newcurrentBusinessBalance]
        );

        res.sendStatus(200);
    } catch (err) {
        console.error("Error processing the request:", err.message);
        res.sendStatus(500);
    }
});

app.delete("/customers", async(req, res) => {
    try {
        const result = await pool.query("DELETE FROM customers");

        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message }); // Internal server error
    }
});

app.delete("/bill", async(req, res) => {
    try {
        await pool.query("DELETE FROM bill;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from bill table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

app.delete("/orders", async(req, res) => {
    try {
        const result = await pool.query(
            "SELECT 1 FROM bill WHERE paid = true LIMIT 1"
        );

        if (result.rowCount > 0) {
            // If there are any paid bills, return a warning
            return res
                .status(500)
                .json({ error: "Cannot delete orders because there are paid bills." });
        }

        await pool.query("DELETE FROM orders;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from orders table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

app.delete("/cards", async(req, res) => {
    try {
        await pool.query("DELETE FROM cards;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from cards table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

app.delete("/transaction", async(req, res) => {
    try {
        await pool.query("DELETE FROM transaction;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from transaction table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

/*

// Update student name by ID
app.put('/students/:id', async(req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await pool.query('UPDATE students SET name = $1 WHERE id = $2', [name, id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Add a new student
app.post('/students', async(req, res) => {
    const { id, name } = req.body;

    // Check if both id and name are provided
    if (!id || !name) {
        return res.status(400).json({ error: "ID and name are required" });
    }

    try {
        await pool.query('INSERT INTO students (id, name) VALUES ($1, $2)', [id, name]);
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Delete a student by ID
app.delete('/students/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM students WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});
*/
// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000 - localhost:3000 ");
});
