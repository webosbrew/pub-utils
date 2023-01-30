#!/usr/bin/env node
'use strict';
/**
 * Generate manifest.json for webOS Homebrew Channel publishing
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const semver = require('semver');

const {ArgumentParser} = require("argparse");
const parser = new ArgumentParser();

parser.add_argument('-a', '--appinfo', {required: true});
parser.add_argument('-p', '--pkgfile', {required: true});
parser.add_argument('-o', '--output', {required: false});
parser.add_argument('-i', '--icon', {required: true});
parser.add_argument('-l', '--link', {required: true});
parser.add_argument('-r', '--root', {required: false});
parser.add_argument('-w', '--webos-version', {required: false});

const args = parser.parse_args();

const outfile = args['output'];
let rootRequired = false;
if (args.root === 'optional') {
    rootRequired = 'optional';
} else if (args.root === 'true' || args.root === '1') {
    rootRequired = true;
}
const webOSVersionRequired = args['webos_version'];
if (webOSVersionRequired) {
    if (!semver.validRange(webOSVersionRequired)) {
        console.error('system-version argument is not valid:', webOSVersionRequired);
        process.exit(1);
        return;
    }
}

const appinfo = JSON.parse(fs.readFileSync(args.appinfo, {encoding: 'utf-8'}));

const pkghash = crypto.createHash('sha256').update(fs.readFileSync(args.pkgfile)).digest('hex');
const pkgfile = path.basename(args.pkgfile);

let manifest = {
    'id': appinfo.id,
    'version': appinfo.version,
    'type': appinfo.type,
    'title': appinfo.title,
    'appDescription': appinfo.appDescription,
    'iconUri': args.icon,
    'sourceUrl': args.link,
    'rootRequired': rootRequired,
    'webOSVersionRequired': webOSVersionRequired,
    'ipkUrl': pkgfile,
    'ipkHash': {
        'sha256': pkghash
    }
};
if (outfile) {
    fs.writeFileSync(outfile, JSON.stringify(manifest));
} else {
    process.stdout.write(JSON.stringify(manifest, null, 4));
}