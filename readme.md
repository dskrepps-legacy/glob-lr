# glob-lr

[![npm](https://img.shields.io/npm/v/glob-lr.svg)](https://www.npmjs.com/package/glob-lr)
[![npm](https://img.shields.io/npm/dm/glob-lr.svg)](https://www.npmjs.com/package/glob-lr)
[![npm](https://img.shields.io/npm/l/glob-lr.svg)](./LICENSE)

A [livereload](http://livereload.com/) cli tool that eats globs.

```sh
$ glob-lr 'www/**' '!www/vendor/**'
LiveReload listening on port 35729
LiveReload added 10 files
```

I guess you can use it in Node too if you want:

```js
var globlr = require('glob-lr');
var lr = globlr(['www/**', '!www/vendor/**'], opts);
// Now lr.watcher is a chokidar instance, lr.server is a
// listening tiny-lr server, and lr.shutdown() will close everything.
```

The globs are passed as an array to [chokidar](https://github.com/paulmillr/chokidar). Make sure they are quoted when using the cli. Folders named "node_modules", ".git", ".svn", or ".hg" and files within are ignored by default. [tiny-lr](https://github.com/mklabs/tiny-lr) is the livereload server which serves the livereload snippet and notifies the client.

Install using [npm](https://www.npmjs.com/) globally: `$ npm install -g glob-lr`

Or in your project's package.json: `$ npm install --save-dev glob-lr`


## Recipes

Watch all files of any depth within www/ but not any within www/vendor/, wait 5 seconds before reloading on changes:
```sh
glob-lr 'www/**' '!www/vendor/**' --delay 5000
```

Watch files of any depth within directories named "www" at any depth from the current working directory but exclude directories named "vendor" at any depth:
```sh
glob-lr '**/www/**' '!**/vendor/**'
```

Watch javascript files within static/ except for files with names beginning with "foo" but do watch "foobaz". Also, ignore jonathan.
```sh
glob-lr 'static/*.js' '!static/foo!(baz).js' '!static/jonathan.js'
```

Watch only css, html, and js files within a client directory as part of a npm watch script:
```json
{
    "scripts": {
        "watch": "run-p watch:*",
        "watch:livereload": "glob-lr 'client/**/*.{css,js,html}'",
        "watch:server": "nodemon server/"
    },
    "devDependencies": {
        "npm-run-all": "^2.2.0",
        "nodemon": "^1.9.2",
        "glob-lr": "^0.1.0"
    }
}
```


## Enabling LiveReload

You'll either need the [browser extension](http://livereload.com/extensions/) OR you can [embed the snippet into your HTML](http://feedback.livereload.com/knowledgebase/articles/86180-how-do-i-add-the-script-tag-manually-).


## Options

Cli parameters are parsed with [minimist](https://github.com/substack/minimist) and merged with the options object which is passed to chokidar and tiny-lr. For example `--followSymlinks false` will configure chokidar's followSymblinks option. Chokidar and tiny-lr have a number of their own options in addition to glob-lr's defaults:

`port`: (default 35729) (shorthand -p) The livereload port your livereload client script or browser extension tries to connect to

`delay`: (defualt 200) (shorthand -d) Milliseconds to debounce file changes before telling tiny-lr to notify the client

`quiet`: (default false) (shorthand -q) Suppress console output (unless you are debugging with `DEBUG=glob-lr`)

`noDefaultGlobs`: (default false) Files within directories named node_modules, .git, .svn, and .hg are ignored by default. Setting this will disable ignoring them


## Node API

#### `var lr = globlr(globs, opts)`

Globs is an array of glob strings or a single glob string which will be made an array. The default globs will be added to the end of this array and it will then be passed to chokidar.

#### `lr.watcher`

The instance of [chokidar](https://github.com/paulmillr/chokidar) so you have access to its API directly.

#### `lr.server`

The instance of [tiny-lr](https://github.com/mklabs/tiny-lr) so you have access to its API directly.


#### `lr.shutdown([err])`

Will cancel any debounced notifications and call the `close` methods of the watcher and server to allow the process to end.

#### `lr.fileCount`

Integer, the number of files being watched at the moment.

## License

MIT