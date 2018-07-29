# offline1st
Offline-first app with React and RxDB. Based on this [guide](https://blog.logrocket.com/building-an-offline-first-app-with-react-and-rxdb-e97a1fa64356) by Esteban Herrera in LogRocket.

## Table of Contents

- [Database Schema](#database-schema)
- [Configuring the local database](#database-configure)

## Database Schema
I saved the database schema under `src/lib/Schema.js`. The code is as follows:

```export const schema = {
  title: 'Anonymous chat schema',
  description: 'Database schema for an anonymous chat',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    message: {
      type: 'string'
    }
  },
  required: ['message']
}
```

In the above schema:

1. The version number is zero. If the version is greater than zero, you have to provide a [data migration strategy](https://pubkey.github.io/rxdb/data-migration.html).
2. It has two properties of type string, id, and message. The first one is the primary key, and it represents the date the message was inserted as the number of milliseconds since the Unix epoch.
3. The property `message` is required.
4. You can learn more about schemas [here](https://pubkey.github.io/rxdb/RxSchema.html).

## Configuring the local database

This should be in `App.js`:

```
import * as RxDB from 'rxdb';
import { QueryChangeDetector } from 'rxdb';
import { schema } from './Schema';
```

In addition to importing the main RxDB module and the schema created in the previous section, we’re importing the module `QueryChangeDetector`.

As RxDB is a reactive database, you can subscribe to queries to receive new results in real-time, but executing a query every time this happens can impact performance, so the option `QueryChangeDetector` optimizes observed queries by getting new results from database events instead.

This option is currently in beta and disabled by default, but we can enable it with the following code:

```
QueryChangeDetector.enable();
QueryChangeDetector.enableDebugging();
```