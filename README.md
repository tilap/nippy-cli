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

- **shortcut:** ```nippy -i```
- **description:** scaffold a project, setup basic env, install node dependancies and build the dist files
- **notes:** See _Project scaffolding_ section for more information about scaffolding

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

### Setup project .env file

- **shortcut:** ```nippy -c```
- **description:** Create a .env file for dev/testing environement
- **notes:** get only the bare app requirements. Specific app configuration is not managed yet.

## Dev

To locally work on nippy-cli, clone sources, then run ```npm run build && sudo npm link```.

