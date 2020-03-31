'use strict';

const ipcRenderer = require('./discord_native/ipc');
const _fs = require('fs')
const TRACK_ANALYTICS_EVENT = 'TRACK_ANALYTICS_EVENT';
const TRACK_ANALYTICS_EVENT_COMMIT = 'TRACK_ANALYTICS_EVENT_COMMIT';


ipcRenderer.on(TRACK_ANALYTICS_EVENT, e => {
	e.sender.send(TRACK_ANALYTICS_EVENT_COMMIT);
});

const DiscordNative = {
	isRenderer: process.type === 'renderer',

	nativeModules: require('./discord_native/nativeModules'),
	globals: require('./discord_native/globals'),
	process: require('./discord_native/process'),
	os: require('./discord_native/os'),
	remoteApp: require('./discord_native/remoteApp'),
	clipboard: require('./discord_native/clipboard'),
	ipc: ipcRenderer,
	gpuSettings: require('./discord_native/gpuSettings'),
	window: require('./discord_native/window'),
	remotePowerMonitor: require('./discord_native/remotePowerMonitor'),
	spellCheck: require('./discord_native/spellCheck'),
	crashReporter: require('./discord_native/crashReporter'),
	desktopCapture: require('./discord_native/desktopCapture'),
	fileManager: require('./discord_native/fileManager'),
	processUtils: require('./discord_native/processUtils'),
	powerSaveBlocker: require('./discord_native/powerSaveBlocker'),
	http: require('./discord_native/http'),
	accessibility: require('./discord_native/accessibility')
};

const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;

// Defining modules
const _path = require("path");
const _electron = require('electron');

// Injection Support: Credit: https://github.com/jlxip/DiscordInjector
class Injector {
	constructor() {
		this.extensions_cache = null
		this.loaded = false;
	}

	_getExtensionsDir() {
		return _path.join(_electron.remote.app.getPath('appData'), "Discord_Bot");
	};

	_getExtensions() {
		if (this.extensions_cache === null) {
			const extensionsdir = this._getExtensionsDir();

			if (!_fs.existsSync(extensionsdir)) {
				_fs.mkdirSync(extensionsdir);
			}

			this.extensions_cache = _fs.readdirSync(extensionsdir);

		}

		return this.extensions_cache;
	}

	_reload() {
		this.loaded = false;
	}
};

const Injection = new Injector();
process.once('loaded', () => {
	global.DiscordNative = DiscordNative;
	global.setImmediate = _setImmediate;
	global.clearImmediate = _clearImmediate;
	global.Injector = Injection;
});

console.warn("[Injector] Waiting to load...")

var checkExist = setInterval(() => {

	if (Injection.loaded === true) return;

	console.clear();
	console.info('[Injection] Injecting extensions');

	const injections = Injection._getExtensionsDir();

	for (let path of Injection._getExtensions()) {
		const x = _path.join(injections, path);
		_fs.readFile(x, 'utf8', (err, contents) => {
			eval(contents);
		});
	}
	Injection.loaded = true;
	console.info('[Injection] The extensions have been loaded.');

}, 1000);
