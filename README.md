# Argentinians Who Code (AWC)

This is the source code for the [Argentinians Who
Code](https://argentinianswhocode.dev) website.

## Forking this project

The code in this repository is open source with the sole purpose of helping out
those who want to create something similar for professionals in their own
country. Feel absolutely free to grab what you need from here and use it as your
own. If you do so, please consider giving this project a shoutout on your repo,
website or any of your social media platforms. That would be immensely
appreciated!

This project is deployed to [vercel](https://vercel.com) and built with:

- [Remix](https://remix.run)
- [Typescript](https://www.typescriptlang.org)
- [Tailwind](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [zod](https://zod.dev)
- [Conform](https://conform.guide)
- [Drizzle](https://orm.drizzle.team)
- [Bun](https://bun.sh)
- [Dotenvx](https://dotenvx.com)
- [Turso](https://turso.tech)
- [Resend](https://resend.com/overview)
- [Upstash](https://upstash.com)
- ... and many other amazing tools!

I have carefully detailed all the instructions you need to get this project up
and running, but in case you need any help or have any questions just reach out
to me! I'm always happy to help out.

## Requirements

- [Bun](https://bun.sh) (recommended)
- [Dotenvx](https://dotenvx.com/) (required)
- [Turso](https://turso.tech) (required)
- [Resend](https://resend.com/overview) (required)
- [Upstash](https://upstash.com) (required)

## Setup

First and foremost, install the project dependencies:

```shell
bun install
```

Next, run the following command:

```shell
bun setup
```

This will simply copy the `.env.example` and `.env.development.example` files
provided to `.env` and `.env.development` filenames respectively. We'll work on
those together ;)

Once the `.env` files are in place, install the `turso` CLI tool to interact
with your database. For that, follow the instructions detailed
[here](https://docs.turso.tech/cli/introduction).

### Development

Follow these steps in order to have a working app where you can test things out
locally.

#### 1. Database

With your Turso CLI installed, go ahead and create a new local database where
you can test things out:

```shell
turso dev --db-file local.db
```

This will start a local libSQL server and create a database for you. It will
create a couple of files on your root folder. Don't worry about those :) you can
learn more about that [here](https://docs.turso.tech/local-development).

Now that we have a local database, let's push our schema and seed our database!
For that to work properly, make sure to install [dotenvx](https://dotenvx.com)
globally on your machine. Then, run:

```shell
bun db:push:dev && bun db:seed:dev
```

Amazing! Now we have a working database filled with data. Go ahead and run this
to see things in motion:

```shell
bun db:studio:dev
```

#### 2. Resend

This project uses [Resend](https://resend.com) to send email notifications
everytime there's a new nominee. Create an account there and fill in the
`RESEND_API_KEY` environment variable located on your `.env` file.

#### 3. Upstash

AWC also uses an [Upstash](https://upstash.com) Redis database to handle rate
limiting. Make sure to setup an account there, and create a new Redis database.

Once that is done, complete the `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` environment variables in your `.env` file.

#### 4. Run your app

One last step before running this app. Create a unique token
([here](https://it-tools.tech/token-generator) for example) and assign it to
your `SESSION_SECRET` environment variable (in `.env`). This is useful for the
admin access permissions.

Finally, we are ready to start our app! Start the server in development mode:

```shell
bun dev
```

#### Admin

This app is structured around the idea of a main admin person who's responsible
of receiving nominees requests, approving them and many other extraordinary
tasks:

- Approve nominees
- Reject nominees
- Edit approved nominees (hereunder referred to as "devs")
- Delete devs

You might've noticed that on your `.env.development` file there's an
`ADMIN_EMAIL` and a `ADMIN_PASSWORD` variable. With your dev server running,
head over to [http://localhost:5173/login](http://localhost:5173/login) and
input those same values. Once that is done, you should notice that you're
redirected to `/admin` URL, where you as an admin can excersie your appointed
permissions.

### Production

The first thing you'd need to do is to connect
[Drizzle](https://orm.drizzle.team) (the ORM) with your remote Turso database.
For that, with your Turso CLI installed, retrieve your Turso credentials by
executing:

```shell
turso db show --url {database-name} && turso db tokens create {database-name}
```

_Replace `{database-name}` with the name of your database. If you haven't
created one, you can do so manually on your account, or use the CLI:_

```shell
turso db create {database-name}
```

Once you have your credentials, fill in the `TURSO_DATABASE_URL` and
`TURSO_DATABASE_AUTH_TOKEN` environment variables located in `.env`.

Now that you have your database credentials in place, you can go ahead and push
your schema to Turso:

```shell
bun db:push
```

To check that everything is working correctly, run:

```shell
bun db:studio
```

## Acknowledgements

Great inspiration for this project was taken from the [Argentinians Who
Design](https://argentinianswho.design) website, which in turn is a fork of the
[Brazilians Who Design](https://github.com/zehfernandes/brazilianswhodesign).
