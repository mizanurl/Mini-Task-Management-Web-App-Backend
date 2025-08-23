# Mini Task Management Web App Backend
This is the backend for a mini task management web application, built with a robust and scalable architecture. It provides a RESTful API for managing users, projects, and tasks, with real-time updates powered by Socket.IO.

---

## Architecture

This backend follows the **Repository Design Pattern** to ensure a clear separation of concerns, making the codebase **maintainable, testable, and scalable**.

- **Controllers**  
  Handle incoming HTTP requests, validate data, and delegate business logic to the services.

- **Services**  
  Contain the core business logic. They interact with repositories to perform operations and coordinate with other services (e.g., `AuditLogService`).

- **Repositories**  
  Abstract database interactions. They communicate directly with **MongoDB (via Mongoose)** and expose a clean interface for the services. This makes the business logic independent of the specific database technology.

---

## Key Technologies

- **TypeScript** – Full static typing for improved reliability and maintainability.  
- **Express.js** – Minimal and flexible Node.js web framework.  
- **Mongoose** – ODM for MongoDB, with schema validation and query helpers.  
- **Socket.IO** – Real-time bidirectional communication between clients and server.  
- **JWT** – Secure authentication and role-based access control.  
- **Swagger** – Interactive API documentation.  

---

## Installation & Execution

Follow these steps to get the project running locally.

### Prerequisites
- Node.js **v18+**
- npm **v8+**
- MongoDB instance (local or hosted, e.g., **MongoDB Atlas**)

### Setup

1. **Clone the repository**
Download the folloiwng public repository:
   ```bash
   git clone https://github.com/mizanurl/Mini-Task-Management-Web-App-Backend.git
   cd Mini-Task-Management-Web-App-Backend
   ```

2. **Install dependencies**
Install all the necessary libraries:
   ```bash
   npm install
   ```

3. **Run the application**
Development mode (with nodemon reloading):
   ```bash
   npm run dev
   ```

4. **API Documentation**
Once running, the API will be available at:
   ```sh
   Base URL: http://localhost:3000
   Swagger Docs: http://localhost:3000/api-docs
   ```

5. **Using Swagger UI**
You can interact with the API directly using the Swagger documentation:
i. Open the Swagger UI at http://localhost:3000/api-docs
ii. Scroll down to the **`/api/users/login`** endpoint (usually at the bottom).  
iii. Click **"Try it out"**, enter the **email** and **password** for one of the demo accounts (see credentials below), and click **Execute**.  
iv. Copy the **token** returned in the response.  
v. Click the **Authorize** button at the top-right of Swagger UI.  
vi. Paste the copied token into the input field and click **Authorize**.  
vii. Now, you can access all restricted endpoints according to the logged-in user's role.


6. **Demo Credentials**
Use the following credentials to log in and test the application:

- **Admin**
- Email: `mizan@msn.com`
- Password: `mizan123`

- **Manager**
- Email: `sarwar@msn.com`
- Password: `sarwar123`

- **Member**
- Email: `rakib@msn.com`
- Password: `rakib123` 