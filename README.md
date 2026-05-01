# Team Task Manager

A full-stack web application built to manage team projects and tasks with role-based access control.
It allows admins to create projects, assign tasks, and monitor progress, while team members can track and update their assigned work.

---

## 🚀 Live Demo

* **Frontend:** https://pleasant-success-production-f0e1.up.railway.app
* **Backend API:** https://teamtaskmanager-production-cddc.up.railway.app/api

---

## 📌 Features

### Authentication

* User signup & login using JWT
* Secure route protection
* Token-based session handling

### Role-Based Access

* **Admin**

  * Create projects
  * Add/remove members
  * Create and assign tasks
* **Member**

  * View assigned tasks
  * Update task status

### Project Management

* Create and manage projects
* Assign users to projects
* Controlled access per role

### Task Management

* Create tasks with:

  * Title
  * Description
  * Due date
  * Priority
* Assign tasks to users
* Update task status:

  * To Do
  * In Progress
  * Done

### Dashboard

* Total tasks overview
* Tasks grouped by status
* Tasks per user
* Overdue tasks tracking

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* React Router
* Axios
* Plain CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### Deployment

* Railway (Frontend + Backend)
* MongoDB Atlas

---

## 📂 Project Structure

```
Team-task-Manager/
│
├── client/        # Frontend (React + Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── services/
│
├── server/        # Backend (Express API)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173,https://your-frontend-url
```

### Frontend (`client/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Running Locally

### 1. Clone the repo

```
git clone https://github.com/ShivanshGera/teamTaskManager.git
cd teamTaskManager
```

### 2. Backend setup

```
cd server
npm install
npm run dev
```

### 3. Frontend setup

```
cd ../client
npm install
npm run dev
```

---

## 🔄 Test Flow

To verify the application:

1. Register a new user (Admin)
2. Login
3. Create a project
4. Add a member
5. Create and assign tasks
6. Login as member
7. Update task status
8. Check dashboard updates

---

## ⚠️ Notes

* `.env` files are not committed for security reasons
* CORS is configured to allow only trusted frontend URLs
* API follows consistent response format:

  ```
  { success, message, data }
  ```

---

## 📈 Possible Improvements

* Notifications (email or in-app)
* Drag-and-drop task board (Kanban style)
* File attachments for tasks
* Activity logs

---

## 👨‍💻 Author

**Shivansh Gera**

---

## 📌 Final Thoughts

This project focuses on clean architecture, proper API design, and real-world functionality rather than UI complexity.
The goal was to build something practical that reflects how team-based systems actually work.
