<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Getting Started

First at all, please download and install [NodeJS](https://nodejs.org/en/download/) (recommended version 14 or later), and install Docker on your local machine if you want to use Docker to run the local environment.



> Recommendation: Install [oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh) and [auto-suggestion](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md) plugin on your local machine to help you use Linux command lines more conveniently.

## Setup local environment

Clone the `.env-local` to `.env` and contact members in the team to get the correct variable values.

```
$ cp .env-local .env
```

### Use Docker

```sh
$ cd /your-workspace-path/core-api-v2
$ make setup
```

You can see other make commands in [Makefile](./Makefile)

```sh
# Start environment
$ make work

# Stop environment
$ make leave

# View containers status
$ make stack/status
```

### Manually setup

```bash
# development
$ npm install && npm run start

# watch mode
$ npm run start:dev
```

### Verify application

```
$ curl localhost:3001/
```

> Note: You can change the 3001 to any port which works on your local machine.

### Access to container

```sh
# Use docker-compose
docker-compose exec next-door-core-api sh # next-door-core-api is container name

# Use docker-compose with zsh
dce next-door-core-api sh

# Use make command
$ make docker/exec c=next-door-core-api m=sh
```

## Database

### Dump data from RDS dev

We are using PostgreSQL 12.x on cloud and local environment. To dump the data from development environment RDS to your local, please try to run the following steps:

1. Access to PostgreSQL docker container
   
    ```sh
    $ docker-compose exec next-door-postgres bash
    ```

    Or use zsh short command:

    ```sh
    $ dce next-door-postgres bash
    ```

2. Run pg_dump to dump data

    ```sh
    $ pg_dump --file "/home/snd_20210610.sql" --host "snd-pg-dev2.cbcdhoiotoy8.ap-southeast-1.rds.amazonaws.com" --port "5432" --username "snd" --verbose --format=t --blobs --encoding "UTF8" "snd"
    $ exit
    ```

3. Copy file from container to your host
   
   ```sh
   $ docker cp $(docker container list | grep next-door-postgres | awk '{print $1}'):/home/snd_20210610.sql ./snd_20210610.sql
   ```

### Import dump data to local

```sh
$ pg_restore --host "localhost" --port "5432" --username "postgres" --dbname "snd" --verbose "/home/snd_20210610.sql"
$ exit
```

## pgAdmin

>Access to `http://localhost:5050` then enter the PostgreSQL username/password to access to PostgreSQL UI Tool.

## Production

```sh
# Start server with production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Troubleshooting

If you were doing `npm install` and you got an error "The chromium binary is not available for arm64." then try setting `export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and install again. After this, you'll need to manually install chromium in your device to be able to run Puppeteer for site link crons.

Remove all volumes if you receive a notification `docker not enough disk space` 

```sh
$ docker volume rm $(docker volume ls -q)
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).

