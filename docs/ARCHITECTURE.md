# Architecture Documentation

## Clean Architecture Overview

This project follows Clean Architecture principles with clear separation of concerns.

### Backend Architecture

#### Domain Layer
- **Entities**: Core business objects
- **Value Objects**: Immutable objects representing domain concepts
- **Repository Interfaces**: Contracts for data access

#### Application Layer
- **Use Cases**: Application-specific business rules
- **DTOs**: Data Transfer Objects for API communication
- **Interfaces**: Service contracts

#### Infrastructure Layer
- **Database**: Prisma ORM and repository implementations
- **HTTP**: Express routes, controllers, and middlewares
- **Auth**: Authentication and authorization logic
- **Validation**: Input validation schemas

### Frontend Architecture

#### App Router Structure
- Route groups for logical separation
- Server and client components
- API routes for backend communication

#### Component Organization
- **UI Components**: Reusable presentational components
- **Feature Components**: Business logic components
- **Layout Components**: Page structure components

### Data Flow
1. HTTP Request → Controller
2. Controller → Use Case
3. Use Case → Repository Interface
4. Repository Implementation → Database
5. Response flows back through the layers
