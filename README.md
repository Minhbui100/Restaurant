# DBS30 NATIONAL PARK RESTAURANT 
## PART 1. HOW TO RUN OUR PROGRAM

>NOTE: CURRENT WORKING DIRECTORY/FOLDER WILL BE "Restaurant"

Step 1: Install dependencies:
`npm install express pg body-parser cors fs`

Step 2: Log into your postgres instance.

Step 3: Remove any table with the name `restaurant` by running the following command: `DROP DATABASE restaurant;`

Step 4: Create a database named `restaurant` on your postgres instance, by running: `CREATE DATABASE restaurant;`

Step 5: In the "Restaurant" directory, update the config.json file with your database user, password and port in the following format:
```
{
"user": " ",
"password": " ",
"port":
}
```

Step 6: Open a terminal, change directory to the "Restaurant" directory. From the "Restaurant" directory, run `node server.js` to run the back end server.

Step 7: Go to [localhost:3000](localhost:3000) on Chrome browser. This is back office.

Step 8: In the [localhost:3000](localhost:3000) on Chrome browser, click `Create Tables` (on the top of the webpage) button to add example datas to tables on your local machine.

10 data tables will be created:
- Bill
- Order
- Transaction
- Menu
- Location
- Employee
- Schedule
- Customer
- Card
- Review

NOTE: These tables are located at the very bottom of the localhost:3000 page under "Dashboard".

Back office is where the restaurant staffs work:
- Weekly and daily reports 
- Edit data
- Checking cashflow

Step 9: Open another terminal under current working directory, run `node app.js` to run front end HTML
Open another tab on Chrome browser, go to [localhost:8000](localhost:8000). This is front end.

Frontend is where customers place and pay for orders.
- Select dishes from menu by clicking `Add order`. Note: Cannot buy "Out of Stock" dishes.
- Click `View cart` to review and edit orders.
- Click `Proceed to Checkout` to go to the Checkout page.
- In the Checkout page, enter your information. Click `Place Order` to place the order and end your shopping.

Step 7: In the [localhost:3000](localhost:3000) page, click `Refetching Data` button (under the menu) to see the update of the new order.

## PART 2. TESTING CONCURRENCY

> Note: Users need to have completed Part 1 before going to Part 2

Step 1: In the [localhost:8000](localhost:8000) page, click `Simulation 100 Bills`. The program will automatically run 100 bills concurrently. "Successful Simulation" message will pop up after about 5 seconds.

Step 2: In the [localhost:3000](localhost:3000) page, click `Refetching Data` to see the update of the new 100 bills. Wait fro about 5 seconds until to the a message "Data refetched successfully!".



