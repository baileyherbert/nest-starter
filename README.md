# nest-starter

## introduction

This is my personal starter template for NestJS projects. It comes preconfigured with a variety of features and
libraries that I find useful in most of my projects.

```bash
cd dirname
degit baileyherbert/nest-starter
git init -b main
npm install
```

## usage

### environment

The `src/app.environment.ts` file is used to define configuration in the form of environment variables. These variables
are validated at startup according to the provided schema.

- See [`@baileyherbert/env`](https://github.com/baileyherbert/env) for documentation.

### databases

This starter comes preconfigured with TypeORM and a MySQL driver. The database connection is configured using
environment variables.

```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=example
```

However, there's an important note here. This starter actually requires **two different databases**. The first will be
named as configured in the variables above, `example`. The other will be named `example_staging`.

The staging database is used by the `npm run typeorm` command to generate and test migrations. It is untouched during
development, where changes to your entities are synchronized to the main database immediately. You can generally
create this staging database and forget about it.

### database entities

Each database table needs both an entity and repository class. In this starter, the ideal location for these is in a
subfolder under `src/database/entities`. For example:

```ts
// src/database/entities/account/Account.ts

@Entity('accounts')
export class Account {

}
```

```ts
// src/database/entities/account/AccountRepository.ts

@CustomRepository(Account)
export class AccountRepository extends Repository<Account> {

}
```

Each repository must then be added to the array at the top of `src/database/typeorm.ts`, after which it may be imported
into any service throughout the application.

### database migrations

The TypeORM command line tool is available using the `npm run typeorm` command. A helper script has been added to pass
subsequent arguments directly to the tool.

#### generating migrations

Migrations are generated from the source code of entities based on how they differ from the actual tables in the
database at the time. So, the changes must not yet be synchronized.

```bash
npm run typeorm migration:generate src/database/migrations/NAME
```

#### listing migrations

```bash
npm run typeorm migration:show
```

#### running migrations

```bash
npm run typeorm migration:run
```

#### reverting the latest migration

```bash
npm run typeorm migration:revert
```

### service classes

This starter provides an abstract `Service` class that all services should extend. This class provides protected
utilities and tools, including a `logger` property and methods to emit events, and makes all lifecycle methods
available for overriding.

```ts
export class ExampleService extends Service {

	protected override async onModuleInit() {
		this.logger.info('Example service initialized');
	}

}
```

### logging

A custom logger is available with more flexibility and logging levels. An abstract `Loggable` class is available for
extending which initializes a protected `logger` property on the class. The `Service` class also extends this class.

- See [`@baileyherbert/logging`](https://github.com/baileyherbert/logging) for documentation.

The logging level can be configured using the `APP_LOGGING_LEVEL` environment variable, which must be one of `Trace`,
`Debug`, `Information`, `Warning`, `Error`, `Critical`, or `None`. The default is `Information`.

### events

A global event system has been implemented which uses strongly-typed event classes. Each event is a class which extends
the abstract `NestEvent` class with a payload type provided as a generic.

```ts
export class TestEvent extends NestEvent<string> {}
```

The event can then be emitted from a service using the protected `emit` method. An instance of the event class will be
created automatically with the service as the sender.

```ts
export class ExampleService extends Service {

	public async sendTestEvent() {
		this.emit(TestEvent, 'This is just a test!');
	}

}
```

Other controllers or services in the application can then listen for the event using the `@EventHandler` decorator. The
event system automatically detects the event type from the function parameter.

```ts
export class ExampleController extends Loggable {

	@EventHandler()
	protected onTestEvent(event: TestEvent) {
		this.logger.info('Received a test event from:', event.sender);
		this.logger.info('The message says:', event.data);
	}

}
```

The global `EventService` can be imported to listen for or emit events from outside of a controller or service. In
addition, the global `Nest.events` property can be used to access the event service directly.

### request logging

The `APP_LOGGING_REQUESTS` environment variable can be set to `true` to enable request logging. This will log requests
to the output in a manner similar to `httpd` and `nginx`. Here's an example:

```
127.0.0.1 "GET /" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36" 404 3ms
```

### default middleware

This starter comes preconfigured with some pipes, filters, and interceptors to normalize the behavior of requests and
responses. Here is a brief overview of each:

#### content type middleware

The content type for each request is automatically set to `application/json`. This is done using a middleware consumer
in the `AbstractModule` class. This ensures consistency across the application, but can be removed if desired.

#### trim pipe

This pipe is configured to trim whitespace from all string values in request body objects.

#### validation pipe

This pipe is configured to validate request body objects against the class-validator decorators. For this to work, the
controller method must use the `@Body()` parameter decorator, and the parameter must be typed as the class.

#### null interceptor

Nest returns a blank response if a controller returns `null`. An interceptor is configured to fix this and return the
literal text `null` with a `application/json` content type instead.

#### serialization interceptor

This interceptor is configured to automatically serialize any class instances returned from a controller. This is done
according to any class-transformer decorators on the class type. In addition, fields starting with an underscore (`_`)
are automatically removed from the response.

#### error interceptor

This interceptor is configured to catch any "entity not found" exceptions from TypeORM and instead return a `404`
response with a generic error object, allowing you to use methods like `findOrFail()` without worry.

```json
{
	"statusCode": 404,
	"message": "The requested resource was not found"
}
```

### container

This starter also comes preconfigured with a separate dependency injection container that is automatically populated
with all of the providers in your application. This global container instance can be imported like so:

```ts
import { container } from '@baileyherbert/container';
```

This container is more powerful than Nest's built-in container and can be used with the bundled reflection library to
create your own decorators such as the `@EventHandler()` documented above.

- See [`@baileyherbert/container`](https://github.com/baileyherbert/container) for documentation on the container.
- See [`@baileyherbert/reflection`](https://github.com/baileyherbert/reflection) for documentation on reflection.
