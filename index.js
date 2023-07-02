import os from "node:os";
import fs from "node:fs";
import url from 'node:url';
import path from 'node:path';

const binPkgList = JSON.parse(
    fs.readFileSync(new URL('./package.json', import.meta.url), { encoding: 'utf8' })
).optionalDependencies;

const currentBinPkg = `@ffmpeg-binary/${os.platform()}-${os.arch()}`;
const currentBinName = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

function checkDeps() {
    const search = Object.entries(binPkgList).find(item => item[0] === currentBinPkg);
    return typeof search !== 'undefined' ? true : false;
}

let moduleUrl = '';
let binPath = null;

if (checkDeps()) {
    try {
        moduleUrl = await import(currentBinPkg);
    } catch(err) {
        console.error('@ffmpeg-binary/ffmpeg: An error occurred while loading the dependency module.');
        console.error(err);
    }

    try {
        binPath = path.resolve(path.dirname(url.fileURLToPath(moduleUrl.default)), currentBinName);
        fs.accessSync(binPath, fs.constants.R_OK);
    } catch(err) {
        console.error('@ffmpeg-binary/ffmpeg: An error occurred while verifying the binary.');
        console.error(err);
    }
} else {
    console.error('@ffmpeg-binary/ffmpeg: This module does not support the current platform or architecture.');
}

export default binPath;
