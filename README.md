# nippy-cli

Cli to build api.

## Install

As it is a code scaffolder and generator, it requires to be globally installed.

```npm install -g nippy```

## Usage

### Overview

Create or go in your app folder. Then run ```nippy``` to get an interactive cli tool.

You'll be able to:

- start a new project (scaffold and setup)
- generate some code
- seed database
- project scaffolding (only the source code)
- setup project .env file

### Start a new project

#### Import codebase

_Example here is provided with https://github.com/tilap/nippy-scaff-base_

```
mkdir myapp
cd myapp
nippy -S
```

Select the `base api`. It will copy code in the current folder and rename your project in main files (package.json and README.md).

#### Init the project

```
nippy -i
```

Answer the few questions for your local environement (mostly dev env). Wait til it has install everything.

Then create your remote git host, add and do your first commit.

#### Deploy

Deployment is provided by fabric, based on github tags.

##### First time

- You need your project to be on git (and your server must be able to access this git server).
- You need your local fabfile (not git as it can contains production informations)
- You need to setup specific config files on your server

###### Init your project on git

Add and commit your sources on a git repository

##### Setup your fabfile

```cp fabfile.py.example fabfile.py```

Edit the fabfile, replace at least the `env.repository`, `env.hosts`, `env.path` with your owns settings. Run

##### Set your project environement stuff

```fab prod setup```

It will init the project on your remote server. You can then add spcific server files list in fabfile (in var `env.shared_paths`).

Your project is ready to deploy

##### Deploy

Once the project is init on your remote server, you can deploy with

```fab prod deploy```

(of fab preprod deploy, fab testing deploy... for other environment). You can use ```fab prod rollback``` too.

### Code generator

- **shortcut:** ```nippy -g```
- **description:** generate some code from few quaestions and basic templating
- **notes:** you can generate:
  - a database model
  - a service based on an existing model
  - a controller (bound or not to a model)
  - a router
  - a full model-service-controller-router
  - the api client

### Database seeding

- **shortcut:** ```nippy -s``` or ```nippy -s foldertoseed```
- **description:** seed current database (configured from .env on real ENV)
- **notes:** seeding sources must be json files named with the collection you want to seed. Data are inserted with the lib, so they have to be validated.

### Project scaffolding

- **shortcut:** ```nippy -S```
- **description:** Copy project sources from a remote tarball or a local folder
- **notes:** Scaffold is done from sources found in *scaffolding* package.json property or from your home *.nippyrc* file. It manages local scaff folder or remote tar.gz file (from github for example).

### Project init

- **shortcut:** ```nippy -i```
- **description:** Init project name and .env
- **notes:** -

### Setup project .env file

- **shortcut:** ```nippy -c```
- **description:** Create a .env file for dev/testing environement
- **notes:** get only the bare app requirements. Specific app configuration is not managed yet.

## Dev

To locally work on nippy-cli, clone sources, then run ```npm run build && sudo npm link```.

