# Google Cloud Storage Cache Action for GitHub

[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

This GitHub action is equivalent to [`@actions/cache`](https://github.com/actions/cache) except that it stores and retrieves the resulting cache artifacts in/from a Google Cloud Storage (GCS) bucket.

* [Usage](#usage)
* [API](#api)
  * [Inputs](#inputs)
  * [Outputs](#outputs)
* [Compression Algorithm](#compression-algorithm)
* [FAQ](#faq)

## Usage

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v0
  with:
    workload_identity_provider: projects/your-project-id/locations/global/workloadIdentityPools/your-identity-pool/providers/your-provider
    service_account: github-ci@your-project.iam.gserviceaccount.com
- name: Cache the node_modules
  id: node-modules-cache
  uses: gajus/gcs-cache-action@[replace with the current version]
  with:
    bucket: bucket-name
    path: node_modules
    key: node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      node-modules-${{ runner.os }}-
- name: Install dependencies
  if: steps.node-modules-cache.outputs.cache-hit == 'false'
  run: npm ci
```

## API

### Inputs

This GitHub action can take several inputs to configure its behaviors:

|Name|Type|Example|Description|
|---|---|---|---|
|`bucket`|`string`|`my-ci-cache`|The name of the Google Cloud Storage bucket to use.|
|`paths`|`string[]`|`node_modules`|Paths to store (one per line).|
|`key`|`string`|`${{ hashFiles('package-lock.json') }}`|Cache identifier.|

### Outputs

This GitHub action will output the following values:

|Name|Type|Description|
|---|---|---|
|`cache-hit`|`string`|A boolean string ("true" or "false") representing if the cache was successfully restored.|

## Compression Algorithm

When compressing or decompressing the cache archive, the action will lookup for the best compression algorithm to use. If `zstd` is available, it will be used instead of `gzip` by default.

The compression method will be added to the object's metadata on the Bucket. Thanks to this, when decompressing, the correct algorithm will be used.

## FAQ

### Can I use this action on multiple repositories with the same bucket?

Yes you can. When storing to the bucket, this action will use the following the following path:

```
[repository owner]/[repository name]/[cache key].tar
```

### What is the difference from `MansaGroup/gcs-cache-action`?

Large parts of the codebase were adopted from [MansaGroup/gcs-cache-action](https://github.com/MansaGroup/gcs-cache-action) (as is reflected in [LICENSE](./LICENSE)).

However, compared to `MansaGroup/gcs-cache-action`, `gcs-cache`:

* Includes thorough tests
* Gracefully handles failures in [`post` stage](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runspost) (uploading cache)
* Does not support `zstd` version below v1.3.2
* Does not support Windows
* Does not support `restore-keys`

Other features may get restored in the future. However, the priority was to roll out the key functionality and cover it with tests.