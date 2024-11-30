DBS30
HOW TO RUN OUR PROGRAM

NOTE: CURRENT WORKING DIRECTORY/FOLDER WILL BE "Restaurant"

Step 1: Install dependencies:
npm install express pg body-parser cors

Step 2: Create database named "restaurant" in your localhost by using this command
"CREATE DATABASE restaurant;"

Step 3 : in config.json file, input your database user, password and port in this following format
{
"user": "",
"password": "",
"port":
}

Step 4: In the "Restaurant" directory, run "node server.js" to run back end (server side).
Go to localhost:3000 on Chrome. This is server side (back end)

Step 5: open another terminal under current working directory, run "node app.js" to run front end HTML
Go to localhost:8000 on Chrome. This is front end (HTML,JS,CSS)

NOTE: We mainly use localhost:8000 to work on program.

Step 6:If the tables are empty, click on "create table" button to add example datas to tables on your local machine

Step 7: In the "Add Order", enter:
Bill number: 8 (NOTE: it's must be 8 because the previous one is 7)
Dish's name: Jumbo Pizza
Price: 25.99
-Quantity: 2
-Hit button "add order"
--> Order table and Bill table will be added new bill and new order respectively
(1 Bill number can make multiple orders)

Bill number: 8
Dish's name: Coke
Price: 2.50
-Quantity: 3
-Hit button "add order"
--> Order table a new order. In Bill table, the total and tax of bill number 8 will be added.

Step 8: In the "Delete Order"
Order number: 17
--> Order number 17 will be deleted. The total and tax of bill number 8 will be reduced (or eleminated if there is no any order bill 8 exist in Order Table)

Order number: 2
--> Warning: Can not process because the bill number 1 is already paid

Step 9: In the "Payment", enter:
Bill number: 8
Customer ID: 10
Tip: 5.00
Card number (search on Card Table): 0123456701234567
--> In Bill Table, customer ID, tip, and card information will be updated for bill number 8.
--> In Card Table, card 0123456701234567's balance = balance-bill.total-bill.tip-bill.tax
--> In Transaction Table, it's updated bill number 8's information. Current business balance = balance+bill.total+bill.tip+bill.tax

Note: if you want to pay for bill number 1, which is already paid, Warning: Can not process because the bill number 1 is already paid
