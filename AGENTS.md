# Laptop Service Management System

## 1. Project Purpose

This is a simple web-based Laptop Service Management System built for a small local laptop repair shop.

The primary goal is:

- Record customer laptop service entries
- Track repair status
- Manage service history
- Maintain clear, simple workflow
- Avoid unnecessary complexity

This is NOT a SaaS product.
This is NOT designed for scale.
This is NOT a multi-tenant system.

It is intentionally simple.

---

## 2. Target User

The system is built for:

- A non-technical shop owner
- Low daily entry volume
- Simple operational workflow
- Desktop-first usage

The UI and logic must remain extremely simple and predictable.

---

## 3. Core Functional Requirements

### Customer & Device Entry
- Customer name
- Phone number
- Device model
- Problem description
- Password (if provided)
- Physical condition notes

### Service Tracking
- Status (Received / In Progress / Completed / Delivered)
- Service charge
- Technician notes
- Delivery date

### Search & Retrieval
- Search by phone number
- Search by customer name
- View service history

### Basic Reporting (Optional / Minimal)
- Daily entries
- Completed services

---

## 4. Architectural Principles

This project intentionally follows:

- Simple layered architecture
- Controller → Service → Repository pattern
- DTO-based validation
- Centralized error handling
- Basic pagination where needed

We are NOT using:

- Microservices
- Event-driven architecture
- CQRS
- Complex domain modeling
- Advanced caching
- Message brokers

Keep everything straightforward and readable.

---

## 5. Technology Stack

Backend:
- Node.js (Express)
- TypeScript
- Database (as defined in repo)
- Swagger for API documentation

Other Considerations:
- RESTful APIs
- Basic authentication if needed
- Clean folder structure
- Environment-based configuration

---

## 6. Current Implementation Status

- Basic CRUD operations implemented
- DTO validation present
- Swagger documentation configured
- Pagination implemented for listing endpoints
- Clean controller-service separation exists

Still refining:
- Validation consistency
- Error handling standardization
- Minor refactors for simplicity

---

## 7. Non-Goals (Important)

This system should NOT:

- Be over-abstracted
- Use unnecessary design patterns
- Prepare for millions of users
- Add premature optimization
- Add advanced DevOps complexity

If a feature adds complexity without real benefit to a small shop, it should NOT be implemented.

---

## 8. Coding Guidelines for AI Assistants

When generating code:

- Prefer simple solutions over clever ones
- Avoid unnecessary abstractions
- Avoid introducing new architectural layers
- Keep functions readable
- Avoid deeply nested logic
- Prefer clarity over scalability

This is a small-business internal tool.

---

## 9. Future Scope (Minimal)

Possible additions (only if needed):

- Simple invoice print format
- Basic CSV export
- Basic backup mechanism

Nothing beyond that unless explicitly required.

---

## 10. Design Philosophy

This project prioritizes:

- Practical usability
- Simplicity
- Maintainability
- Predictability

The goal is to deliver a stable, easy-to-use system rather than a technically impressive one.