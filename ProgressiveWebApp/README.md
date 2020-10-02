# ProgressiveWebApp

Work in Progress

## Steps to run

Warning: Steps may be incomplete.

1. Install node.js lts.
2. Run `npm install` from cli in this directory.
3. Open ProgressiveWebApp.lvproject and build the WebApp.gcomp.
4. Run `npm run build` to generate WebApp.gcomp/sw.js and WebApp.gcomp/workbox-*****.js.

   Note: You must build WebApp.gcomp before running the command.
5. Add the newly generated files to WebApp.gcomp.
6. Rebuild the WebApp.gcomp and create a new distribution.

Repeat steps 3-6 when creating a new distribution.
