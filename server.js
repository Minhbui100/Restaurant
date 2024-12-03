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
app.get("/bill", async (req, res) => {
  try {
    const result = await pool.query(`select * from bill order by bill_id;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/orders", async (req, res) => {
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

app.get("/cards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cards order by name;");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers order by name;");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/transaction", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transaction;");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/location", async (req, res) => {
  try {
    const result = await pool.query(`select * from location order by name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

app.get("/menu", async (req, res) => {
  try {
    const result = await pool.query(`select * from menu order by name;`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

//Minh
app.get("/employee", async(req, res) => {
    try {
        const result = await pool.query(`select * from employee order by location_name, name;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});
app.get("/schedule", async(req, res) => {
    try {
        const result = await pool.query(`select * from schedule order by ssn;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});
app.get("/review", async(req, res) => {
    try {
        const result = await pool.query(`select * from review order by reviewdate, location_name;`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.post("/createtable", async (req, res) => {
  const sql = req.body.sql;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Execute the SQL statement
    const result = await client.query(sql);

    await client.query("COMMIT");
    res.status(200).json({ success: true, result });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating table:", error.message);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

//add order
app.post("/orders", async (req, res) => {
  const { orders } = req.body;

  if (!orders || orders.length === 0) {
    return res
      .status(400)
      .send("Please select at least one dish with a valid quantity");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // Insert a new bill and get its ID
    const billResult = await client.query(
      "INSERT INTO bill (bill_id) VALUES ((SELECT COALESCE(MAX(bill_id), 0) + 1 FROM bill)) RETURNING bill_id;"
    );
    const billId = billResult.rows[0].bill_id;

    // Check availability of all dishes
    for (const { name } of orders) {
      const statusResult = await client.query(
        "SELECT status FROM menu WHERE name = $1 FOR UPDATE",
        [name]
      );

      if (statusResult.rows.length === 0) {
        return res
          .status(400)
          .send(`The dish "${name}" does not exist in the menu.`);
      }

      if (statusResult.rows[0].status === "Out of Stock") {
        return res.status(400).send(`The dish "${name}" is out of stock.`);
      }
    }

    // Insert all orders
    const orderValues = orders.map(
      ({ name, quantity }) =>
        `('${billId}', '${name}', (SELECT price FROM menu WHERE name = '${name}'), ${quantity})`
    );
    const insertOrdersQuery = `
              INSERT INTO orders (bill_id, name, price, quantity)
              VALUES ${orderValues.join(", ")}
          `;
    await client.query(insertOrdersQuery);

    // Update the bill total and tax
    await client.query(
      `UPDATE bill
           SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM orders WHERE bill_id = $1),
               tax = total * 0.0625
           WHERE bill_id = $1;`,
      [billId]
    );

    await client.query("COMMIT");
    res.status(201).send(`${billId}`);
  } catch (error) {
    await client.query("ROLLBACK");
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

//delete order
app.delete("/orders/:id", async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // Step 1: Check if the order exists and retrieve its bill_id
    const result = await client.query(
      "SELECT bill_id FROM orders WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    const billId = result.rows[0].bill_id;

    // Step 2: Check if the bill is already paid
    const result1 = await client.query(
      "SELECT paid FROM bill WHERE bill_id = $1 FOR UPDATE",
      [billId]
    );

    if (result1.rows.length > 0 && result1.rows[0].paid === true) {
      await client.query("ROLLBACK");
      return res.status(400).send("Warning: The bill ID is already paid");
    }

    // Step 3: Delete the order
    await client.query("DELETE FROM orders WHERE id = $1", [id]);

    // Step 4: Update the total and tax in the `bill` table
    await client.query(
      `UPDATE bill
           SET total = (SELECT COALESCE(SUM(price * quantity), 0) FROM orders WHERE bill_id = $1),
               tax = total * 0.0825
           WHERE bill_id = $1`,
      [billId]
    );

    // Step 5: Check if there are any remaining orders for the bill
    const orderCheck = await client.query(
      "SELECT 1 FROM orders WHERE bill_id = $1",
      [billId]
    );

    // Step 6: If no orders remain, delete the bill
    if (orderCheck.rowCount === 0) {
      await client.query("DELETE FROM bill WHERE bill_id = $1", [billId]);
    }

    await client.query("COMMIT");
    res.sendStatus(200);
  } catch (err) {
    await client.query("ROLLBACK");

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
app.put("/bill/:bill_id", async (req, res) => {
  const { bill_id } = req.params;
  const { customerPhone, locationName, tip, cardId } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // Step 1: Retrieve the bill details with a lock
    const billResult = await client.query(
      "SELECT total, tip, tax, paid FROM bill WHERE bill_id = $1 FOR UPDATE",
      [bill_id]
    );

    // Check if the bill exists
    if (billResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Bill not found");
    }

    const billData = billResult.rows[0];

    // Check if the bill is already paid
    if (billData.paid) {
      await client.query("ROLLBACK");
      return res.status(400).send("Warning: The bill ID is already paid");
    }

    // Step 2: Calculate the total amount including tip and tax
    const formattedTotalAmount =
      parseFloat(billData.total) + parseFloat(tip) + parseFloat(billData.tax);
    const totalAmount = parseFloat(formattedTotalAmount.toFixed(2));

    // Step 3: Update the bill to mark it as paid
    await client.query(
      `UPDATE bill
           SET cust_phone = $1, tip = $2, card_id = $3, paid = TRUE, location_name = $4
           WHERE bill_id = $5`,
      [customerPhone, tip, cardId, locationName, bill_id]
    );

    // Step 4: Update the customer's membership points
    await client.query(
      "UPDATE customers SET membership_point = membership_point + 1 WHERE phone = $1",
      [customerPhone]
    );

    // Step 5: Retrieve the current business balance
    const businessBalanceResult = await client.query(
      "SELECT business_balance FROM transaction ORDER BY tran_id DESC LIMIT 1"
    );

    const currentBusinessBalance =
      businessBalanceResult.rowCount > 0
        ? businessBalanceResult.rows[0].business_balance
        : 5000.0; // Default balance if no transactions exist

    const x = parseFloat(currentBusinessBalance) + parseFloat(totalAmount);
    const newBusinessBalance = parseFloat(x.toFixed(2));
    console.log(currentBusinessBalance, totalAmount, newBusinessBalance);

    // Step 7: Insert a transaction record
    await client.query(
      `INSERT INTO transaction(total, from_bankacct, business_balance)
           VALUES ($1, $2, $3)`,
      [formattedTotalAmount, cardId, newBusinessBalance]
    );

    await client.query("COMMIT");
    res.sendStatus(200);
  } catch (err) {
    await client.query("ROLLBACK");
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

//add customer
app.post("/customers", async (req, res) => {
  const { name, phone } = req.body;

  // Validate input
  if (!name || !phone) {
    return res.status(400).send("Name and phone are required.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if the customer already exists
    const customerCheck = await client.query(
      "SELECT * FROM customers WHERE phone = $1 FOR UPDATE",
      [phone]
    );

    if (customerCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(200).json({
        message: "Customer already exists.",
        customer: customerCheck.rows[0],
      });
    }

    // Insert the new customer
    await client.query("INSERT INTO customers (name, phone) VALUES ($1, $2)", [
      name,
      phone,
    ]);

    // Retrieve the newly inserted customer
    const newCustomer = await client.query(
      "SELECT * FROM customers WHERE phone = $1",
      [phone]
    );

    await client.query("COMMIT");
    res.status(201).json({
      message: "Customer added successfully.",
      customer: newCustomer.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

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
app.delete("/customers/:phone", async (req, res) => {
  const { phone } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: Check if the customer exists and lock the row
    const result = await client.query(
      "SELECT phone FROM customers WHERE phone = $1 FOR UPDATE",
      [phone]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Customer not found" });
    }

    // Step 2: Delete the customer
    await client.query("DELETE FROM customers WHERE phone = $1", [phone]);

    await client.query("COMMIT");
    res.sendStatus(200); // Successfully deleted
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error deleting customer:", err.message);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the customer." });
  } finally {
    client.release();
  }
});

//add menu
app.post("/menu", async (req, res) => {
  const { name, price, image } = req.body;

  // Validate input
  if (!name || !price) {
    return res.status(400).send("Name, price, and image URL are required");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if the menu item already exists
    const menuCheck = await client.query(
      "SELECT 1 FROM menu WHERE name = $1 FOR UPDATE",
      [name]
    );

    if (menuCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "This dish name is already used." });
    }

    // Insert the new menu item
    await client.query(
      "INSERT INTO menu (name, price, image, status) VALUES ($1, $2, $3, 'Available')",
      [name, price, image]
    );

    await client.query("COMMIT");
    res.sendStatus(201); // Successfully created
  } catch (err) {
    await client.query("ROLLBACK");

    // Handle unique constraint violation
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "This dish name is already used." });
    }

    console.error("Error adding menu item:", err.message);
    res.status(500).send("An error occurred while adding the menu item.");
  } finally {
    client.release();
  }
});

//delete menu
app.delete("/menu/:name", async (req, res) => {
  const { name } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: Check if the menu item exists and lock the row
    const result = await client.query(
      "SELECT name FROM menu WHERE name = $1 FOR UPDATE",
      [name]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Step 2: Delete the menu item
    await client.query("DELETE FROM menu WHERE name = $1", [name]);

    await client.query("COMMIT");
    res.sendStatus(200); // Successfully deleted
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error deleting menu item:", err.message);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the menu item." });
  } finally {
    client.release();
  }
});

//change status in menu
app.put("/menu/status/:name", async (req, res) => {
  const { name } = req.params;
  const { status } = req.body;

  try {
    // Check if the menu item exists
    const menuItem = await pool.query(
      "SELECT status FROM menu WHERE name = $1",
      [name]
    );
    if (menuItem.rowCount === 0) {
      return res.status(400).send("Menu item not found.");
    }

    await pool.query("UPDATE menu SET status = $1 WHERE name = $2", [
      status,
      name,
    ]);
    res.sendStatus(200); // Successfully updated
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500); // Internal server error
  }
});

//add card
app.post("/cards", async (req, res) => {
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

    // Step 1: Check if the card exists and lock the row
    const existingCardResult = await client.query(
      "SELECT * FROM cards WHERE id = $1 FOR UPDATE",
      [id]
    );

    let newBalance;

    if (id.startsWith("cash")) {
      if (existingCardResult.rowCount === 0) {
        // If card doesn't exist and starts with "cash", add it with balance "0"
        await client.query(
          "INSERT INTO cards (id, name, ex_date, balance) VALUES ($1, $2, $3, $4)",
          [id, name, ex_date, 0]
        );
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
          return res.status(400).json({
            success: false,
            message: "Insufficient balance to complete the transaction.",
          });
        }

        // Update the balance for the existing card
        await client.query("UPDATE cards SET balance = $1 WHERE id = $2", [
          newBalance,
          id,
        ]);
      } else {
        // If card doesn't exist, create a new card with a default balance of 1000
        newBalance = 1000 - spend;
        await client.query(
          "INSERT INTO cards (id, name, ex_date, balance) VALUES ($1, $2, $3, $4)",
          [id, name, ex_date, newBalance]
        );
      }
      res.status(200).json({ success: true, newBalance });
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error processing card transaction:", error.message);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

//delete all customer
app.delete("/customers", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: Lock all customers (if necessary)
    await client.query("SELECT 1 FROM customers FOR UPDATE");

    // Step 2: Delete all customers
    await client.query("DELETE FROM customers");

    await client.query("COMMIT");
    res.sendStatus(200); // Successfully deleted
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error deleting rows from customer table:", err.message);
    res.status(500).json({ error: err.message }); // Internal server error
  } finally {
    client.release();
  }
});

//delete all bill
app.delete("/bill", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: Lock the rows in the bill table (if needed)
    // This may not be strictly necessary for a delete-all operation but useful for complex scenarios
    await client.query("SELECT 1 FROM bill FOR UPDATE");

    // Step 2: Delete all records from the bill table
    await client.query("DELETE FROM bill");

    // Step 3: Commit the transaction
    await client.query("COMMIT");
    res.sendStatus(200); // Successfully deleted
  } catch (err) {
    // Rollback in case of error
    await client.query("ROLLBACK");

    console.error("Error deleting rows from bill table:", err.message);
    res.status(500).json({ error: err.message }); // Return detailed error
  } finally {
    client.release();
  }
});

//delete all order
app.delete("/orders", async (req, res) => {
  try {
    await pool.query("delete from orders;");
    res.sendStatus(200); // Send OK response
  } catch (err) {
    console.error("Error deleting rows from order table:", err.message);
    res.status(500).json({ error: err.message }); // Return detailed error
  }
});

//delete all card
app.delete("/cards", async (req, res) => {
  try {
    await pool.query("delete from cards;");
    res.sendStatus(200); // Send OK response
  } catch (err) {
    console.error("Error deleting rows from card table:", err.message);
    res.status(500).json({ error: err.message }); // Return detailed error
  }
});

//delete all transaction
app.delete("/transaction", async (req, res) => {
  try {
    await pool.query("delete from transaction;");
    res.sendStatus(200); // Send OK response
  } catch (err) {
    console.error("Error deleting rows from transaction table:", err.message);
    res.status(500).json({ error: err.message }); // Return detailed error
  }
});

//delete all location
app.delete("/location", async (req, res) => {
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



