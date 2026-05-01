# Team Task Manager Backend

Express, MongoDB, Mongoose, JWT, and bcrypt backend for the Team Task Manager MERN application.

## Folder Structure

```text
server/
  config/
    db.js
  controllers/
    authController.js
    dashboardController.js
    projectController.js
    taskController.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
  models/
    Project.js
    Task.js
    User.js
  routes/
    authRoutes.js
    dashboardRoutes.js
    projectRoutes.js
    taskRoutes.js
  utils/
    apiResponse.js
    asyncHandler.js
  server.js
  package.json
  .env.example
```

## Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

For production, set `FRONTEND_URL` to your deployed frontend origin. Multiple origins can be comma-separated.

## Local Setup

```bash
cd server
npm install
npm run dev
```

Production-style local run:

```bash
cd server
npm install
npm start
```

The API runs on `PORT` or `5000`.

## Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

## API Documentation

### Auth

`POST /api/auth/register`

Body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

`role` is optional and defaults to `member`.

`POST /api/auth/login`

Body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Both auth endpoints return a JWT token.

### Projects

Protected routes require:

```http
Authorization: Bearer <token>
```

`POST /api/projects` admin only

Body:

```json
{
  "name": "Website Launch",
  "description": "Launch the marketing website",
  "members": ["USER_ID"]
}
```

`GET /api/projects`

Returns projects for the logged-in user.

`PUT /api/projects/:id/members` admin only

Body:

```json
{
  "action": "add",
  "userId": "USER_ID"
}
```

Use `"remove"` to remove a member. Project creators cannot be removed.

### Tasks

`POST /api/tasks` admin only

Body:

```json
{
  "title": "Create wireframes",
  "description": "Draft the first project wireframes",
  "projectId": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "status": "To Do",
  "priority": "high",
  "dueDate": "2026-05-15"
}
```

`status` is optional and defaults to `To Do`. Valid statuses are `To Do`, `In Progress`, and `Done`.

`priority` is optional and defaults to `medium`. Valid priorities are `low`, `medium`, and `high`.

`GET /api/tasks`

Members receive only assigned tasks. Admins receive all tasks.

Optional filters:

```text
?projectId=PROJECT_ID&status=To%20Do
```

`PUT /api/tasks/:id/status`

Only the assigned user can update status.

Body:

```json
{
  "status": "In Progress"
}
```

### Dashboard

`GET /api/dashboard`

Returns:

```json
{
  "totalTasks": 4,
  "tasksByStatus": {
    "To Do": 2,
    "In Progress": 1,
    "Done": 1
  },
  "tasksPerUser": [],
  "overdueTasks": [],
  "overdueTaskCount": 0
}
```

Members see metrics for their assigned tasks. Admins see global task metrics.

## Railway Deployment

1. Create a Railway service from the repository.
2. Set the service root directory to `server` if deploying from a monorepo.
3. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` if Railway does not provide one automatically
   - `FRONTEND_URL`
4. Railway build/start commands:

```bash
npm install
npm start
```

## Required Testing Flow

1. Register an admin user.
2. Register or login a member user.
3. Login as admin.
4. Create a project.
5. Add the member to the project.
6. Create a task assigned to the member.
7. Login as member.
8. Fetch assigned tasks.
9. Update task status.
10. Fetch dashboard and verify totals/status counts changed.
