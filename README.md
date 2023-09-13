## Introduction

This is a starter template for my own NestJS projects. It uses a variety of my own libraries and provides a decent
base for new projects with TypeORM.

- Environment variables with types and validation
- Better logger with more logging levels and flexibility
- Middleware for logging requests like `nginx` or `apache2`
- Wrappers for `null` responses and missing TypeORM entities
- TypeORM with migrations, custom repositories, CLI, and more
- Base service class with a variety of useful methods and properties
- Automatic request trimming and validation
- Automatic response serialization with decent default options

## Migrations

### Generating migrations

Migrations are generated from the source code of entities based on how they differ from the actual tables in the
database at the time. So, the changes must not yet be synchronized.

```
npm run typeorm migration:generate src/database/migrations/NAME
```

### Running migrations

```
npm run typeorm migration:run
```

### Reverting the latest migration

```
npm run typeorm migration:revert
```
