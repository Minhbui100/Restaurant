const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const config = require("./config.json");
const { log } = require("console");
const app = express();
const fs = require("fs");

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

// Helper function to log queries
const logQuery = (query) => {
    const logFilePath = path.join(__dirname, "queries.log");
    const logEntry = `${query}\n`;

    // Append the query to the log file
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error("Error logging query:", err);
        }
    });
};

// Helper function to log transaction details to a file
const logTransaction = (sql) => {
    const logFilePath = path.join(__dirname, "transactions.log");
    let logEntry = `${sql}\n`;
    if (sql === "COMMIT") {
        logEntry += "\n";
    }

    // Append the transaction details to the log file
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error("Error logging transaction:", err);
        }
    });
};
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "backendGUI")); // Serve backend.html for root URL
});

// Fetch data from PostgreSQL
app.get("/bill", async(req, res) => {
    try {
        const query = `select * from bill order by bill_id;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/orders", async(req, res) => {
    try {
        const query = `select * from orders;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/cards", async(req, res) => {
    try {
        const query = "SELECT * FROM cards order by name;";
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/customers", async(req, res) => {
    try {
        const query = "SELECT * FROM customers order by name;";
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/transaction", async(req, res) => {
    try {
        const query = "SELECT * FROM transaction;";
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/location", async(req, res) => {
    try {
        const query = `select * from location order by name;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get("/menu", async(req, res) => {
    try {
        const query = `select * from menu order by name;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//Minh
app.get("/employee", async(req, res) => {
    try {
        const query = `select * from employee order by location_name, name;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});
app.get("/schedule", async(req, res) => {
    try {
        const query = `select * from schedule order by ssn;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});
app.get("/review", async(req, res) => {
    try {
        const query = `select * from review order by reviewdate, location_name;`;
        logQuery(query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.post("/createtable", async(req, res) => {
    const sql = req.body.sql;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Log the start of the transaction
        logTransaction("BEGIN");

        // Execute the SQL statement
        const result = await client.query(sql);
        logTransaction(sql);

        await client.query("COMMIT");

        // Log the successful completion of the transaction
        logTransaction("COMMIT");

        res.status(200).json({ success: true, result });
    } catch (error) {
        await client.query("ROLLBACK");

        // Log the rollback in case of error
        logTransaction("ROLLBACK");

        console.error("Error creating table:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

app.post("/orders", async(req, res) => {
    const { orders } = req.body;

    if (!orders || orders.length === 0) {
        return res
            .status(400)
            .send("Please select at least one dish with a valid quantity.");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");
        let query = "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE";
        await client.query(query);
        logTransaction(query);
        // Insert a new bill and get its ID
        query =
            "INSERT INTO bill (bill_id) VALUES ((SELECT COALESCE(MAX(bill_id), 0) + 1 FROM bill)) RETURNING bill_id;";
        const billResult = await client.query(query);
        const billId = billResult.rows[0].bill_id;
        logTransaction(query);

        // Check availability and insert orders in a single query
        const orderValues = orders
            .map(({ name, quantity }) => `('${name}', ${quantity})`)
            .join(", ");
        const insertOrdersQuery = `
WITH valid_dishes AS (
  SELECT name, price, status
  FROM menu
  WHERE name IN (${orders.map(({ name }) => `
        '${name}'
        `).join(", ")})
),
checked_dishes AS (
  SELECT name, price
  FROM valid_dishes
  WHERE status = 'Available'
)
INSERT INTO orders (bill_id, name, price, quantity)
SELECT $1, checked_dishes.name, checked_dishes.price, orders_data.quantity
FROM checked_dishes
JOIN (VALUES ${orderValues}) AS orders_data(name, quantity)
ON checked_dishes.name = orders_data.name;
    `;
        await client.query(insertOrdersQuery, [billId]);
        logTransaction(insertOrdersQuery);

        // Update the bill total and tax
        const updateBillQuery = `
UPDATE bill
SET total = (
    SELECT COALESCE(SUM(price * quantity), 0)
    FROM orders
    WHERE bill_id = $1
),
tax = total * 0.0625
WHERE bill_id = $1;
    `;
        await client.query(updateBillQuery, [billId]);
        logTransaction(updateBillQuery);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        res.status(201).send(`${billId}`);
    } catch (error) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        if (error.code === "40001") {
            // Serialization failure, recommend retry
            res
                .status(500)
                .send("Transaction failed due to high contention. Please try again.");
        } else {
            console.error("Error processing orders:", error);
            res.status(500).send("An error occurred while processing your request.");
        }
    } finally {
        client.release();
    }
});

// Delete order
app.delete("/orders/:id", async(req, res) => {
    const { id } = req.params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        let query = "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE";
        await client.query(query);
        logTransaction(query);

        // Step 1: Check if the order exists and retrieve its bill_id
        query = "SELECT bill_id FROM orders WHERE id = $1 FOR UPDATE";
        logTransaction(query);
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");
            return res.status(404).json({ error: "Order not found" });
        }

        const billId = result.rows[0].bill_id;

        // Step 2: Check if the bill is already paid
        query = "SELECT paid FROM bill WHERE bill_id = $1 FOR UPDATE";
        logTransaction(query);
        const result1 = await client.query(query, [billId]);

        if (result1.rows.length > 0 && result1.rows[0].paid === true) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");
            return res.status(400).send("Warning: The bill ID is already paid");
        }

        // Step 3: Delete the order
        query = "DELETE FROM orders WHERE id = $1";
        logTransaction(query);
        await client.query(query, [id]);

        // Step 4: Update the total and tax in the `bill` table
        query = `
      UPDATE bill
      SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM orders WHERE bill_id = $1),
          tax = total * 0.0825
      WHERE bill_id = $1
    `;
        logTransaction(query);
        await client.query(query, [billId]);

        // Step 5: Check if there are any remaining orders for the bill
        query = "SELECT 1 FROM orders WHERE bill_id = $1";
        logTransaction(query);
        const orderCheck = await client.query(query, [billId]);

        // Step 6: If no orders remain, delete the bill
        if (orderCheck.rowCount === 0) {
            query = "DELETE FROM bill WHERE bill_id = $1";
            logTransaction(query);
            await client.query(query, [billId]);
        }

        await client.query("COMMIT");
        logTransaction("COMMIT");
        res.sendStatus(200);
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        if (err.code === "40001") {
            // Serialization failure
            console.warn("Serialization failure, recommend retry:", err.message);
            res.status(503).send("Temporary failure, please retry.");
        } else {
            console.error("Error deleting order:", err.message);
            res.status(500).send("An error occurred while deleting the order.");
        }
    } finally {
        client.release();
    }
});

//Payment
app.put("/bill/:bill_id", async(req, res) => {
    const { bill_id } = req.params;
    const { customerPhone, locationName, tip, cardId } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
        logTransaction("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

        const query = `
WITH bill_data AS (
  SELECT 
    total, tax, paid
  FROM bill
  WHERE bill_id = $1
  FOR UPDATE
),
updated_bill AS (
  UPDATE bill
  SET 
    cust_phone = $2,
    tip = $3,
    card_id = $4,
    paid = TRUE,
    location_name = $5,
    tax=total*0.065
  WHERE bill_id = $1
  RETURNING (total + $3 + total*0.065) AS total_amount
),

increment_points AS (
  UPDATE customers
  SET membership_point = membership_point + 1
  WHERE phone = $2
),
current_balance AS (
  SELECT 
    COALESCE(
      (SELECT business_balance FROM transaction ORDER BY tran_id DESC LIMIT 1), 
      5000.0
    ) AS current_balance
),
new_transaction AS (
  INSERT INTO transaction (total, from_bankacct, business_balance)
  SELECT 
    ub.total_amount, 
    $4, 
    cb.current_balance + ub.total_amount
  FROM updated_bill ub, current_balance cb
  RETURNING business_balance
)
SELECT business_balance FROM new_transaction;
    `;

        logTransaction(query); // Log the entire query

        const result = await client.query(query, [
            bill_id,
            customerPhone,
            tip,
            cardId,
            locationName,
        ]);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        const newBalance = result.rows[0].business_balance;
        res.status(200).send(`Payment successful.`);
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        if (err.code === "40001") {
            console.warn("Serialization failure, retrying:", err.message);
            res.status(503).send("Temporary failure, please retry.");
        } else {
            console.error("Error processing the payment:", err.message);
            res.status(500).send("An error occurred while processing the payment.");
        }
    } finally {
        client.release();
    }
});

// Add customer
app.post("/customers", async(req, res) => {
    const { name, phone } = req.body;

    // Validate input
    if (!name || !phone) {
        return res.status(400).send("Name and phone are required.");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Check if the customer already exists
        const queryCheck = "SELECT * FROM customers WHERE phone = $1 FOR UPDATE";
        logTransaction(queryCheck);
        const customerCheck = await client.query(queryCheck, [phone]);

        if (customerCheck.rowCount > 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");

            return res.status(200).json({
                message: "Customer already exists.",
                customer: customerCheck.rows[0],
            });
        }

        // Insert the new customer
        const queryInsert = "INSERT INTO customers (name, phone) VALUES ($1, $2)";
        logTransaction(queryInsert);
        await client.query(queryInsert, [name, phone]);

        // Retrieve the newly inserted customer
        const querySelect = "SELECT * FROM customers WHERE phone = $1";
        logTransaction(querySelect);
        const newCustomer = await client.query(querySelect, [phone]);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        res.status(201).json({
            message: "Customer added successfully.",
            customer: newCustomer.rows[0],
        });
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        // Handle unique constraint violation
        if (err.code === "23505") {
            return res.status(409).json({
                message: "A customer with this phone number already exists.",
            });
        }

        console.error("Error handling customers:", err.message);
        res.sendStatus(500); // Internal server error
    } finally {
        client.release();
    }
});

//delete customer
// Delete customer
app.delete("/customers/:phone", async(req, res) => {
    const { phone } = req.params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Check if the customer exists and lock the row
        const queryCheck =
            "SELECT phone FROM customers WHERE phone = $1 FOR UPDATE";
        logTransaction(queryCheck);
        const result = await client.query(queryCheck, [phone]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");
            return res.status(404).json({ error: "Customer not found" });
        }

        // Step 2: Delete the customer
        const queryDelete = "DELETE FROM customers WHERE phone = $1";
        logTransaction(queryDelete);
        await client.query(queryDelete, [phone]);

        await client.query("COMMIT");
        logTransaction("COMMIT");
        res.sendStatus(200); // Successfully deleted
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error deleting customer:", err.message);
        res
            .status(500)
            .json({ error: "An error occurred while deleting the customer." });
    } finally {
        client.release();
    }
});

//add menu
app.post("/menu", async(req, res) => {
    const { name, price, image } = req.body;

    // Validate input
    if (!name || !price) {
        return res.status(400).send("Name, price, and image URL are required");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Check if the menu item already exists
        const queryCheck = "SELECT 1 FROM menu WHERE name = $1 FOR UPDATE";
        logTransaction(queryCheck);
        const menuCheck = await client.query(queryCheck, [name]);

        if (menuCheck.rowCount > 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");

            return res
                .status(409)
                .json({ message: "This dish name is already used." });
        }

        // Insert the new menu item
        const queryInsert =
            "INSERT INTO menu (name, price, image, status) VALUES ($1, $2, $3, 'Available')";
        logTransaction(queryInsert);
        await client.query(queryInsert, [name, price, image]);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        res.sendStatus(201); // Successfully created
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        // Handle unique constraint violation
        if (err.code === "23505") {
            return res.status(409).json({
                message: "This dish name is already used.",
            });
        }

        console.error("Error adding menu item:", err.message);
        res.status(500).send("An error occurred while adding the menu item.");
    } finally {
        client.release();
    }
});

//delete menu
app.delete("/menu/:name", async(req, res) => {
    const { name } = req.params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Check if the menu item exists and lock the row
        const queryCheck = "SELECT name FROM menu WHERE name = $1 FOR UPDATE";
        logTransaction(queryCheck);
        const result = await client.query(queryCheck, [name]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");

            return res.status(404).json({ error: "Menu item not found" });
        }

        // Step 2: Delete the menu item
        const queryDelete = "DELETE FROM menu WHERE name = $1";
        logTransaction(queryDelete);
        await client.query(queryDelete, [name]);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        res.sendStatus(200); // Successfully deleted
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error deleting menu item:", err.message);
        res
            .status(500)
            .json({ error: "An error occurred while deleting the menu item." });
    } finally {
        client.release();
    }
});

// Change menu status
app.put("/menu/status/:name", async(req, res) => {
    const { name } = req.params;
    const { status } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Check if the menu item exists
        const queryCheck = "SELECT status FROM menu WHERE name = $1";
        logTransaction(queryCheck);
        const menuItem = await client.query(queryCheck, [name]);
        if (menuItem.rowCount === 0) {
            await client.query("ROLLBACK");
            logTransaction("ROLLBACK");
            return res.status(400).send("Menu item not found.");
        }

        // Step 2: Update the menu item status
        const queryUpdate = "UPDATE menu SET status = $1 WHERE name = $2";
        logTransaction(queryUpdate);
        await client.query(queryUpdate, [status, name]);

        await client.query("COMMIT");
        logTransaction("COMMIT");

        res.sendStatus(200); // Successfully updated
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error updating menu status:", err.message);
        res.status(500).send("An error occurred while updating the menu status.");
    } finally {
        client.release();
    }
});

//add card
app.post("/cards", async(req, res) => {
    const { id, name, ex_date, spend } = req.body;

    // Validate input
    if (!id || !name || !ex_date || !spend) {
        return res
            .status(400)
            .json({ success: false, message: "All fields are required." });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Check if the card exists and lock the row
        const queryCheck = "SELECT * FROM cards WHERE id = $1 FOR UPDATE";
        logTransaction(queryCheck);
        const existingCardResult = await client.query(queryCheck, [id]);

        let newBalance;

        if (id.startsWith("cash")) {
            if (existingCardResult.rowCount === 0) {
                // If card doesn't exist and starts with "cash", add it with balance "0"
                const queryInsert =
                    "INSERT INTO cards (id, name, ex_date, balance) VALUES ($1, $2, $3, $4)";
                logTransaction(queryInsert);
                await client.query(queryInsert, [id, name, ex_date, 0]);
                newBalance = 0;
                res.status(200).json({
                    success: true,
                    message: "Card with 'cash' ID added with balance '0'.",
                });
            } else {
                // If card exists and starts with "cash", don't modify balance
                newBalance = existingCardResult.rows[0].balance;
                res.status(200).json({
                    success: true,
                    message: "Card with 'cash' ID already exists. Balance not updated.",
                });
            }
        } else {
            if (existingCardResult.rowCount > 0) {
                // If card exists, subtract the spend from the current balance
                const currentBalance = existingCardResult.rows[0].balance;
                newBalance = currentBalance - spend;

                // Ensure balance does not go below 0
                if (newBalance < 0) {
                    await client.query("ROLLBACK");
                    logTransaction("ROLLBACK");
                    return res.status(400).json({
                        success: false,
                        message: "Insufficient balance to complete the transaction.",
                    });
                }

                // Update the balance for the existing card
                const queryUpdate = "UPDATE cards SET balance = $1 WHERE id = $2";
                logTransaction(queryUpdate);
                await client.query(queryUpdate, [newBalance, id]);
            } else {
                // If card doesn't exist, create a new card with a default balance of 1000
                newBalance = 1000 - spend;
                const queryInsertNew =
                    "INSERT INTO cards (id, name, ex_date, balance) VALUES ($1, $2, $3, $4)";
                logTransaction(queryInsertNew);
                await client.query(queryInsertNew, [id, name, ex_date, newBalance]);
            }
            res.status(200).json({ success: true, newBalance });
        }

        await client.query("COMMIT");
        logTransaction("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error processing card transaction:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

//delete all customer
app.delete("/customers", async(req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Lock all customers (if necessary)
        const lockQuery = "SELECT 1 FROM customers FOR UPDATE";
        logTransaction(lockQuery);
        await client.query(lockQuery);

        // Step 2: Delete all customers
        const deleteQuery = "DELETE FROM customers";
        logTransaction(deleteQuery);
        await client.query(deleteQuery);

        await client.query("COMMIT");
        logTransaction("COMMIT");
        res.sendStatus(200); // Successfully deleted
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error deleting rows from customer table:", err.message);
        res.status(500).json({ error: err.message }); // Internal server error
    } finally {
        client.release();
    }
});

//delete all bill
app.delete("/bill", async(req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        logTransaction("BEGIN");

        // Step 1: Lock the rows in the bill table (if needed)
        const lockQuery = "SELECT 1 FROM bill FOR UPDATE";
        logTransaction(lockQuery);
        await client.query(lockQuery);

        // Step 2: Delete all records from the bill table
        const deleteQuery = "DELETE FROM bill";
        logTransaction(deleteQuery);
        await client.query(deleteQuery);

        // Step 3: Commit the transaction
        await client.query("COMMIT");
        logTransaction("COMMIT");
        res.sendStatus(200); // Successfully deleted
    } catch (err) {
        await client.query("ROLLBACK");
        logTransaction("ROLLBACK");

        console.error("Error deleting rows from bill table:", err.message);
        res.status(500).json({ error: err.message }); // Return detailed error
    } finally {
        client.release();
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

app.get("/overallview", async(req, res) => {
    try {
        // Query to calculate total bills, total business balance, and number of locations
        let query = `
WITH total_balance AS (
  SELECT 
    COALESCE(MAX(business_balance) - 5000.00, 0) AS business_balance
  FROM transaction
)
SELECT 
  (SELECT COUNT(*) FROM bill) AS num_bills,
  tb.business_balance,
  (SELECT COUNT(*) FROM location) AS num_locations
FROM total_balance tb;
`;
        const result = await pool.query(query);
        logQuery(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching overall view:", err.message);
        res.sendStatus(500);
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000 - localhost:3000 ");
});
