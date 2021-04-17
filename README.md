# Create redirects

A GitHub Action that builds redirect pages using `<meta http-equiv="refresh">` into a folder containing already-built static website files, allowing you to simulate routing rules on a static website host (such as Azure Blob Storage) that doesn't support routing rules.

## What you'll need

* A GitHub Actions workflow that builds your static website.
* A list of redirect files you want created in the JSON format described below.

## Usage

Here's an example of how to use the action in your workflow.

**.github/workflows/deploy.yml**

```yaml
name: Deploy website

on:
  workflow_dispatch:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    name: Build and deploy
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
      
    - name: Install Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 12.x
      
    - name: Build website
      run: |
        npm install
        npm run build
        
    - name: Create redirects
      uses: TravisSpomer/create-redirects@v1.0.0
      with:
        output-path: build
        routes: routes.json
        canonical-url: https://mysite.z22.web.core.windows.net
```

## Options

### `output-path`

*Required.* The location of your built site files, relative to the root of the repo.

For example, for a [Next.js site exported with `next export`](https://nextjs.org/docs/advanced-features/static-html-export), the generated static files are in a folder called `"out"`.

### `routes`

*Required.* The location of your routes.json file, relative to the root of the repo. This can be any location and does *not* have to be inside `output-path`. The file doesn't actually have to be called `routes.json` but you probably should.

### `canonical-url`

*Required.* The canonical URL of your published site.

## `routes.json` format

Specify the set of redirect files you want to create using a `routes.json` file. This file is in the same format as the one used in earlier preview versions of [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/routes#example-route-file). Only the `routes` array in this file is used; the rest is ignored.

```json
{
  "routes": [
    { "route": "/contact", "serve": "/email" },
    { "route": "/about.html", "serve": "https://example.com/about" }
  ]
}
```

Each object in the `routes` array has two properties:

* `route`: The path that will redirect to another location, relative to the root of the website and starting with a slash.
* `serve`: The path that `route` will redirect to. This can be a relative or absolute path, including on another server entirely.

---

This action is © 2021 Travis Spomer but released to the public domain under the [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0) license. This license does not apply to external libraries referenced by this action; only the action itself. It is provided as-is and no warranties are made as to its functionality or suitability.
