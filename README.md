# DBS30 NATIONAL PARK RESTAURANT 
## HOW TO RUN OUR PROGRAM

>NOTE: CURRENT WORKING DIRECTORY/FOLDER WILL BE "Restaurant"

Step 1: Install dependencies:
`npm install express pg body-parser cors fs`

Step 2: Create database named "restaurant" in your localhost by using this command
`CREATE DATABASE restaurant;`

Step 3 : in config.json file, input your database user, password and port in this following format:
```
{
"user": " ",
"password": " ",
"port":
}
```

Step 4: In the "Restaurant" directory, run `node server.js` to run back end (server side).
Go to [localhost:3000](localhost:3000) on Chrome browser. This is back office.

Step 5: In the  [localhost:3000](localhost:3000) on Chrome browser, click `Create tables` (on the top of the webpage) button to add example datas to tables on your local machine.

Back office is where restaurant staffs work on:
- Weekly and daily reports. 
- Edit data
- Checking cashflow

Step 6: Open another terminal under current working directory, run `node app.js` to run front end HTML
Go to  [localhost:8000](localhost:8000) on Chrome. This is front end.

Frontend is where customers use for placing orders and paying.








