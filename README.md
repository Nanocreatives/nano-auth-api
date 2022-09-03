# Nanocreatives Authentication API

![](https://github.com/Nanocreatives/nano-auth-api/workflows/Continuous%20Integration/badge.svg)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

Authentication management restful API built with Node.js, Express and MongoDB

## Features

#### Authentication Features

 - Registration
 - Email verification on registration
 - Authentication with JWT
 - JWT Refresh
 - Password Change & Reset
 - Change ID
 - Account Deletion
 - User Management (with Get, Put, Post, Patch, Delete, etc...)

#### Core Features

 - ES2017 latest features like Async/Await
 - CORS enabled
 - Express + MongoDB ([Mongoose](http://mongoosejs.com/))
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP headers for security
 - Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
 - Request validation with [joi](https://github.com/hapijs/joi)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Git hooks with [husky](https://github.com/typicode/husky) 
 - Logging with [morgan](https://github.com/expressjs/morgan)
 - API documentation generation with [apidoc](http://apidocjs.com)
 - Continuous integration support with [Github Actions](https://github.com/features/actions)

## Requirements

 - [Node v12+](https://nodejs.org/en/download/current/)

## Getting Started

#### Clone the repo:

```bash
git clone --depth 1 https://github.com/Nanocreatives/nano-auth-api
cd nano-auth-api
rm -rf .git
```

#### Install dependencies:

```bash
npm install
```

#### Set environment variables:

```bash
cp .env.example .env
```

#### Running Locally

```bash
npm run dev
```

#### Running in Production

```bash
npm start
```

#### Lint

```bash

# run Code Formatting with Prettier
npm run prettify

# lint code with ESLint
npm lint

```

#### Validation

```bash

# run Code Linting & Testing
npm run validate

```

#### Documentation

```bash
# generate and open api documentation
npm run docs
```



## License

[MIT License](README.md) - [Nanocreatives](https://github.com/Nanocreatives)
