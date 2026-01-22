# API Documentation

API documentation will be defined here.

## Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- POST `/api/v1/auth/logout` - Logout user
- POST `/api/v1/auth/refresh` - Refresh access token

### Tasks
- GET `/api/v1/tasks` - Get all tasks
- GET `/api/v1/tasks/:id` - Get task by ID
- POST `/api/v1/tasks` - Create new task
- PUT `/api/v1/tasks/:id` - Update task
- DELETE `/api/v1/tasks/:id` - Delete task

### Users
- GET `/api/v1/users/me` - Get current user
- PUT `/api/v1/users/me` - Update current user
- DELETE `/api/v1/users/me` - Delete current user
