# deep-foundation

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/dev) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)

## Gitpod usage

Everything starts automatically. Just watch the terminal.

When all tasks are done, you can open - http://localhost:3007/ **(ctrl/cmd + click by link)**


## Local usage

- make sure to use node 18 (we recommend to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- install docker and docker-compose
- `git clone https://github.com/deep-foundation/dev.git; cd dev; npm ci; npm run packages; npm run local;`
- `npm run local-migrate;` with `npm run local` started

## Server usage with domain

### Preparation

Make this ports port is accessable from the internet to a machine:
  
HTTP port for cerbot to be able to authenticate the domain ownership

HTTP or HTTPS to make nginx work correctly and make the Deep itself accessable

If `docker run hello-world` does not work without `sudo` try relogin or if it does not help then try to restart machine. 

**Continue only if `docker run hello-world` works without `sudo` and errors.**

### Install

```sh
sudo apt update
sudo apt install -y git curl docker.io docker-compose

sudo groupadd docker
sudo usermod -aG docker $USER
docker run hello-world
docker rm $(docker ps -a -q --filter "ancestor=hello-world")

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18 && nvm use 18 && nvm alias default 18
npm i -g npm@latest

export DEEPCASE_HOST="chatgpt.deep.foundation"
export DEEPLINKS_HOST="deeplinks.chatgpt.deep.foundation"

git clone https://github.com/deep-foundation/dev && (cd dev && npm ci)
(cd dev && node configure-nginx.js --configurations "$DEEPCASE_HOST 3007" "$DEEPLINKS_HOST 3006" --certbot-email drakonard@gmail.com)

npm rm --unsafe-perm -g @deep-foundation/deeplinks
npm install --unsafe-perm -g @deep-foundation/deeplinks@latest

export HASURA_ADMIN_SECRET=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export MINIO_ACCESS_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export MINIO_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));"); tee call-options.json << JSON
{
  "operation": "run",
  "envs": {
    "DEEPLINKS_PUBLIC_URL": "https://$DEEPLINKS_HOST",
    "NEXT_PUBLIC_DEEPLINKS_URL": "https://$DEEPLINKS_HOST",
    "NEXT_PUBLIC_GQL_PATH": "$DEEPLINKS_HOST/gql",
    "NEXT_PUBLIC_GQL_SSL": "1",
    "NEXT_PUBLIC_DEEPLINKS_SERVER": "https://$DEEPCASE_HOST",
    "NEXT_PUBLIC_ENGINES_ROUTE": "0",
    "NEXT_PUBLIC_DISABLE_CONNECTOR": "1",
    "JWT_SECRET": "'{\"type\":\"HS256\",\"key\":\"$(node -e "console.log(require('crypto').randomBytes(50).toString('base64'));")\"}'",
    "DEEPLINKS_HASURA_STORAGE_URL": "http://host.docker.internal:8000/",
    "HASURA_GRAPHQL_ADMIN_SECRET": "$HASURA_ADMIN_SECRET",
    "MIGRATIONS_HASURA_SECRET": "$HASURA_ADMIN_SECRET",
    "DEEPLINKS_HASURA_SECRET": "$HASURA_ADMIN_SECRET",
    "POSTGRES_PASSWORD": "$POSTGRES_PASSWORD",
    "HASURA_GRAPHQL_DATABASE_URL": "postgres://postgres:$POSTGRES_PASSWORD@postgres:5432/postgres",
    "POSTGRES_MIGRATIONS_SOURCE": "postgres://postgres:$POSTGRES_PASSWORD@host.docker.internal:5432/postgres?sslmode=disable",
    "RESTORE_VOLUME_FROM_SNAPSHOT": "0",
    "MANUAL_MIGRATIONS": "1",
    "MINIO_ROOT_USER": "$MINIO_ACCESS_KEY",
    "MINIO_ROOT_PASSWORD": "$MINIO_SECRET_KEY",
    "S3_ACCESS_KEY": "$MINIO_ACCESS_KEY",
    "S3_SECRET_KEY": "$MINIO_SECRET_KEY"
  }
}
JSON
export DEEPLINKS_CALL_OPTIONS=$(cat call-options.json) export DEBUG="deeplinks:engine:*,deeplinks:migrations:*"; deeplinks
```

### Update

```
npm rm --unsafe-perm -g @deep-foundation/deeplinks
npm install --unsafe-perm -g @deep-foundation/deeplinks@latest

export DEEPLINKS_CALL_OPTIONS=$(cat call-options.json) export DEBUG="deeplinks:engine:*,deeplinks:migrations:*"; deeplinks
```

### Uninstall

If you don't have `dev` directory clone it like this:
```
git clone https://github.com/deep-foundation/dev && (cd dev && npm ci)
```

Than execute:

```
(cd dev && (npm run docker-clear || true) && rm -f /tmp/deep/.migrate)
npm rm --unsafe-perm -g @deep-foundation/deeplinks
rm -rf dev
```

## Server usage with IP (unsafe use only for tests)

### Preparation

Here is how you can install deep on the server without SSL and without a domain (after all, why without SSL?).

Replace HOST_IP with your host's IP.

Take care to open ports 3006 and 3007, for example, using [the ufw package on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-20-04).

For example:
```
sudo ufw allow 3006
sudo ufw allow 3007
```

If `docker run hello-world` does not work without `sudo` try relogin or if it does not help then try to restart machine. 

**Continue only if `docker run hello-world` works without `sudo` and errors.**

### Install

```sh
sudo apt update
sudo apt install -y git curl docker.io docker-compose

sudo groupadd docker
sudo usermod -aG docker $USER
docker run hello-world
docker rm $(docker ps -a -q --filter "ancestor=hello-world")

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18 && nvm use 18 && nvm alias default 18
npm i -g npm@latest

export HOST_IP="185.105.118.59"
export DEEPCASE_HOST="$HOST_IP:3007"
export DEEPLINKS_HOST="$HOST_IP:3006"

npm rm --unsafe-perm -g @deep-foundation/deeplinks
npm install --unsafe-perm -g @deep-foundation/deeplinks@latest

export HASURA_ADMIN_SECRET=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export MINIO_ACCESS_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));") && export MINIO_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'));"); tee call-options.json << JSON
{
  "operation": "run",
  "envs": {
    "DEEPLINKS_PUBLIC_URL": "http://$DEEPLINKS_HOST",
    "NEXT_PUBLIC_DEEPLINKS_URL": "http://$DEEPLINKS_HOST",
    "NEXT_PUBLIC_GQL_PATH": "$DEEPLINKS_HOST/gql",
    "NEXT_PUBLIC_GQL_SSL": "0",
    "NEXT_PUBLIC_DEEPLINKS_SERVER": "http://$DEEPCASE_HOST",
    "NEXT_PUBLIC_ENGINES_ROUTE": "0",
    "NEXT_PUBLIC_DISABLE_CONNECTOR": "1",
    "JWT_SECRET": "'{\"type\":\"HS256\",\"key\":\"$(node -e "console.log(require('crypto').randomBytes(50).toString('base64'));")\"}'",
    "DEEPLINKS_HASURA_STORAGE_URL": "http://host.docker.internal:8000/",
    "HASURA_GRAPHQL_ADMIN_SECRET": "$HASURA_ADMIN_SECRET",
    "MIGRATIONS_HASURA_SECRET": "$HASURA_ADMIN_SECRET",
    "DEEPLINKS_HASURA_SECRET": "$HASURA_ADMIN_SECRET",
    "POSTGRES_PASSWORD": "$POSTGRES_PASSWORD",
    "HASURA_GRAPHQL_DATABASE_URL": "postgres://postgres:$POSTGRES_PASSWORD@postgres:5432/postgres",
    "POSTGRES_MIGRATIONS_SOURCE": "postgres://postgres:$POSTGRES_PASSWORD@host.docker.internal:5432/postgres?sslmode=disable",
    "RESTORE_VOLUME_FROM_SNAPSHOT": "0",
    "MANUAL_MIGRATIONS": "1",
    "MINIO_ROOT_USER": "$MINIO_ACCESS_KEY",
    "MINIO_ROOT_PASSWORD": "$MINIO_SECRET_KEY",
    "S3_ACCESS_KEY": "$MINIO_ACCESS_KEY",
    "S3_SECRET_KEY": "$MINIO_SECRET_KEY"
  }
}
JSON
export DEEPLINKS_CALL_OPTIONS=$(cat call-options.json) export DEBUG="deeplinks:engine:*,deeplinks:migrations:*"; deeplinks
```

### Update

```
npm rm --unsafe-perm -g @deep-foundation/deeplinks
npm install --unsafe-perm -g @deep-foundation/deeplinks@latest

export DEEPLINKS_CALL_OPTIONS=$(cat call-options.json) export DEBUG="deeplinks:engine:*,deeplinks:migrations:*"; deeplinks
```

### Uninstall

If you don't have `dev` directory clone it like this:
```
git clone https://github.com/deep-foundation/dev && (cd dev && npm ci)
```

Than execute:

```
(cd dev && (npm run docker-clear || true) && rm -f /tmp/deep/.migrate)
npm rm --unsafe-perm -g @deep-foundation/deeplinks
rm -rf dev
```

## Manual terminal methods

### Gitpod

Automatic

- `npm run gitpod-start` gitpod start u

OR

- `npm run gitpod-local` local launch processes
- `npm run gitpod-recreate` docker/migrations clear/init

Manual

- `npm ci; npm run git-shh-to-https; npm run packages` before all, only ONCE PER GITPOD CONTAINER!
- `npm ci; npm run git-shh-to-https; npm run gitpod` gitpod start up

### Local

Automatic

- `npm run local` local launch processes
- `npm run local-recreate` docker/migrations clear/init

Manual

- `npm ci && npm run packages` before all, only ONCE PER GITPOD CONTAINER!

### Useful

- `npm run rm-migrates` to delete all .migrate artifacts of npm migrate package

## Unsafe gulp methods

- **attention! before work checkout to branch from detached commits in each needed submodule**
- `npm run gulp -- packages:get` clone and install all packages **starts automatically in workspace**
- `(cd packages/hasura && npm run docker-local)` start docker postgres and hasura locally **starts automatically in workspace**
- `npm run gulp -- packages:set` fast git add git commit and git push deepcase repo
- `npm run gulp -- package:insert --url HTTPGITURL --name NAMEINPACKAGESDIRECTORY` insert submodule
- `npm run gulp -- package:delete --name NAMEINPACKAGESDIRECTORY` delete submodule
- `npm run gulp -- assets:update` copy all assets from ./assets in to each package
- `npm run gulp -- packages:sync` sync all dependenced packages in workspace
