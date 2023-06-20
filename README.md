# Create a social banking app. Where you can transact with people who are your connection.

## To do:
- [x] Create a route to create user:
  - [x] User will provide there first name, last name, age and bank balance.
  - [x] You will create user in database will this information and create a 10 digit random account number.
  - [x] Due to security reasons you will create a 14 digit user password which contains number, letters and special characters.
- [ ] Users should only be able to make transactions or add connections only after login.
- [ ] Users should be able to send and approve connection requests.
- [x] Except the create user and login route, all other routes should use authentication, use can use bearer tokens which are at most valid for 15 mins.
- [ ] Users should have the ability to add connections using someone's bank account number.
- [x] User should be able to see the name, age and bank account number of all their connections in a list.
- [ ] Users can remove a connection from their account.
- [ ] Users can send and receive money to accounts which are there connection. Each transaction should be in the database.
- [ ] Bank makes 1% on each transaction below 1,000 and 0.5% every transasction above 1,000.
- [ ] Users should be able to see there past transactions.
- [ ] Each transction should also be saved in a .csv file in the file system with following format: 
  ```
  Sender,Receiver,Amount,TimeStamp
  1903578765,3458907654,100,12-06-21 11:00:12AM
  1903578765,3458907654,100,12-06-21 11:00:12AM
  ```
- [ ] Bank admin should be able to see how much money bank has made from transactions through a separate route, but you can't store that information in an account. We would like you to use mongo's aggregation framework to calculate money made by the bank.
- [ ] Make sure you handle all the edge cases and error scenarios for example:
  - [ ] What should happen when the user has zero balance and user tries to send money.
  - [ ] User tries to send money which is greater than their bank balance.
  - [ ] User tries to send money to someone who is no longer has them as their connection.

**Note:**
User Should only be able to send money when both users are each others connection, for example User A should have B as their connection and User B should have User A as their connection. One sided connection won't work.

## Extra points:
- [ ] Add an undo transaction functionality, when user sends someone money they should be able to reverse the transaction in the next minute. And the user who receives the money should only see it in their account after one minute.
- [ ] During that one minute window of undo feature, the money should be logged in to a special account and then transfered back to the sender account or forwarded to the receiver account.
- [ ] If user decides to undo the transaction, user's account should see send transaction and undo transaction in their transaction history.

## Things to keep in mind:
- Use node and express for APIs.
- Use mongodb atlas as your database and mongoose as your ORM.
- Use Postman to test your routes. We would use the same.
- All API responses should be in JSON format.
- Please lint and format your code.
- You have full autonomy on creating the routes structure and design the database schema, we want to see what you can come up with on your own.
- This test is used to test you Node, Express as well as MongoDB knowledge, so optimize you queries.
- Code should be properly documented and easier to understand.
- Code written in typescript is a plus point but it's not required.
- You can create database in mongodb atlas, which is a free service and use environment variables to store secrets.
- Please add your code on github and make commits so we can review the code.
- Commit your code in the repo with the .env file.
- Make sure when you share the repo with us the database is not completely empty, it should have at least 5 users and 20 transactions so we don't have to start from scratch to verify things.
- Do not spend more than one day on this test, it's fine to not finish it. A few questions are going to came after the code review and that's the important part.