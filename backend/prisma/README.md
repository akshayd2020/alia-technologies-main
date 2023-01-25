# This is where we'll put all of our Prisma-related code.

Prisma is the ORM we'll be using to work with our Postgres database. You can take a look at https://www.prisma.io/docs/getting-started/quickstart for some documentation on how to work with Prisma

Prisma consists of a command-line utility that you can access with `npx prisma`, and some auto-generated Javascript (maybe Typescript?) code that we can use throughout our backend to query and modify
the database tables.

The hope is that using Prisma will make it much faster for us to iterate through building out our database, because it automatically handles a whole bunch of stuff for us so we don't have to worry about it.

## What goes in this folder?
- `schema.prisma` stores the overall database schema
- `migrations` stores all of the SQL migrations that Prisma automatically generates from our schema file when we run `npx prisma migrate dev --name {{migration_name}}`

## How do I use the Prisma CLI?
Some useful commands I've found so far are:
- `npx prisma migrate dev`: runs all of the new migrations
- `npx prisma migrate dev --name {{migration_name}}` analyzes the `schema.prisma` file for the latest changes and automatically generates and runs a new migration with the given name

## TODO: How do I use Prisma from my code?
Haven't had time to look into this yet, but you can check out the quickstart link up above for some basics. It looks like Prisma autogenerates some code to `backend/node_modules/@prisma/client` that we can use