// tslint:disable:no-var-requires
/*
	Allows easier local debugging over SSH.
	Running `npm run deploy_local` updates remote adapter files
	and restarts the instance
*/

/*
	CONFIGURATION:
		- provide a deploy_password.json file in the project root with contents
			{
				"host": "<HOSTNAME>",
				"username": "<USERNAME>",
				"password": "<PASSWORD>"
			}
		- specify which dirs and files should be uploaded
		- specify where the root dir is relative to this script
*/
const uploadDirs = ["admin", "build"];
const uploadFiles = ["package.json", "io-package.json", "main.js"];
const rootDir = "../";

// =========================
// CAN'T TOUCH THIS
// =========================

import * as fs from "fs";
import * as nodeSSH from "node-ssh";
import * as path from "path";

const localRoot = path.resolve(__dirname, rootDir);

const ioPack = require(path.join(rootDir, "io-package.json"));
const ADAPTER_NAME = ioPack.common.name;

const ssh = new nodeSSH();
const sshConfig = require(path.join(rootDir, "deploy_password.json"));

const remoteRoot = `/opt/iobroker/node_modules/iobroker.${ADAPTER_NAME}`;

(async function main() {
	await ssh.connect(sshConfig);

	for (const dir of uploadDirs) {
		console.log(`uploading ${dir} dir from "${localRoot}" to "${remoteRoot}"...`);
		await ssh.putDirectory(path.join(localRoot, dir), path.join(remoteRoot, dir), {
			recursive: true,
			concurrency: 10,
			validate: (pathname) => {
				const basename = path.basename(pathname);
				return !basename.startsWith("deploy_");
			},
		});
	}
	for (const file of uploadFiles) {
		console.log(`uploading ${file} from "${localRoot}" to "${remoteRoot}"...`);
		await ssh.putFile(path.join(localRoot, file), path.join(remoteRoot, file));
	}

	// update in-mem adapter
	let execResult;
	console.log("updating in-mem adapter");
	execResult = await ssh.execCommand(`iobroker upload ${ADAPTER_NAME}`);
	console.log(execResult.stdout);
	console.log(execResult.stderr);
	execResult = await ssh.execCommand(`iobroker restart ${ADAPTER_NAME}`);
	console.log(execResult.stdout);
	console.log(execResult.stderr);

	console.log("done");
	return process.exit(0);
})();
