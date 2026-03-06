# Project Overview: Architecture Comparison

## The Core Idea
This project is an educational and practical implementation designed to compare two fundamental software architectures: **Monolithic** and **Microservices**. 

To provide a fair and realistic comparison, a simple **E-commerce Store** application has been conceptualized and is being built twice—once using a complete monolithic approach, and again using a distributed microservices approach.

## The Application: Simple E-commerce Store
The chosen application provides standard e-commerce features handled by the following core domains:
- **User**: Handles user registration, authentication (JWT), and profile management.
- **Product**: Manages the catalog of products, inventory, and product details.
- **Cart**: Manages a user's shopping cart before checkout.
- **Order**: Processes checkout, and order lifecycle management.
- **Notification**: Dispatches emails or alerts for events like order confirmation or successful registration.

## Architecture 1: The Monolithic Version
In the monolithic version, all the domains mentioned above are integrated and run within a single application process and codebase. 
- Communicates internally via standard function or method calls.
- Simplifies initial development, testing, and deployment.
- Can become difficult to scale and maintain as the codebase and team grow.

## Architecture 2: The Microservice Version
In the distributed version, the application is broken down into independent, loosely coupled services:
- **API Gateway**: Acts as the single entry point for clients, routing requests to the appropriate backend service and handling cross-cutting concerns (e.g., JWT authentication and request correlation IDs).
- **Independent Services**: Each domain (User, Product, Cart, Order, Notification) is its own separate service, often with its own repository and environment configuration.
- **Data Encapsulation**: Each service encapsulates its own state and database (e.g., independent PostgreSQL containers), preventing direct database access from other services.
- **Network Communication**: Services communicate with each other over the network via HTTP/REST (or asynchronous message brokers).

## Project Goals
1. **Practical Implementation**: Gain hands-on experience in configuring, coding, and containerizing (Docker) both architectural styles.
2. **Trade-off Analysis**: Observe the pros and cons of each architecture in action. Compare deployment complexity, data consistency, inter-service communication overhead, and structural organization.
3. **Comprehensive Documentation**: Maintain detailed documentation—including Architecture Diagrams, Entity-Relationship Diagrams (ERD), Class Diagrams, and Sequence Diagrams—for both versions to visually and conceptually contrast the two approaches.

## How to Run
Since this project features two distinct architectures, they are run independently using Docker Compose for simplified setup.

### Running the Monolithic Version
1. Navigate to the monolithic directory:
   ```bash
   cd Monolithic_Version
   ```
2. Build and start the application along with its single database:
   ```bash
   docker-compose up --build
   ```
3. The monolithic application will typically be available on `http://localhost:3000` (or whatever the configured port is).

### Running the Microservice Version
1. Navigate to the microservices directory:
   ```bash
   cd Microservice_Version
   ```
2. Build and start all independent services, the API Gateway, and their respective databases:
   ```bash
   docker-compose up --build
   ```
3. The API Gateway will serve as the entry point for all requests, typically available on `http://localhost:8080` (or the gateway's configured port).
