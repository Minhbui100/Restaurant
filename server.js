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
app.use(express.static("backend"));

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "backendGUI")); // Serve backend.html for root URL
});

// Fetch data from PostgreSQL
app.get("/bill", async(req, res) => {
    try {
        const result = await pool.query(`select * from bill order by bill_id;`);
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

        const result = await pool.query(`select * from orders;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/cards", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cards order by name;");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/customers", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM customers order by name;");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/transaction", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM transaction;");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/location", async(req, res) => {
    try {
        const result = await pool.query(`select * from location order by name;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/menu", async(req, res) => {
    try {
        const result = await pool.query(`select * from menu order by name;`);
        res.json(result.rows);
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

//add order
app.post("/orders", async(req, res) => {
    const { orders } = req.body;

    if (!orders || orders.length === 0) {
        return res.status(400).send("Please select at least one dish with a valid quantity");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insert a new bill and get its ID
        const billResult = await client.query(
            "INSERT INTO bill (bill_id) VALUES ((SELECT COALESCE(MAX(bill_id), 0) + 1 FROM bill)) RETURNING bill_id;"
        );
        const billId = billResult.rows[0].bill_id;

        // Check if all dishes are available before inserting orders
        for (const { name }
            of orders) {
            const statusResult = await client.query(
                "SELECT status FROM menu WHERE name = $1", [name]
            );

            if (statusResult.rows.length === 0) {
                // Dish not found in the menu
                return res.status(400).send(`The dish "${name}" does not exist in the menu.`);
            }

            if (statusResult.rows[0].status === 'Out of Stock') {
                // Dish is not available
                return res.status(400).send(`The dish "${name}" is out of stock.`);
            }
        }

        // Insert all orders
        const orderValues = orders.map(({ name, quantity }) => `('${billId}', '${name}', (SELECT price FROM menu WHERE name = '${name}'), ${quantity})`);
        const insertOrdersQuery = `
            INSERT INTO orders (bill_id, name, price, quantity)
            VALUES ${orderValues.join(", ")}
        `;
        await client.query(insertOrdersQuery);

        // Update total and tax for the new bill
        await client.query(`
            UPDATE bill
            SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM orders WHERE bill_id = $1),
                tax = total * 0.0625
            WHERE bill_id = $1;
        `, [billId]);

        await client.query("UPDATE bill SET tax = total * 0.0625;");

        await client.query("COMMIT");
        res.status(201).send("Orders successfully added.");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error processing orders:", error);
        res.status(500).send("An error occurred while processing your request.");
    } finally {
        client.release();
    }
});

//delete order
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
        await pool.query(`
                                UPDATE Bill SET tax = total * 0.0825 `);
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

//Payment
app.put("/bill/:bill_id", async(req, res) => {
    const { bill_id } = req.params;
    const { customerPhone, locationName, tip, cardId } = req.body;
    console.log(locationName)
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
            "UPDATE bill SET cust_phone = $1, tip=$2, card_id = $3, paid = TRUE, location_name=$4 WHERE bill_id = $5", [customerPhone, tip, cardId, locationName, bill_id]
        );

        // Calculate the total amount to deduct from the card balance
        const formattedTotalAmount =
            parseFloat(billData.total) + parseFloat(tip) + parseFloat(billData.tax);
        const totalAmount = parseFloat(formattedTotalAmount.toFixed(2));

        // Update the customer's membership points
        await pool.query(
            "UPDATE customers SET membership_point = membership_point + 1 WHERE phone = $1", [customerPhone]
        );

        // Deduct the total amount from the card balance
        if (cardId != "cash")
            await pool.query(
                "UPDATE cards SET balance = balance - $1 WHERE id = $2", [totalAmount, cardId]
            );

        const businessBalanceResult = await pool.query(
            "SELECT business_balance FROM transaction ORDER BY tran_id DESC LIMIT 1"
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
            `
                                INSERT INTO transaction(total, from_bankacct, business_balance) VALUES($1, $2, $3)
                                `, [formattedTotalAmount, cardId, newcurrentBusinessBalance]
        );

        res.sendStatus(200);
    } catch (err) {
        console.error("Error processing the request:", err.message);
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
            return res.status(400).send("This phone number is already used.");
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
app.delete("/customers/:phone", async(req, res) => {
    const { phone } = req.params;
    try {
        const result = await pool.query(
            "SELECT phone FROM customers WHERE phone = $1", [phone]
        );
        if (result.rowCount === 0) {
            return res.sendStatus(400);
        }
        await pool.query("DELETE FROM customers WHERE phone = $1", [phone]);
        res.sendStatus(201); // Successfully
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//add menu
app.post("/menu", async(req, res) => {
    const { name, price, image } = req.body;
    // Check if both id and name are provided
    if (!name || !price) {
        return res.status(400).send("Name, price, and image URL are required");
    }
    try {
        const billCheck = await pool.query(
            "SELECT 1 FROM menu WHERE name = $1", [name]
        );
        if (billCheck.rowCount === 1) {
            return res.status(400).send("This dish name is already used.");
        }
        await pool.query("INSERT INTO menu (name, price, image, status) VALUES ($1, $2, $3, 'Available')", [
            name,
            price,
            image
        ]);
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//delete menu
app.delete("/menu/:name", async(req, res) => {
    const { name } = req.params;
    try {
        const result = await pool.query(
            "SELECT name FROM menu WHERE name = $1", [name]
        );
        if (result.rowCount === 0) {
            return res.sendStatus(400);
        }
        await pool.query("DELETE FROM menu WHERE name = $1", [name]);
        res.sendStatus(201); // Successfully
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//change status in menu
app.put("/menu/status/:name", async(req, res) => {
    const { name } = req.params;
    const { status } = req.body;

    try {
        // Check if the menu item exists
        const menuItem = await pool.query("SELECT status FROM menu WHERE name = $1", [name]);
        if (menuItem.rowCount === 0) {
            return res.status(400).send("Menu item not found.");
        }


        await pool.query("UPDATE menu SET status = $1 WHERE name = $2", [status, name]);
        res.sendStatus(200); // Successfully updated
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500); // Internal server error
    }
});

//add card
app.post("/cards", async(req, res) => {
    const { id, name, date, balance } = req.body;
    // Check if both id and name are provided
    if (!name || !date || !id || !balance) {
        return res.status(400).send("ID, name, ex-date, and current balance are required");
    }
    try {
        const billCheck = await pool.query(
            "SELECT 1 FROM cards WHERE id = $1", [id]
        );
        if (billCheck.rowCount === 1) {
            return res.status(400).send("This card number already exists.");
        }
        await pool.query("INSERT INTO cards (id, name, ex_date, balance) VALUES ($1, $2, $3, $4)", [
            id,
            name,
            date,
            balance
        ]);
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//delete all customer
app.delete("/customers", async(req, res) => {
    try {
        const result = await pool.query("delete from customers;");

        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from customer table:", err.message);
        res.status(500).json({ error: err.message }); // Internal server error
    }
});

//delete all bill
app.delete("/bill", async(req, res) => {
    try {
        await pool.query("delete from bill;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from bill table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

//delete all order
app.delete("/orders", async(req, res) => {
    try {
        await pool.query("delete from orders;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from order table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

//delete all card
app.delete("/cards", async(req, res) => {
    try {
        await pool.query("delete from cards;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from card table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

//delete all transaction
app.delete("/transaction", async(req, res) => {
    try {
        await pool.query("delete from transaction;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from transaction table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

//delete all location
app.delete("/location", async(req, res) => {
    try {
        await pool.query("delete from location;");
        res.sendStatus(200); // Send OK response
    } catch (err) {
        console.error("Error deleting rows from location table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000 - localhost:3000 ");
});
