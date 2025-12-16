# Backend Architecture (N-Tier)

This backend has been refactored to follow a Clean/N-Tier Architecture.

## Layers

1. **Routes** (`src/routes`): Defines API endpoints and maps them to Controllers.
2. **Controllers** (`src/controllers`): Handles HTTP Requests/Responses and Validation (using DTOs).
3. **Services** (`src/services`): Contains Business Logic.
4. **Repositories** (`src/repositories`): Handles Data Access (Database interactions).
5. **DTOs** (`src/dtos`): Data Transfer Objects (Validation Schemas using Zod).
6. **Types** (`src/types`): Domain definitions.

## Flow
`Request` -> `Route` -> `Controller` (Validate DTO) -> `Service` -> `Repository` -> `Database`

## Adding a New Feature (e.g., Books)
1. **Type**: Define `BookSchema` in `src/types/book.types.js`.
2. **DTO**: Define `BookDTO` in `src/dtos/book.dto.js`.
3. **Repository**: Create `BookRepository` in `src/repositories/book.repository.js`.
4. **Service**: Create `BookService` in `src/services/book.service.js`.
5. **Controller**: Create `BookController` in `src/controllers/book.controller.js`.
6. **Route**: Add `bookRoutes.js`.
