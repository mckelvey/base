base
====

Base is my basic setup for either a static site or a small node+express site
and includes all the development goodies I use most frequently. At present,
this is Bootstrap, React, jQuery and lodash.

To adapt the setup to the particular need, I typically just delete the items
needed. For instance, if I don’t need the bootstrap js, then I can often also
delete jQuery and I’ll show that adaptation in the guide below.

## Installation

This is intended for primarily development use, and I use a mac, so these
instructions are tested in that environment, but *should* work on other
platforms as well, since it’s all based on node+npm.

### Node / NPM

Install the latest version of stable node and npm from the [nodejs website]
(http://nodejs.org/). (Stable versions are even numbered, e.g. `0.10` rather
than `0.11`.) There are binaries or you can install from source, whatever you like.

### Cloning Base

The following assumes you’ll be using a git repo for your final code, storing
it at some hosted service like GitHub.

1. In the enclosing folder where you want your repository, clone base and replace
[your-new-repo-name] with the folder name you want for the repository. (It often
matches the repository name.)

`$ git clone git@github.com:mckelvey/base.git [your-new-repo-name]`

2. Once cloning is complete, enter the repo and set the remote origin to your
hosted repository. (Create that repository there before attempting this step if
you haven’t already.)

`$ git remote set-url origin git@github.com:mckelvey/[your-new-repo-name].git`

3. If you want to continue to receive upstream changes to base, add it as an
upstream source. [(See upstream updates below.)](#upstream-updates)

`$ git remote add upstream git@github.com:mckelvey/base.git`

## Setup

To use your new base, you’ll want to get all the dependencies installed, customizing
to your specific needs as you go.

### Dependencies

For instance, you may not want to use uncss as you may not have static content
against which it could evaluate the css, or perhaps you don’t need bootstrap at all.
In both of these cases, you should review/update both the package.json and
bower.json files to vet the packages/libraries to be installed, preferably before
you do the dependency installs.

Please keep in mind that the gulpfile.js has references to the libraries in the
package.json, and that removals of tools should be done in concert, removing the
use of the libraries from the gulp tasks and atop the gulpfile.

Once satisfied, installations *should* be super easy. Issue the following two
commands from inside your repo.

`$ npm install`

`$ bower install`

### Node Server Configuration

While working, node and express will be delivering your development site to
localhost:3000 and you’ll need to update a few server files to do this.

All of the server files are located inside the /server folder, rename both the
following files to remove the trailing `.sample` from their names.

`server/app.coffee.sample`

`server/config/env.coffee.sample`

They should require little configuration. Note that if you prefer to run the node
development (or future production) servers at a different port, you can set that
in env.coffee. The domain there is for convenience, but not required unless your
app requires it.

If you aren’t going to have any “live” responses, e.g. an API, then you can delete
the API section of the app.coffee.

Finally, in your repo, you may want to have these two files maintained in your
repo. If so, you should update the `.gitignore` two remove the following lines:

```
server/app.coffee
!server/app.coffee.sample
env.coffee
!env.coffee.sample
```

### Pages and Layout(s)

Also inside the server folder is the static page content, written in Jade. (You
can now use other engines with express, but at the start, it was all Jade and
I’ve just left it that way.)

#### Layout(s)

Base comes with one default layout, but you can add use others, set on a
page-by-page basis. You should start by reviewing the default layout and ensuring
that it reflects any changes you made to your bower.json file. It is at:

`server/views/layout.jade`

If you do need more than one layout, then simply duplicate it and adapt the other
layouts as needed.

Atop the layout, there is also some javascript to adapt incoming variables from
the pages and set some defaults. Edit and change those as needed.

#### Pages

Pages are stored in the pages folder and are __always__ foldered, e.g. they are
always named index.jade inside a folder of the desired page URL. This consistency
helps in outputting the content of course, obscures the technology choices in the
eventual URL and provides for maximum flexibility in future content changes.

A home page is already present as an example. Per Jade style, the page is composed
of a layout “definition” plus several corresponding blocks. (A block is a piece of
content that is injected into the layout at the designated location.)

To change the layout, change the path of the extends reference atop the page.
After that, you need only make sure that you have matching block names between the
page and layout to inject content from the page into the layout. (You need not have
empty blocks in the page, null/undefined references are skipped.)

If you need some dynamic scripting during the page build process, javascript is
available (always prefixed with a dash) and there are plenty of examples available
in the default layout and home page to use as a guide.

## Use

In general terms, in addition to the layouts and pages noted above, all your site
assets live in the /client folder. (There are default /less and /coffee folders
inside with starter files.)

You can add and images, css, or whatever other files (including other static html)
to that folder to have them automatically copied into the development and
production folders. Got a favicon.ico? Drop it in /client.

During development or final output, gulp handles the creation and copying of
files. For development, all files are rendered to a /build folder that it created
on-the-fly. Likewise, a /dist folder is created for final output. The gulpfile
is what controls how the files and content are handled, so be sure to review it
if you find things out-of-whack.

### Gulp Tasks

The gulp tasks are the key to both development and final output, be it static or
served by the built-in node server. And while there are many sub-tasks, there are
really only three tasks you’d ask gulp to do for you.

### Development

To startup the development server and begin development, simply begin this task in
a terminal window.

`$ gulp server`

This task continues to run until you terminate it with a control-c as it watches
the /client folder for changes and updates the /build folder appropriately. The
/build folder is created and filled from the assets in the /client.

Livereload is enabled automatically, so any browsers using the localhost:3000 
address will be updated upon any change you make and save to files in /client. 
This means you can have multiple windows— think thin mobile and wider desktop—
open at the same time to review responsive design changes. If your phone is on
the same network, just point it your machine’s ip (:3000) to have it update as
well.

All css/js assets in development are versioned, so you need not worry about the
browser cache.

#### Caveats

1. It sometimes takes two runs at the first-time server task to get everything
in place— there’s more to do the first time out. After that everything should
work from the get-go.

2. Also upon first startup, you might need to re-save the default less/coffee
files (without changes) to trigger a complete cycle.

3. The browser must be reloaded once the development server is up and running
to get the livereload connection refreshed. And, this is also sometimes true
if an error ends the gulp server task, depending on how long it goes as a dead
connection for the browser.

4. Uncss runs on the bootstrap css file to remove any unneeded css. However,
uncss needs reference html files upon which to judge what css is actually being 
used. In the gulpfile.js, after the initial library requirements, you’ll need
to manually add the paths to your static files. If your site is too dynamic
or uses javascript HTML generation, you may simply opt to drop uncss from the
process as it becomes too cumbersome for the benefit.

#### Todos

The only other development task is a utility. If you leave yourself todos,
you can use the todo task to collect them into a TODO.md file.

`$ gulp todo`

### Static/Production

To output final files for production, issue the following command:

`$ gulp dist`

This composes all the files in /client as with development, but adds additional
minification, etc. for final output (and skips the server of course). All final
files will be written to the /dist folder.

Should you plan to use the /dist folder as a static site, you may need to have
it (and all the paths) be at a different location/path. If you wish, you can add
to the default path, e.g. /images becomes [/prefixed-path]/images via the
same-named variable in the gulpfile after the required libraries. This path is
also output in the default layout prefixed to styles and scripts.

## Upstream Updates

If you wish to pull in an upstream update and have added this repo as an upstream
source, you need only complete the following steps in your local repo.

`$ git fetch upstream`

`$ git merge upstream/master`

As with any merge, depending on the changes you’ve made, you may need to resolve
conflicts and should be sure to vet the function you desire. You can always
review changes in this repo prior to an upstream fetch/merge.

## Contributions

Suggestions and contributions are welcome. Create an issue or [email me](mailto:david@mckelveycreative.com)!
