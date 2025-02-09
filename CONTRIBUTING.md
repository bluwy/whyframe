# Contribute to whyframe

## Setup

The project requires [`pnpm 10`](https://pnpm.io) and [`Node.js 18`](https://nodejs.org/en/). Run `pnpm install` to install dependencies of all workspace packages.

> Note: If you have limited network usage, you can remove `- playground/*` in the `pnpm-workspace.yaml` file to skip installing the `playground` dependencies. (Make sure not to `git commit` this change)

## Development

All packages do not need bundling! It's written in plain JavaScript with JSDoc for types, and using handcrafted `.d.ts` files for explicit type declarations. You can edit them directly when testing.

A big part of the codebase manipulates the Abstract Syntax Tree (AST) of Svelte, Vue, and JSX. You can use https://svelte.dev/repl and https://astexplorer.net to view the AST when stepping through the code.

## Testing

No tests are set up at the moment. You can use the packages under `playground` as a manual testing environment when making changes.

## Pull requests

Pull request titles should preferably use the format of `<Verb> <something>`. First word is capitalized and singular. Examples:

- Fix docs styles
- Support JSX
- Update core options

Don't worry if it's not perfect! I'll tweak it before merging.

For commit messages, feel free to use your own convention and commit as much as you want. The pull request will be squashed merged into a single commit based on the pull request title.
