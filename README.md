# React Starter
Create single page applications with react.

## Getting Started

### Requirements

  * Mac OS X, Windows, or Linux
  * [Yarn](https://yarnpkg.com/) package + [Node.js](https://nodejs.org/) v6.5 or newer
  * Text editor or IDE pre-configured with React/JSX/Flow/ESlint ([learn more](./how-to-configure-text-editors.md))

### Directory Layout

```
.
├── /build/                         # The folder for compiled output
├── /node_modules/                  # 3rd-party libraries and utilities
├── /public/                        # Static files which are copied into the /build/public folder
├── /src/                           # The source code of the application
│   ├── /index.js                   # startup script
│   └── ...                         # Other core framework modules
├── /tools/                         # Build automation scripts and utilities
│   ├── /lib/                       # Library for utility snippets
│   ├── /config/                    # Tools configurations
│   ├── /build.js                   # Builds the project from source to output (build) folder
│   ├── /bundle.js                  # Bundles the web resources into package(s) through Webpack
│   ├── /clean.js                   # Cleans up the output (build) folder
│   ├── /copy.js                    # Copies static files to output (build) folder
│   ├── /run.js                     # Helper function for running build automation tasks
│   ├── /runServer.js               # Launches the production web server
│   └── /start.js                   # Launches the development web server with "live reload"
├── .env                            # .env variables to be loaded into Node process.env.
├── package.json                    # The list of 3rd party libraries and utilities
└── yarn.lock                       # Fixed versions of all the dependencies
```

### Quick Start

#### 1. Get the latest version

You can start by cloning the latest version of React Starter on your
local machine by running:

```shell
$ git clone https://github.com/walid-mokrani/react-starter.git MyApp
$ cd MyApp
```

#### 2. Run `yarn install`

This will install both run-time project dependencies and developer tools listed
in [package.json](package.json) file.

### Building and Serving the app

#### `yarn start` (used for development)

This command will bundle the app from the source files (`/src`) into memory as it was in the
`/build` folder. As soon as the initial build completes, it will start the
Express dev server and [Browsersync](https://browsersync.io/)
with [HMR](https://webpack.github.io/docs/hot-module-replacement) on top of it.

Now you can open your web app in a browser, on mobile devices and start
hacking. Whenever you modify any of the source files inside the `/src` folder,
the module bundler ([Webpack](http://webpack.github.io/)) will recompile the
app on the fly and refresh all the connected browsers.

#### `yarn serve` (used for production)

This command will build the app from the source files (`/src`) into the output
`/build` folder. As soon as the initial build completes, it will start the
Express server and [Browsersync](https://browsersync.io/) without live reload.

If you want to only serve the app without rebuilding it just add the `--no-build` command line argument.

By default both `yarn start` and `yarn serve` starts the Express server
at PORT 3000 and opens automatically the browser at PORT + 1 (3001) using [Browsersync](https://browsersync.io/).<br>
If you don't need [Browsersync](https://browsersync.io/) just go to PORT 3000.

> [http://localhost:3000/](http://localhost:3000/) — Express server<br>
> [http://localhost:3001/](http://localhost:3001/) — Express server With Browsersync<br>
> [http://localhost:3002/](http://localhost:3002/) — Browsersync control panel (UI)<br>

If the PORT 3000 is already taken, it will look for another one. Suppose the PORT 40003 is used

> [http://localhost:40003/](http://localhost:40003/) — Express server<br>
> [http://localhost:40004/](http://localhost:40004/) — Express server With Browsersync<br>
> [http://localhost:40005/](http://localhost:40005/) — Browsersync control panel (UI)<br>

If you don't want to open the browser automatically add the `--silent` argument to the command line.

#### `yarn bundle`

Compile the app with ([Webpack](http://webpack.github.io/)) module bundler.

#### `yarn build`

Compile and copy all the necessary files to build a production ready app.

Note that all the commands listed above compile the app in `development` mode,
the compiled output files are not optimised and minimised in this case.
You can use `--release` command line argument to check how your app works
in release (production) mode.

The available arguments for the commands listed above (start, serve, bundle and build) are<br>

`--release`: Optimise and minimise the compiled output<br>
`--verbose`: Display more info into the console during the compilation phase<br>
`--analyse`: Open the [Webpack Analyser](https://github.com/webpack-contrib/webpack-bundle-analyzer)

#### Examples
Serve the app without optimisations using [HMR](https://webpack.github.io/docs/hot-module-replacement) to speedup the development workflow
```shell
$ yarn start
```
Serve the app as close as possible to a release (production) version while keeping live reload
```shell
$ yarn start --release
```
Build an optimised production ready app and launch the [Webpack Analyser](https://github.com/webpack-contrib/webpack-bundle-analyzer)
```shell
$ yarn build --release --analyse
```
Serve the production version (already present in the `dist` folder) without rebuilding it and without opening the browser automatically
```shell
$ yarn serve --no-build --silent
```

### Testing the app

#### `yarn test`
Run unit tests with [Jest](https://facebook.github.io/jest/).

By default, [Jest](https://facebook.github.io/jest/) test runner is looking for test files
matching the `src/**/*.test.js` pattern.

#### `yarn test-watch`
Launch unit test runner and start watching for changes.

#### `yarn lint`
Check the source code for syntax errors and potential issues.

#### `yarn fix`
Formatting syntax errors automatically.

For more commands, please see the scripts in [package.json](package.json) file.

### .env files

It enables you to create custom Node environment variables that are embedded during the build time.<br>
By default the files are loaded from the  `/dotenv` folder.<br>
Please refer to [Adding Custom Environment Variables](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables) for more info.
