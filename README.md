# National Park Restaurant — Order Management System

A full-stack restaurant system for a chain of fast-food locations themed around U.S. national parks (Yosemite, Zion, Arches, Big Bend, and more). It has two separate web apps that share one PostgreSQL database:

- **Customer ordering site** (`localhost:8000`): browse the menu, build a cart, and check out.
- **Back office** (`localhost:3000`): staff manage bills, orders, menu items, customers, cards, employees, schedules, locations, and reviews, and see an overview of the business.

The main focus of the project is keeping the data correct when many orders hit the database at once. Every write runs inside a transaction, and the order and payment paths use `SERIALIZABLE` isolation with row locks so two requests can't step on each other.

**Tech stack:** Node.js, Express, PostgreSQL (`pg`), HTML/CSS, vanilla JavaScript

## How it fits together

```
 Customer site (:8000)            Back office (:3000)
 public/ — served by app.js       backend/ — served by server.js
          │                                │
          └──────────── REST API ──────────┘
                    server.js (Express)
                           │
                     PostgreSQL "restaurant"
```

`server.js` is both the API and the host for the back-office pages. `app.js` is a tiny static server for the customer site, which calls the same API on port 3000.

## Database

Ten tables: `menu`, `customers`, `cards`, `location`, `bill`, `orders`, `transaction`, `employee`, `schedule`, and `review`. The full relationship diagram is in [`ER Diagram.pdf`](ER%20Diagram.pdf).

You don't need to run a schema file. The **Create Table** button in the back office creates every table and fills it with sample data.

## Getting started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 13+

### 2. Install dependencies

```bash
git clone https://github.com/Minhbui100/Restaurant.git
cd Restaurant
npm install
```

### 3. Create the database

Log into PostgreSQL (for example with `psql -U postgres`) and run:

```sql
DROP DATABASE IF EXISTS restaurant;
CREATE DATABASE restaurant;
```

### 4. Point the app at your database

Edit `config.json` with your own PostgreSQL user, password, and port:

```json
{
  "user": "postgres",
  "password": "your_password",
  "port": 5432
}
```

The default PostgreSQL port is 5432. Change it only if your install uses a different one.

### 5. Start both servers

Open two terminals in the `Restaurant` folder.

```bash
# Terminal 1 — API + back office
node server.js
```

```bash
# Terminal 2 — customer ordering site
node app.js
```

### 6. Load the sample data

Go to **http://localhost:3000** and click **Create Table** at the top of the page. All ten tables are created and filled with example menu items, locations, employees, customers, and past bills. They show up at the bottom of the page under **Dashboard**.

## Using it

### Placing an order (customer site)

1. Go to **http://localhost:8000**.
2. Click **Add Order** on any dish. Items marked *Out of Stock* can't be added.
3. Click **View Cart** to change quantities or remove items.
4. Click **Proceed to Checkout**, fill in your details and payment, then click **Place Order**.

Back on **http://localhost:3000**, click **Refetching Data** under the menu and the new bill appears.

### Managing the restaurant (back office)

The tabs across the back office cover the day-to-day work:

| Tab | What staff can do |
|-----|-------------------|
| Bill / Order | Add or delete orders on a bill, take payment |
| Business Transaction | See the running cash balance from each payment |
| Edit Menu | Add or remove dishes, mark a dish Available / Out of Stock |
| Active Location | View the restaurant locations |
| Employee / Employee Schedule | View staff and who works when |
| Edit Customer / Edit Customer Card | Add or remove customers and their saved cards |
| Review | View customer reviews |
| Delete All Tables | Reset everything |

## Stress-testing with 100 bills

On the customer site, click **Simulation 100 Bills**. It generates 100 random customers, each with a random cart, card, tip, and location, and runs every one through the real checkout flow: create the bill, insert the orders, register the customer and card, and take payment. When it's done, click **Refetching Data** in the back office to see all 100 bills.

Note that the simulation sends checkouts one after another, not all at the same moment. It's a good test of volume and of the full order-to-payment path. To test true simultaneous requests, you can fire several checkouts in parallel (for example with `Promise.all` or a load-testing tool) and watch `transactions.log`.

## How data stays consistent

- **Transactions everywhere.** Every create, update, and delete is wrapped in `BEGIN … COMMIT`, and anything that fails is rolled back, so you never end up with a bill that has no orders, or a payment with no bill.
- **`SERIALIZABLE` isolation** on placing orders, deleting orders, and paying a bill. If PostgreSQL detects a conflict (error `40001`), the transaction is rolled back and the user is asked to try again rather than saving bad data.
- **Row locks (`SELECT … FOR UPDATE`)** before changing a bill, an order, a customer, or a menu item, so a second request has to wait instead of reading a stale value. For example, an order can't be deleted from a bill that's being paid at the same moment.
- **Logging.** Every SQL statement is written to `queries.log`, and every transaction step (`BEGIN`, each statement, `COMMIT` / `ROLLBACK`) is written to `transactions.log`. That makes it easy to see exactly what ran and in what order.

## Project structure

```
Restaurant/
├── server.js          # Express API (port 3000) + serves the back office
├── app.js             # Static server for the customer site (port 8000)
├── config.json        # Your PostgreSQL credentials
├── backend/           # Back-office page: index.html, index.js, utilities.js, style.css
├── public/            # Customer page: index.html, script.js, utilities2.js, style.css
├── ER Diagram.pdf     # Database design
├── queries.log        # Generated: every query
└── transactions.log   # Generated: every transaction step
```

## Troubleshooting

- **`password authentication failed` or `ECONNREFUSED`:** check the user, password, and port in `config.json`, and make sure PostgreSQL is running.
- **`database "restaurant" does not exist`:** run step 3 again.
- **The back office is empty:** click **Create Table**, then **Refetching Data**.
- **The customer site shows no menu:** `server.js` has to be running too, because the customer site loads the menu from port 3000.
