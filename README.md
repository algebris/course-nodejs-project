# Any shop

Source code for Node.js course project on [learn.javascript.ru](https://learn.javascript.ru/courses/nodejs).
See [live demo](https://course-nodejs.javascript.ru/).

## Installation

For local development you need Node.js and PostgreSQL installed on your PC.
Clone this repo and then:
```bash
npm install # install server dependencies
cd client/ && npm install && cd .. # install client dependencies
npm run prisma:generate # generate Prisma client
npm run prisma:push # apply schema to local database
npm run prisma:seed # fill database
npm start # start server
```

Required env variables for server:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/any_shop?schema=public
```
You can start from `.env.example`.

If you want to work on client side code:
```bash
cd client/
npm start
```

## Deployment

Command `node index.js` will start server that will serve content from `public` folder. In order to update public folder command `npm run build` should be executed.
Production configuration stores inside `production.env` file (which is not part of this repo).
