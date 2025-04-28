# Journal--app-ADV-programing-
## About

This is a simple web application where users can register an account, log in, and create journal entries. Users can view their past entries after logging in.

The app is still under development, but the basic features like authentication and posting journals are working.

## How to Run

- Clone the repository:

   git clone https://github.com/mcguck26/Journal--app-ADV-programing-.git

- Move into the project folder:

   cd Journal--app-ADV-programing-

- Install dependencies:

   npm install

- Create a `.env` file in the root directory with the following variables:

   PORT=3000  
   MONGO_URI=your_mongodb_connection_string  
   SESSION_SECRET=your_secret_key

- Start the app:

   npm start

- Open your browser and go to:

   http://localhost:3000

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS templates
- bcrypt for password hashing
- express-session for session management
