'use strict';

var core = require('@actions/core');
var github = require('@actions/github');
var storage = require('@google-cloud/storage');
var tmpPromise = require('tmp-promise');
var exec = require('@actions/exec');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var core__namespace = /*#__PURE__*/_interopNamespace(core);
var github__namespace = /*#__PURE__*/_interopNamespace(github);
var exec__namespace = /*#__PURE__*/_interopNamespace(exec);

var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod["GZIP"] = "gzip";
    CompressionMethod["ZSTD"] = "zstd";
})(CompressionMethod || (CompressionMethod = {}));

const extractTar = async (archivePath, compressionMethod, cwd) => {
    const compressionArgs = compressionMethod === CompressionMethod.GZIP ?
        [
            '-z',
        ] :
        [
            '--use-compress-program',
            'zstd -d --long=30',
        ];
    await exec__namespace.exec('tar', [
        '-x',
        ...compressionArgs,
        '-P',
        '-f',
        archivePath,
        '-C',
        cwd,
    ]);
};

const getExactMatch = async (bucket, key) => {
    const folderPrefix = `${github__namespace.context.repo.owner}/${github__namespace.context.repo.repo}`;
    core__namespace.debug(`Looking up ${folderPrefix}/${key}.tar`);
    const exactFile = bucket.file(`${folderPrefix}/${key}.tar`);
    let exactFileExists;
    try {
        exactFileExists = (await exactFile.exists())?.[0];
    }
    catch (error) {
        core__namespace.error('Failed to check if an exact match exists');
        throw error;
    }
    core__namespace.debug(`Exact file name: ${exactFile.name}.`);
    if (exactFileExists) {
        console.log(`🙌 Found exact match from cache for key '${key}'.`);
        return exactFile;
    }
    else {
        console.log(`🔸 No exact match found for key '${key}'.`);
        return null;
    }
};

const getInputs = () => {
    const inputs = {
        bucket: core__namespace.getInput('bucket', {
            required: true,
        }),
        key: core__namespace.getInput('key', {
            required: true,
        }),
        paths: core__namespace.getInput('paths', {
            required: true,
        })
            .split(/\n/u)
            .map((path) => {
            return path.trim();
        }),
    };
    core__namespace.debug(`Loaded inputs: ${JSON.stringify(inputs)}.`);
    return inputs;
};

const saveState = (state) => {
    core__namespace.debug(`Saving state: ${JSON.stringify(state)}.`);
    core__namespace.saveState('BUCKET', state.bucket);
    core__namespace.saveState('PATHS', state.paths);
    core__namespace.saveState('CACHE_HIT_KIND', state.cacheHitKind);
    core__namespace.saveState('TARGET_FILE_NAME', state.targetFileName);
};

const main = async () => {
    const inputs = getInputs();
    const bucket = new storage.Storage().bucket(inputs.bucket);
    const folderPrefix = `${github__namespace.context.repo.owner}/${github__namespace.context.repo.repo}`;
    const exactFileName = `${folderPrefix}/${inputs.key}.tar`;
    const bestMatch = await core__namespace.group('🔍 Searching the best cache archive available', () => {
        return getExactMatch(bucket, inputs.key);
    });
    core__namespace.debug(`Best match kind: ${bestMatch}.`);
    if (!bestMatch) {
        saveState({
            bucket: inputs.bucket,
            cacheHitKind: 'none',
            paths: inputs.paths,
            targetFileName: exactFileName,
        });
        core__namespace.setOutput('cache-hit', 'false');
        console.log('😢 No cache candidate found.');
        return;
    }
    core__namespace.debug(`Best match name: ${bestMatch.name}.`);
    const bestMatchMetadata = await bestMatch
        .getMetadata()
        .then(([metadata,]) => {
        return metadata;
    })
        .catch((error) => {
        core__namespace.error('Failed to read object metadata');
        throw error;
    });
    core__namespace.debug(`Best match metadata: ${JSON.stringify(bestMatchMetadata)}.`);
    const compressionMethod = bestMatchMetadata?.metadata?.['cache-action-compression-method'];
    core__namespace.debug(`Best match compression method: ${compressionMethod}.`);
    if (!bestMatchMetadata || !compressionMethod) {
        saveState({
            bucket: inputs.bucket,
            cacheHitKind: 'none',
            paths: inputs.paths,
            targetFileName: exactFileName,
        });
        core__namespace.setOutput('cache-hit', 'false');
        core__namespace.info('😢 No cache candidate found (missing metadata).');
        return;
    }
    // eslint-disable-next-line node/no-process-env
    const workspace = process.env.GITHUB_WORKSPACE ?? process.cwd();
    await tmpPromise.withFile(async (temporaryFile) => {
        try {
            await core__namespace
                .group('🌐 Downloading cache archive from bucket', async () => {
                console.log(`🔹 Downloading file '${bestMatch.name}'...`);
                await bestMatch.download({
                    destination: temporaryFile.path,
                });
            });
        }
        catch (error) {
            core__namespace.error('Failed to download the file');
            throw error;
        }
        try {
            await core__namespace
                .group('🗜️ Extracting cache archive', () => {
                core__namespace.info(`🔹 Detected '${compressionMethod}' compression method from object metadata.`);
                return extractTar(temporaryFile.path, compressionMethod, workspace);
            });
        }
        catch (error) {
            core__namespace.error('Failed to extract the archive');
            throw error;
        }
        saveState({
            bucket: inputs.bucket,
            cacheHitKind: 'exact',
            paths: inputs.paths,
            targetFileName: exactFileName,
        });
        core__namespace.setOutput('cache-hit', 'true');
        console.log('✅ Successfully restored cache.');
    });
};
void main()
    .catch((error) => {
    core__namespace.setFailed(error.message);
});
