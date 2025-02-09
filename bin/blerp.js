"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
	function __require() {
		return (
			mod ||
				(0, cb[__getOwnPropNames(cb)[0]])(
					(mod = { exports: {} }).exports,
					mod,
				),
			mod.exports
		);
	};
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === "object") || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable:
						!(desc = __getOwnPropDesc(from, key)) ||
						desc.enumerable,
				});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		// If the importer is in node compatibility mode or this is not an ESM
		// file that has been converted to a CommonJS file using a Babel-
		// compatible transform (i.e. "__esModule" has not been set), then set
		// "default" to the CommonJS "module.exports" for node compatibility.
		isNodeMode || !mod || !mod.__esModule
			? __defProp(target, "default", { value: mod, enumerable: true })
			: target,
		mod,
	)
);

// node_modules/alcalzone-shared/typeguards/index.js
var require_typeguards = __commonJS({
	"node_modules/alcalzone-shared/typeguards/index.js"(exports) {
		"use strict";
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.isArray = exports.isObject = void 0;
		function isObject2(it) {
			return Object.prototype.toString.call(it) === "[object Object]";
		}
		exports.isObject = isObject2;
		function isArray2(it) {
			if (Array.isArray != null) return Array.isArray(it);
			return Object.prototype.toString.call(it) === "[object Array]";
		}
		exports.isArray = isArray2;
	},
});

// node_modules/y18n/build/index.cjs
var require_build = __commonJS({
	"node_modules/y18n/build/index.cjs"(exports, module2) {
		"use strict";
		var fs = require("fs");
		var util = require("util");
		var path = require("path");
		var shim;
		var Y18N = class {
			constructor(opts) {
				opts = opts || {};
				this.directory = opts.directory || "./locales";
				this.updateFiles =
					typeof opts.updateFiles === "boolean"
						? opts.updateFiles
						: true;
				this.locale = opts.locale || "en";
				this.fallbackToLanguage =
					typeof opts.fallbackToLanguage === "boolean"
						? opts.fallbackToLanguage
						: true;
				this.cache = /* @__PURE__ */ Object.create(null);
				this.writeQueue = [];
			}
			__(...args) {
				if (typeof arguments[0] !== "string") {
					return this._taggedLiteral(arguments[0], ...arguments);
				}
				const str = args.shift();
				let cb = function () {};
				if (typeof args[args.length - 1] === "function")
					cb = args.pop();
				cb = cb || function () {};
				if (!this.cache[this.locale]) this._readLocaleFile();
				if (!this.cache[this.locale][str] && this.updateFiles) {
					this.cache[this.locale][str] = str;
					this._enqueueWrite({
						directory: this.directory,
						locale: this.locale,
						cb,
					});
				} else {
					cb();
				}
				return shim.format.apply(
					shim.format,
					[this.cache[this.locale][str] || str].concat(args),
				);
			}
			__n() {
				const args = Array.prototype.slice.call(arguments);
				const singular = args.shift();
				const plural = args.shift();
				const quantity = args.shift();
				let cb = function () {};
				if (typeof args[args.length - 1] === "function")
					cb = args.pop();
				if (!this.cache[this.locale]) this._readLocaleFile();
				let str = quantity === 1 ? singular : plural;
				if (this.cache[this.locale][singular]) {
					const entry = this.cache[this.locale][singular];
					str = entry[quantity === 1 ? "one" : "other"];
				}
				if (!this.cache[this.locale][singular] && this.updateFiles) {
					this.cache[this.locale][singular] = {
						one: singular,
						other: plural,
					};
					this._enqueueWrite({
						directory: this.directory,
						locale: this.locale,
						cb,
					});
				} else {
					cb();
				}
				const values = [str];
				if (~str.indexOf("%d")) values.push(quantity);
				return shim.format.apply(shim.format, values.concat(args));
			}
			setLocale(locale) {
				this.locale = locale;
			}
			getLocale() {
				return this.locale;
			}
			updateLocale(obj) {
				if (!this.cache[this.locale]) this._readLocaleFile();
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						this.cache[this.locale][key] = obj[key];
					}
				}
			}
			_taggedLiteral(parts, ...args) {
				let str = "";
				parts.forEach(function (part, i) {
					const arg = args[i + 1];
					str += part;
					if (typeof arg !== "undefined") {
						str += "%s";
					}
				});
				return this.__.apply(
					this,
					[str].concat([].slice.call(args, 1)),
				);
			}
			_enqueueWrite(work) {
				this.writeQueue.push(work);
				if (this.writeQueue.length === 1) this._processWriteQueue();
			}
			_processWriteQueue() {
				const _this = this;
				const work = this.writeQueue[0];
				const directory = work.directory;
				const locale = work.locale;
				const cb = work.cb;
				const languageFile = this._resolveLocaleFile(directory, locale);
				const serializedLocale = JSON.stringify(
					this.cache[locale],
					null,
					2,
				);
				shim.fs.writeFile(
					languageFile,
					serializedLocale,
					"utf-8",
					function (err) {
						_this.writeQueue.shift();
						if (_this.writeQueue.length > 0)
							_this._processWriteQueue();
						cb(err);
					},
				);
			}
			_readLocaleFile() {
				let localeLookup = {};
				const languageFile = this._resolveLocaleFile(
					this.directory,
					this.locale,
				);
				try {
					if (shim.fs.readFileSync) {
						localeLookup = JSON.parse(
							shim.fs.readFileSync(languageFile, "utf-8"),
						);
					}
				} catch (err) {
					if (err instanceof SyntaxError) {
						err.message = "syntax error in " + languageFile;
					}
					if (err.code === "ENOENT") localeLookup = {};
					else throw err;
				}
				this.cache[this.locale] = localeLookup;
			}
			_resolveLocaleFile(directory, locale) {
				let file = shim.resolve(directory, "./", locale + ".json");
				if (
					this.fallbackToLanguage &&
					!this._fileExistsSync(file) &&
					~locale.lastIndexOf("_")
				) {
					const languageFile = shim.resolve(
						directory,
						"./",
						locale.split("_")[0] + ".json",
					);
					if (this._fileExistsSync(languageFile)) file = languageFile;
				}
				return file;
			}
			_fileExistsSync(file) {
				return shim.exists(file);
			}
		};
		function y18n$1(opts, _shim) {
			shim = _shim;
			const y18n2 = new Y18N(opts);
			return {
				__: y18n2.__.bind(y18n2),
				__n: y18n2.__n.bind(y18n2),
				setLocale: y18n2.setLocale.bind(y18n2),
				getLocale: y18n2.getLocale.bind(y18n2),
				updateLocale: y18n2.updateLocale.bind(y18n2),
				locale: y18n2.locale,
			};
		}
		var nodePlatformShim = {
			fs: {
				readFileSync: fs.readFileSync,
				writeFile: fs.writeFile,
			},
			format: util.format,
			resolve: path.resolve,
			exists: (file) => {
				try {
					return fs.statSync(file).isFile();
				} catch (err) {
					return false;
				}
			},
		};
		var y18n = (opts) => {
			return y18n$1(opts, nodePlatformShim);
		};
		module2.exports = y18n;
	},
});

// node_modules/yargs-parser/build/index.cjs
var require_build2 = __commonJS({
	"node_modules/yargs-parser/build/index.cjs"(exports, module2) {
		"use strict";
		var util = require("util");
		var path = require("path");
		var fs = require("fs");
		function camelCase(str) {
			const isCamelCase =
				str !== str.toLowerCase() && str !== str.toUpperCase();
			if (!isCamelCase) {
				str = str.toLowerCase();
			}
			if (str.indexOf("-") === -1 && str.indexOf("_") === -1) {
				return str;
			} else {
				let camelcase = "";
				let nextChrUpper = false;
				const leadingHyphens = str.match(/^-+/);
				for (
					let i = leadingHyphens ? leadingHyphens[0].length : 0;
					i < str.length;
					i++
				) {
					let chr = str.charAt(i);
					if (nextChrUpper) {
						nextChrUpper = false;
						chr = chr.toUpperCase();
					}
					if (i !== 0 && (chr === "-" || chr === "_")) {
						nextChrUpper = true;
					} else if (chr !== "-" && chr !== "_") {
						camelcase += chr;
					}
				}
				return camelcase;
			}
		}
		function decamelize(str, joinString) {
			const lowercase = str.toLowerCase();
			joinString = joinString || "-";
			let notCamelcase = "";
			for (let i = 0; i < str.length; i++) {
				const chrLower = lowercase.charAt(i);
				const chrString = str.charAt(i);
				if (chrLower !== chrString && i > 0) {
					notCamelcase += `${joinString}${lowercase.charAt(i)}`;
				} else {
					notCamelcase += chrString;
				}
			}
			return notCamelcase;
		}
		function looksLikeNumber(x) {
			if (x === null || x === void 0) return false;
			if (typeof x === "number") return true;
			if (/^0x[0-9a-f]+$/i.test(x)) return true;
			if (/^0[^.]/.test(x)) return false;
			return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
		}
		function tokenizeArgString(argString) {
			if (Array.isArray(argString)) {
				return argString.map((e) =>
					typeof e !== "string" ? e + "" : e,
				);
			}
			argString = argString.trim();
			let i = 0;
			let prevC = null;
			let c = null;
			let opening = null;
			const args = [];
			for (let ii = 0; ii < argString.length; ii++) {
				prevC = c;
				c = argString.charAt(ii);
				if (c === " " && !opening) {
					if (!(prevC === " ")) {
						i++;
					}
					continue;
				}
				if (c === opening) {
					opening = null;
				} else if ((c === "'" || c === '"') && !opening) {
					opening = c;
				}
				if (!args[i]) args[i] = "";
				args[i] += c;
			}
			return args;
		}
		var DefaultValuesForTypeKey;
		(function (DefaultValuesForTypeKey2) {
			DefaultValuesForTypeKey2["BOOLEAN"] = "boolean";
			DefaultValuesForTypeKey2["STRING"] = "string";
			DefaultValuesForTypeKey2["NUMBER"] = "number";
			DefaultValuesForTypeKey2["ARRAY"] = "array";
		})(DefaultValuesForTypeKey || (DefaultValuesForTypeKey = {}));
		var mixin;
		var YargsParser = class {
			constructor(_mixin) {
				mixin = _mixin;
			}
			parse(argsInput, options) {
				const opts = Object.assign(
					{
						alias: void 0,
						array: void 0,
						boolean: void 0,
						config: void 0,
						configObjects: void 0,
						configuration: void 0,
						coerce: void 0,
						count: void 0,
						default: void 0,
						envPrefix: void 0,
						narg: void 0,
						normalize: void 0,
						string: void 0,
						number: void 0,
						__: void 0,
						key: void 0,
					},
					options,
				);
				const args = tokenizeArgString(argsInput);
				const inputIsString = typeof argsInput === "string";
				const aliases = combineAliases(
					Object.assign(
						/* @__PURE__ */ Object.create(null),
						opts.alias,
					),
				);
				const configuration = Object.assign(
					{
						"boolean-negation": true,
						"camel-case-expansion": true,
						"combine-arrays": false,
						"dot-notation": true,
						"duplicate-arguments-array": true,
						"flatten-duplicate-arrays": true,
						"greedy-arrays": true,
						"halt-at-non-option": false,
						"nargs-eats-options": false,
						"negation-prefix": "no-",
						"parse-numbers": true,
						"parse-positional-numbers": true,
						"populate--": false,
						"set-placeholder-key": false,
						"short-option-groups": true,
						"strip-aliased": false,
						"strip-dashed": false,
						"unknown-options-as-args": false,
					},
					opts.configuration,
				);
				const defaults = Object.assign(
					/* @__PURE__ */ Object.create(null),
					opts.default,
				);
				const configObjects = opts.configObjects || [];
				const envPrefix = opts.envPrefix;
				const notFlagsOption = configuration["populate--"];
				const notFlagsArgv = notFlagsOption ? "--" : "_";
				const newAliases = /* @__PURE__ */ Object.create(null);
				const defaulted = /* @__PURE__ */ Object.create(null);
				const __ = opts.__ || mixin.format;
				const flags = {
					aliases: /* @__PURE__ */ Object.create(null),
					arrays: /* @__PURE__ */ Object.create(null),
					bools: /* @__PURE__ */ Object.create(null),
					strings: /* @__PURE__ */ Object.create(null),
					numbers: /* @__PURE__ */ Object.create(null),
					counts: /* @__PURE__ */ Object.create(null),
					normalize: /* @__PURE__ */ Object.create(null),
					configs: /* @__PURE__ */ Object.create(null),
					nargs: /* @__PURE__ */ Object.create(null),
					coercions: /* @__PURE__ */ Object.create(null),
					keys: [],
				};
				const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
				const negatedBoolean = new RegExp(
					"^--" + configuration["negation-prefix"] + "(.+)",
				);
				[]
					.concat(opts.array || [])
					.filter(Boolean)
					.forEach(function (opt) {
						const key = typeof opt === "object" ? opt.key : opt;
						const assignment = Object.keys(opt)
							.map(function (key2) {
								const arrayFlagKeys = {
									boolean: "bools",
									string: "strings",
									number: "numbers",
								};
								return arrayFlagKeys[key2];
							})
							.filter(Boolean)
							.pop();
						if (assignment) {
							flags[assignment][key] = true;
						}
						flags.arrays[key] = true;
						flags.keys.push(key);
					});
				[]
					.concat(opts.boolean || [])
					.filter(Boolean)
					.forEach(function (key) {
						flags.bools[key] = true;
						flags.keys.push(key);
					});
				[]
					.concat(opts.string || [])
					.filter(Boolean)
					.forEach(function (key) {
						flags.strings[key] = true;
						flags.keys.push(key);
					});
				[]
					.concat(opts.number || [])
					.filter(Boolean)
					.forEach(function (key) {
						flags.numbers[key] = true;
						flags.keys.push(key);
					});
				[]
					.concat(opts.count || [])
					.filter(Boolean)
					.forEach(function (key) {
						flags.counts[key] = true;
						flags.keys.push(key);
					});
				[]
					.concat(opts.normalize || [])
					.filter(Boolean)
					.forEach(function (key) {
						flags.normalize[key] = true;
						flags.keys.push(key);
					});
				if (typeof opts.narg === "object") {
					Object.entries(opts.narg).forEach(([key, value]) => {
						if (typeof value === "number") {
							flags.nargs[key] = value;
							flags.keys.push(key);
						}
					});
				}
				if (typeof opts.coerce === "object") {
					Object.entries(opts.coerce).forEach(([key, value]) => {
						if (typeof value === "function") {
							flags.coercions[key] = value;
							flags.keys.push(key);
						}
					});
				}
				if (typeof opts.config !== "undefined") {
					if (
						Array.isArray(opts.config) ||
						typeof opts.config === "string"
					) {
						[]
							.concat(opts.config)
							.filter(Boolean)
							.forEach(function (key) {
								flags.configs[key] = true;
							});
					} else if (typeof opts.config === "object") {
						Object.entries(opts.config).forEach(([key, value]) => {
							if (
								typeof value === "boolean" ||
								typeof value === "function"
							) {
								flags.configs[key] = value;
							}
						});
					}
				}
				extendAliases(opts.key, aliases, opts.default, flags.arrays);
				Object.keys(defaults).forEach(function (key) {
					(flags.aliases[key] || []).forEach(function (alias) {
						defaults[alias] = defaults[key];
					});
				});
				let error = null;
				checkConfiguration();
				let notFlags = [];
				const argv2 = Object.assign(
					/* @__PURE__ */ Object.create(null),
					{ _: [] },
				);
				const argvReturn = {};
				for (let i = 0; i < args.length; i++) {
					const arg = args[i];
					const truncatedArg = arg.replace(/^-{3,}/, "---");
					let broken;
					let key;
					let letters;
					let m;
					let next;
					let value;
					if (arg !== "--" && isUnknownOptionAsArg(arg)) {
						pushPositional(arg);
					} else if (truncatedArg.match(/---+(=|$)/)) {
						pushPositional(arg);
						continue;
					} else if (
						arg.match(/^--.+=/) ||
						(!configuration["short-option-groups"] &&
							arg.match(/^-.+=/))
					) {
						m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
						if (m !== null && Array.isArray(m) && m.length >= 3) {
							if (checkAllAliases(m[1], flags.arrays)) {
								i = eatArray(i, m[1], args, m[2]);
							} else if (
								checkAllAliases(m[1], flags.nargs) !== false
							) {
								i = eatNargs(i, m[1], args, m[2]);
							} else {
								setArg(m[1], m[2], true);
							}
						}
					} else if (
						arg.match(negatedBoolean) &&
						configuration["boolean-negation"]
					) {
						m = arg.match(negatedBoolean);
						if (m !== null && Array.isArray(m) && m.length >= 2) {
							key = m[1];
							setArg(
								key,
								checkAllAliases(key, flags.arrays)
									? [false]
									: false,
							);
						}
					} else if (
						arg.match(/^--.+/) ||
						(!configuration["short-option-groups"] &&
							arg.match(/^-[^-]+/))
					) {
						m = arg.match(/^--?(.+)/);
						if (m !== null && Array.isArray(m) && m.length >= 2) {
							key = m[1];
							if (checkAllAliases(key, flags.arrays)) {
								i = eatArray(i, key, args);
							} else if (
								checkAllAliases(key, flags.nargs) !== false
							) {
								i = eatNargs(i, key, args);
							} else {
								next = args[i + 1];
								if (
									next !== void 0 &&
									(!next.match(/^-/) ||
										next.match(negative)) &&
									!checkAllAliases(key, flags.bools) &&
									!checkAllAliases(key, flags.counts)
								) {
									setArg(key, next);
									i++;
								} else if (/^(true|false)$/.test(next)) {
									setArg(key, next);
									i++;
								} else {
									setArg(key, defaultValue(key));
								}
							}
						}
					} else if (arg.match(/^-.\..+=/)) {
						m = arg.match(/^-([^=]+)=([\s\S]*)$/);
						if (m !== null && Array.isArray(m) && m.length >= 3) {
							setArg(m[1], m[2]);
						}
					} else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
						next = args[i + 1];
						m = arg.match(/^-(.\..+)/);
						if (m !== null && Array.isArray(m) && m.length >= 2) {
							key = m[1];
							if (
								next !== void 0 &&
								!next.match(/^-/) &&
								!checkAllAliases(key, flags.bools) &&
								!checkAllAliases(key, flags.counts)
							) {
								setArg(key, next);
								i++;
							} else {
								setArg(key, defaultValue(key));
							}
						}
					} else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
						letters = arg.slice(1, -1).split("");
						broken = false;
						for (let j = 0; j < letters.length; j++) {
							next = arg.slice(j + 2);
							if (letters[j + 1] && letters[j + 1] === "=") {
								value = arg.slice(j + 3);
								key = letters[j];
								if (checkAllAliases(key, flags.arrays)) {
									i = eatArray(i, key, args, value);
								} else if (
									checkAllAliases(key, flags.nargs) !== false
								) {
									i = eatNargs(i, key, args, value);
								} else {
									setArg(key, value);
								}
								broken = true;
								break;
							}
							if (next === "-") {
								setArg(letters[j], next);
								continue;
							}
							if (
								/[A-Za-z]/.test(letters[j]) &&
								/^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) &&
								checkAllAliases(next, flags.bools) === false
							) {
								setArg(letters[j], next);
								broken = true;
								break;
							}
							if (letters[j + 1] && letters[j + 1].match(/\W/)) {
								setArg(letters[j], next);
								broken = true;
								break;
							} else {
								setArg(letters[j], defaultValue(letters[j]));
							}
						}
						key = arg.slice(-1)[0];
						if (!broken && key !== "-") {
							if (checkAllAliases(key, flags.arrays)) {
								i = eatArray(i, key, args);
							} else if (
								checkAllAliases(key, flags.nargs) !== false
							) {
								i = eatNargs(i, key, args);
							} else {
								next = args[i + 1];
								if (
									next !== void 0 &&
									(!/^(-|--)[^-]/.test(next) ||
										next.match(negative)) &&
									!checkAllAliases(key, flags.bools) &&
									!checkAllAliases(key, flags.counts)
								) {
									setArg(key, next);
									i++;
								} else if (/^(true|false)$/.test(next)) {
									setArg(key, next);
									i++;
								} else {
									setArg(key, defaultValue(key));
								}
							}
						}
					} else if (
						arg.match(/^-[0-9]$/) &&
						arg.match(negative) &&
						checkAllAliases(arg.slice(1), flags.bools)
					) {
						key = arg.slice(1);
						setArg(key, defaultValue(key));
					} else if (arg === "--") {
						notFlags = args.slice(i + 1);
						break;
					} else if (configuration["halt-at-non-option"]) {
						notFlags = args.slice(i);
						break;
					} else {
						pushPositional(arg);
					}
				}
				applyEnvVars(argv2, true);
				applyEnvVars(argv2, false);
				setConfig(argv2);
				setConfigObjects();
				applyDefaultsAndAliases(argv2, flags.aliases, defaults, true);
				applyCoercions(argv2);
				if (configuration["set-placeholder-key"])
					setPlaceholderKeys(argv2);
				Object.keys(flags.counts).forEach(function (key) {
					if (!hasKey(argv2, key.split("."))) setArg(key, 0);
				});
				if (notFlagsOption && notFlags.length) argv2[notFlagsArgv] = [];
				notFlags.forEach(function (key) {
					argv2[notFlagsArgv].push(key);
				});
				if (
					configuration["camel-case-expansion"] &&
					configuration["strip-dashed"]
				) {
					Object.keys(argv2)
						.filter((key) => key !== "--" && key.includes("-"))
						.forEach((key) => {
							delete argv2[key];
						});
				}
				if (configuration["strip-aliased"]) {
					[]
						.concat(...Object.keys(aliases).map((k) => aliases[k]))
						.forEach((alias) => {
							if (
								configuration["camel-case-expansion"] &&
								alias.includes("-")
							) {
								delete argv2[
									alias
										.split(".")
										.map((prop) => camelCase(prop))
										.join(".")
								];
							}
							delete argv2[alias];
						});
				}
				function pushPositional(arg) {
					const maybeCoercedNumber = maybeCoerceNumber("_", arg);
					if (
						typeof maybeCoercedNumber === "string" ||
						typeof maybeCoercedNumber === "number"
					) {
						argv2._.push(maybeCoercedNumber);
					}
				}
				function eatNargs(i, key, args2, argAfterEqualSign) {
					let ii;
					let toEat = checkAllAliases(key, flags.nargs);
					toEat =
						typeof toEat !== "number" || isNaN(toEat) ? 1 : toEat;
					if (toEat === 0) {
						if (!isUndefined(argAfterEqualSign)) {
							error = Error(
								__("Argument unexpected for: %s", key),
							);
						}
						setArg(key, defaultValue(key));
						return i;
					}
					let available = isUndefined(argAfterEqualSign) ? 0 : 1;
					if (configuration["nargs-eats-options"]) {
						if (args2.length - (i + 1) + available < toEat) {
							error = Error(
								__("Not enough arguments following: %s", key),
							);
						}
						available = toEat;
					} else {
						for (ii = i + 1; ii < args2.length; ii++) {
							if (
								!args2[ii].match(/^-[^0-9]/) ||
								args2[ii].match(negative) ||
								isUnknownOptionAsArg(args2[ii])
							)
								available++;
							else break;
						}
						if (available < toEat)
							error = Error(
								__("Not enough arguments following: %s", key),
							);
					}
					let consumed = Math.min(available, toEat);
					if (!isUndefined(argAfterEqualSign) && consumed > 0) {
						setArg(key, argAfterEqualSign);
						consumed--;
					}
					for (ii = i + 1; ii < consumed + i + 1; ii++) {
						setArg(key, args2[ii]);
					}
					return i + consumed;
				}
				function eatArray(i, key, args2, argAfterEqualSign) {
					let argsToSet = [];
					let next = argAfterEqualSign || args2[i + 1];
					const nargsCount = checkAllAliases(key, flags.nargs);
					if (
						checkAllAliases(key, flags.bools) &&
						!/^(true|false)$/.test(next)
					) {
						argsToSet.push(true);
					} else if (
						isUndefined(next) ||
						(isUndefined(argAfterEqualSign) &&
							/^-/.test(next) &&
							!negative.test(next) &&
							!isUnknownOptionAsArg(next))
					) {
						if (defaults[key] !== void 0) {
							const defVal = defaults[key];
							argsToSet = Array.isArray(defVal)
								? defVal
								: [defVal];
						}
					} else {
						if (!isUndefined(argAfterEqualSign)) {
							argsToSet.push(
								processValue(key, argAfterEqualSign, true),
							);
						}
						for (let ii = i + 1; ii < args2.length; ii++) {
							if (
								(!configuration["greedy-arrays"] &&
									argsToSet.length > 0) ||
								(nargsCount &&
									typeof nargsCount === "number" &&
									argsToSet.length >= nargsCount)
							)
								break;
							next = args2[ii];
							if (
								/^-/.test(next) &&
								!negative.test(next) &&
								!isUnknownOptionAsArg(next)
							)
								break;
							i = ii;
							argsToSet.push(
								processValue(key, next, inputIsString),
							);
						}
					}
					if (
						typeof nargsCount === "number" &&
						((nargsCount && argsToSet.length < nargsCount) ||
							(isNaN(nargsCount) && argsToSet.length === 0))
					) {
						error = Error(
							__("Not enough arguments following: %s", key),
						);
					}
					setArg(key, argsToSet);
					return i;
				}
				function setArg(key, val, shouldStripQuotes = inputIsString) {
					if (
						/-/.test(key) &&
						configuration["camel-case-expansion"]
					) {
						const alias = key
							.split(".")
							.map(function (prop) {
								return camelCase(prop);
							})
							.join(".");
						addNewAlias(key, alias);
					}
					const value = processValue(key, val, shouldStripQuotes);
					const splitKey = key.split(".");
					setKey(argv2, splitKey, value);
					if (flags.aliases[key]) {
						flags.aliases[key].forEach(function (x) {
							const keyProperties = x.split(".");
							setKey(argv2, keyProperties, value);
						});
					}
					if (splitKey.length > 1 && configuration["dot-notation"]) {
						(flags.aliases[splitKey[0]] || []).forEach(
							function (x) {
								let keyProperties = x.split(".");
								const a = [].concat(splitKey);
								a.shift();
								keyProperties = keyProperties.concat(a);
								if (
									!(flags.aliases[key] || []).includes(
										keyProperties.join("."),
									)
								) {
									setKey(argv2, keyProperties, value);
								}
							},
						);
					}
					if (
						checkAllAliases(key, flags.normalize) &&
						!checkAllAliases(key, flags.arrays)
					) {
						const keys = [key].concat(flags.aliases[key] || []);
						keys.forEach(function (key2) {
							Object.defineProperty(argvReturn, key2, {
								enumerable: true,
								get() {
									return val;
								},
								set(value2) {
									val =
										typeof value2 === "string"
											? mixin.normalize(value2)
											: value2;
								},
							});
						});
					}
				}
				function addNewAlias(key, alias) {
					if (!(flags.aliases[key] && flags.aliases[key].length)) {
						flags.aliases[key] = [alias];
						newAliases[alias] = true;
					}
					if (
						!(flags.aliases[alias] && flags.aliases[alias].length)
					) {
						addNewAlias(alias, key);
					}
				}
				function processValue(key, val, shouldStripQuotes) {
					if (shouldStripQuotes) {
						val = stripQuotes(val);
					}
					if (
						checkAllAliases(key, flags.bools) ||
						checkAllAliases(key, flags.counts)
					) {
						if (typeof val === "string") val = val === "true";
					}
					let value = Array.isArray(val)
						? val.map(function (v) {
								return maybeCoerceNumber(key, v);
							})
						: maybeCoerceNumber(key, val);
					if (
						checkAllAliases(key, flags.counts) &&
						(isUndefined(value) || typeof value === "boolean")
					) {
						value = increment();
					}
					if (
						checkAllAliases(key, flags.normalize) &&
						checkAllAliases(key, flags.arrays)
					) {
						if (Array.isArray(val))
							value = val.map((val2) => {
								return mixin.normalize(val2);
							});
						else value = mixin.normalize(val);
					}
					return value;
				}
				function maybeCoerceNumber(key, value) {
					if (
						!configuration["parse-positional-numbers"] &&
						key === "_"
					)
						return value;
					if (
						!checkAllAliases(key, flags.strings) &&
						!checkAllAliases(key, flags.bools) &&
						!Array.isArray(value)
					) {
						const shouldCoerceNumber =
							looksLikeNumber(value) &&
							configuration["parse-numbers"] &&
							Number.isSafeInteger(
								Math.floor(parseFloat(`${value}`)),
							);
						if (
							shouldCoerceNumber ||
							(!isUndefined(value) &&
								checkAllAliases(key, flags.numbers))
						) {
							value = Number(value);
						}
					}
					return value;
				}
				function setConfig(argv3) {
					const configLookup = /* @__PURE__ */ Object.create(null);
					applyDefaultsAndAliases(
						configLookup,
						flags.aliases,
						defaults,
					);
					Object.keys(flags.configs).forEach(function (configKey) {
						const configPath =
							argv3[configKey] || configLookup[configKey];
						if (configPath) {
							try {
								let config = null;
								const resolvedConfigPath = mixin.resolve(
									mixin.cwd(),
									configPath,
								);
								const resolveConfig = flags.configs[configKey];
								if (typeof resolveConfig === "function") {
									try {
										config =
											resolveConfig(resolvedConfigPath);
									} catch (e) {
										config = e;
									}
									if (config instanceof Error) {
										error = config;
										return;
									}
								} else {
									config = mixin.require(resolvedConfigPath);
								}
								setConfigObject(config);
							} catch (ex) {
								if (ex.name === "PermissionDenied") error = ex;
								else if (argv3[configKey])
									error = Error(
										__(
											"Invalid JSON config file: %s",
											configPath,
										),
									);
							}
						}
					});
				}
				function setConfigObject(config, prev) {
					Object.keys(config).forEach(function (key) {
						const value = config[key];
						const fullKey = prev ? prev + "." + key : key;
						if (
							typeof value === "object" &&
							value !== null &&
							!Array.isArray(value) &&
							configuration["dot-notation"]
						) {
							setConfigObject(value, fullKey);
						} else {
							if (
								!hasKey(argv2, fullKey.split(".")) ||
								(checkAllAliases(fullKey, flags.arrays) &&
									configuration["combine-arrays"])
							) {
								setArg(fullKey, value);
							}
						}
					});
				}
				function setConfigObjects() {
					if (typeof configObjects !== "undefined") {
						configObjects.forEach(function (configObject) {
							setConfigObject(configObject);
						});
					}
				}
				function applyEnvVars(argv3, configOnly) {
					if (typeof envPrefix === "undefined") return;
					const prefix =
						typeof envPrefix === "string" ? envPrefix : "";
					const env2 = mixin.env();
					Object.keys(env2).forEach(function (envVar) {
						if (
							prefix === "" ||
							envVar.lastIndexOf(prefix, 0) === 0
						) {
							const keys = envVar
								.split("__")
								.map(function (key, i) {
									if (i === 0) {
										key = key.substring(prefix.length);
									}
									return camelCase(key);
								});
							if (
								((configOnly &&
									flags.configs[keys.join(".")]) ||
									!configOnly) &&
								!hasKey(argv3, keys)
							) {
								setArg(keys.join("."), env2[envVar]);
							}
						}
					});
				}
				function applyCoercions(argv3) {
					let coerce;
					const applied = /* @__PURE__ */ new Set();
					Object.keys(argv3).forEach(function (key) {
						if (!applied.has(key)) {
							coerce = checkAllAliases(key, flags.coercions);
							if (typeof coerce === "function") {
								try {
									const value = maybeCoerceNumber(
										key,
										coerce(argv3[key]),
									);
									[]
										.concat(flags.aliases[key] || [], key)
										.forEach((ali) => {
											applied.add(ali);
											argv3[ali] = value;
										});
								} catch (err) {
									error = err;
								}
							}
						}
					});
				}
				function setPlaceholderKeys(argv3) {
					flags.keys.forEach((key) => {
						if (~key.indexOf(".")) return;
						if (typeof argv3[key] === "undefined")
							argv3[key] = void 0;
					});
					return argv3;
				}
				function applyDefaultsAndAliases(
					obj,
					aliases2,
					defaults2,
					canLog = false,
				) {
					Object.keys(defaults2).forEach(function (key) {
						if (!hasKey(obj, key.split("."))) {
							setKey(obj, key.split("."), defaults2[key]);
							if (canLog) defaulted[key] = true;
							(aliases2[key] || []).forEach(function (x) {
								if (hasKey(obj, x.split("."))) return;
								setKey(obj, x.split("."), defaults2[key]);
							});
						}
					});
				}
				function hasKey(obj, keys) {
					let o = obj;
					if (!configuration["dot-notation"]) keys = [keys.join(".")];
					keys.slice(0, -1).forEach(function (key2) {
						o = o[key2] || {};
					});
					const key = keys[keys.length - 1];
					if (typeof o !== "object") return false;
					else return key in o;
				}
				function setKey(obj, keys, value) {
					let o = obj;
					if (!configuration["dot-notation"]) keys = [keys.join(".")];
					keys.slice(0, -1).forEach(function (key2) {
						key2 = sanitizeKey(key2);
						if (typeof o === "object" && o[key2] === void 0) {
							o[key2] = {};
						}
						if (
							typeof o[key2] !== "object" ||
							Array.isArray(o[key2])
						) {
							if (Array.isArray(o[key2])) {
								o[key2].push({});
							} else {
								o[key2] = [o[key2], {}];
							}
							o = o[key2][o[key2].length - 1];
						} else {
							o = o[key2];
						}
					});
					const key = sanitizeKey(keys[keys.length - 1]);
					const isTypeArray = checkAllAliases(
						keys.join("."),
						flags.arrays,
					);
					const isValueArray = Array.isArray(value);
					let duplicate = configuration["duplicate-arguments-array"];
					if (!duplicate && checkAllAliases(key, flags.nargs)) {
						duplicate = true;
						if (
							(!isUndefined(o[key]) && flags.nargs[key] === 1) ||
							(Array.isArray(o[key]) &&
								o[key].length === flags.nargs[key])
						) {
							o[key] = void 0;
						}
					}
					if (value === increment()) {
						o[key] = increment(o[key]);
					} else if (Array.isArray(o[key])) {
						if (duplicate && isTypeArray && isValueArray) {
							o[key] = configuration["flatten-duplicate-arrays"]
								? o[key].concat(value)
								: (Array.isArray(o[key][0])
										? o[key]
										: [o[key]]
									).concat([value]);
						} else if (
							!duplicate &&
							Boolean(isTypeArray) === Boolean(isValueArray)
						) {
							o[key] = value;
						} else {
							o[key] = o[key].concat([value]);
						}
					} else if (o[key] === void 0 && isTypeArray) {
						o[key] = isValueArray ? value : [value];
					} else if (
						duplicate &&
						!(
							o[key] === void 0 ||
							checkAllAliases(key, flags.counts) ||
							checkAllAliases(key, flags.bools)
						)
					) {
						o[key] = [o[key], value];
					} else {
						o[key] = value;
					}
				}
				function extendAliases(...args2) {
					args2.forEach(function (obj) {
						Object.keys(obj || {}).forEach(function (key) {
							if (flags.aliases[key]) return;
							flags.aliases[key] = [].concat(aliases[key] || []);
							flags.aliases[key]
								.concat(key)
								.forEach(function (x) {
									if (
										/-/.test(x) &&
										configuration["camel-case-expansion"]
									) {
										const c = camelCase(x);
										if (
											c !== key &&
											flags.aliases[key].indexOf(c) === -1
										) {
											flags.aliases[key].push(c);
											newAliases[c] = true;
										}
									}
								});
							flags.aliases[key]
								.concat(key)
								.forEach(function (x) {
									if (
										x.length > 1 &&
										/[A-Z]/.test(x) &&
										configuration["camel-case-expansion"]
									) {
										const c = decamelize(x, "-");
										if (
											c !== key &&
											flags.aliases[key].indexOf(c) === -1
										) {
											flags.aliases[key].push(c);
											newAliases[c] = true;
										}
									}
								});
							flags.aliases[key].forEach(function (x) {
								flags.aliases[x] = [key].concat(
									flags.aliases[key].filter(function (y) {
										return x !== y;
									}),
								);
							});
						});
					});
				}
				function checkAllAliases(key, flag) {
					const toCheck = [].concat(flags.aliases[key] || [], key);
					const keys = Object.keys(flag);
					const setAlias = toCheck.find((key2) =>
						keys.includes(key2),
					);
					return setAlias ? flag[setAlias] : false;
				}
				function hasAnyFlag(key) {
					const flagsKeys = Object.keys(flags);
					const toCheck = [].concat(flagsKeys.map((k) => flags[k]));
					return toCheck.some(function (flag) {
						return Array.isArray(flag)
							? flag.includes(key)
							: flag[key];
					});
				}
				function hasFlagsMatching(arg, ...patterns) {
					const toCheck = [].concat(...patterns);
					return toCheck.some(function (pattern) {
						const match = arg.match(pattern);
						return match && hasAnyFlag(match[1]);
					});
				}
				function hasAllShortFlags(arg) {
					if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
						return false;
					}
					let hasAllFlags = true;
					let next;
					const letters = arg.slice(1).split("");
					for (let j = 0; j < letters.length; j++) {
						next = arg.slice(j + 2);
						if (!hasAnyFlag(letters[j])) {
							hasAllFlags = false;
							break;
						}
						if (
							(letters[j + 1] && letters[j + 1] === "=") ||
							next === "-" ||
							(/[A-Za-z]/.test(letters[j]) &&
								/^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) ||
							(letters[j + 1] && letters[j + 1].match(/\W/))
						) {
							break;
						}
					}
					return hasAllFlags;
				}
				function isUnknownOptionAsArg(arg) {
					return (
						configuration["unknown-options-as-args"] &&
						isUnknownOption(arg)
					);
				}
				function isUnknownOption(arg) {
					arg = arg.replace(/^-{3,}/, "--");
					if (arg.match(negative)) {
						return false;
					}
					if (hasAllShortFlags(arg)) {
						return false;
					}
					const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
					const normalFlag = /^-+([^=]+?)$/;
					const flagEndingInHyphen = /^-+([^=]+?)-$/;
					const flagEndingInDigits = /^-+([^=]+?\d+)$/;
					const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
					return !hasFlagsMatching(
						arg,
						flagWithEquals,
						negatedBoolean,
						normalFlag,
						flagEndingInHyphen,
						flagEndingInDigits,
						flagEndingInNonWordCharacters,
					);
				}
				function defaultValue(key) {
					if (
						!checkAllAliases(key, flags.bools) &&
						!checkAllAliases(key, flags.counts) &&
						`${key}` in defaults
					) {
						return defaults[key];
					} else {
						return defaultForType(guessType(key));
					}
				}
				function defaultForType(type) {
					const def = {
						[DefaultValuesForTypeKey.BOOLEAN]: true,
						[DefaultValuesForTypeKey.STRING]: "",
						[DefaultValuesForTypeKey.NUMBER]: void 0,
						[DefaultValuesForTypeKey.ARRAY]: [],
					};
					return def[type];
				}
				function guessType(key) {
					let type = DefaultValuesForTypeKey.BOOLEAN;
					if (checkAllAliases(key, flags.strings))
						type = DefaultValuesForTypeKey.STRING;
					else if (checkAllAliases(key, flags.numbers))
						type = DefaultValuesForTypeKey.NUMBER;
					else if (checkAllAliases(key, flags.bools))
						type = DefaultValuesForTypeKey.BOOLEAN;
					else if (checkAllAliases(key, flags.arrays))
						type = DefaultValuesForTypeKey.ARRAY;
					return type;
				}
				function isUndefined(num) {
					return num === void 0;
				}
				function checkConfiguration() {
					Object.keys(flags.counts).find((key) => {
						if (checkAllAliases(key, flags.arrays)) {
							error = Error(
								__(
									"Invalid configuration: %s, opts.count excludes opts.array.",
									key,
								),
							);
							return true;
						} else if (checkAllAliases(key, flags.nargs)) {
							error = Error(
								__(
									"Invalid configuration: %s, opts.count excludes opts.narg.",
									key,
								),
							);
							return true;
						}
						return false;
					});
				}
				return {
					aliases: Object.assign({}, flags.aliases),
					argv: Object.assign(argvReturn, argv2),
					configuration,
					defaulted: Object.assign({}, defaulted),
					error,
					newAliases: Object.assign({}, newAliases),
				};
			}
		};
		function combineAliases(aliases) {
			const aliasArrays = [];
			const combined = /* @__PURE__ */ Object.create(null);
			let change = true;
			Object.keys(aliases).forEach(function (key) {
				aliasArrays.push([].concat(aliases[key], key));
			});
			while (change) {
				change = false;
				for (let i = 0; i < aliasArrays.length; i++) {
					for (let ii = i + 1; ii < aliasArrays.length; ii++) {
						const intersect = aliasArrays[i].filter(function (v) {
							return aliasArrays[ii].indexOf(v) !== -1;
						});
						if (intersect.length) {
							aliasArrays[i] = aliasArrays[i].concat(
								aliasArrays[ii],
							);
							aliasArrays.splice(ii, 1);
							change = true;
							break;
						}
					}
				}
			}
			aliasArrays.forEach(function (aliasArray) {
				aliasArray = aliasArray.filter(function (v, i, self) {
					return self.indexOf(v) === i;
				});
				const lastAlias = aliasArray.pop();
				if (lastAlias !== void 0 && typeof lastAlias === "string") {
					combined[lastAlias] = aliasArray;
				}
			});
			return combined;
		}
		function increment(orig) {
			return orig !== void 0 ? orig + 1 : 1;
		}
		function sanitizeKey(key) {
			if (key === "__proto__") return "___proto___";
			return key;
		}
		function stripQuotes(val) {
			return typeof val === "string" &&
				(val[0] === "'" || val[0] === '"') &&
				val[val.length - 1] === val[0]
				? val.substring(1, val.length - 1)
				: val;
		}
		var minNodeVersion =
			process && process.env && process.env.YARGS_MIN_NODE_VERSION
				? Number(process.env.YARGS_MIN_NODE_VERSION)
				: 12;
		if (process && process.version) {
			const major = Number(process.version.match(/v([^.]+)/)[1]);
			if (major < minNodeVersion) {
				throw Error(
					`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`,
				);
			}
		}
		var env = process ? process.env : {};
		var parser = new YargsParser({
			cwd: process.cwd,
			env: () => {
				return env;
			},
			format: util.format,
			normalize: path.normalize,
			resolve: path.resolve,
			require: (path2) => {
				if (typeof require !== "undefined") {
					return require(path2);
				} else if (path2.match(/\.json$/)) {
					return JSON.parse(fs.readFileSync(path2, "utf8"));
				} else {
					throw Error("only .json config files are supported in ESM");
				}
			},
		});
		var yargsParser = function Parser(args, opts) {
			const result = parser.parse(args.slice(), opts);
			return result.argv;
		};
		yargsParser.detailed = function (args, opts) {
			return parser.parse(args.slice(), opts);
		};
		yargsParser.camelCase = camelCase;
		yargsParser.decamelize = decamelize;
		yargsParser.looksLikeNumber = looksLikeNumber;
		module2.exports = yargsParser;
	},
});

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS({
	"node_modules/ansi-regex/index.js"(exports, module2) {
		"use strict";
		module2.exports = ({ onlyFirst = false } = {}) => {
			const pattern = [
				"[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
				"(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
			].join("|");
			return new RegExp(pattern, onlyFirst ? void 0 : "g");
		};
	},
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS({
	"node_modules/strip-ansi/index.js"(exports, module2) {
		"use strict";
		var ansiRegex = require_ansi_regex();
		module2.exports = (string) =>
			typeof string === "string"
				? string.replace(ansiRegex(), "")
				: string;
	},
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS({
	"node_modules/is-fullwidth-code-point/index.js"(exports, module2) {
		"use strict";
		var isFullwidthCodePoint = (codePoint) => {
			if (Number.isNaN(codePoint)) {
				return false;
			}
			if (
				codePoint >= 4352 &&
				(codePoint <= 4447 || // Hangul Jamo
					codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
					codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
					// CJK Radicals Supplement .. Enclosed CJK Letters and Months
					(11904 <= codePoint &&
						codePoint <= 12871 &&
						codePoint !== 12351) || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
					(12880 <= codePoint && codePoint <= 19903) || // CJK Unified Ideographs .. Yi Radicals
					(19968 <= codePoint && codePoint <= 42182) || // Hangul Jamo Extended-A
					(43360 <= codePoint && codePoint <= 43388) || // Hangul Syllables
					(44032 <= codePoint && codePoint <= 55203) || // CJK Compatibility Ideographs
					(63744 <= codePoint && codePoint <= 64255) || // Vertical Forms
					(65040 <= codePoint && codePoint <= 65049) || // CJK Compatibility Forms .. Small Form Variants
					(65072 <= codePoint && codePoint <= 65131) || // Halfwidth and Fullwidth Forms
					(65281 <= codePoint && codePoint <= 65376) ||
					(65504 <= codePoint && codePoint <= 65510) || // Kana Supplement
					(110592 <= codePoint && codePoint <= 110593) || // Enclosed Ideographic Supplement
					(127488 <= codePoint && codePoint <= 127569) || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
					(131072 <= codePoint && codePoint <= 262141))
			) {
				return true;
			}
			return false;
		};
		module2.exports = isFullwidthCodePoint;
		module2.exports.default = isFullwidthCodePoint;
	},
});

// node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS({
	"node_modules/emoji-regex/index.js"(exports, module2) {
		"use strict";
		module2.exports = function () {
			return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
		};
	},
});

// node_modules/string-width/index.js
var require_string_width = __commonJS({
	"node_modules/string-width/index.js"(exports, module2) {
		"use strict";
		var stripAnsi = require_strip_ansi();
		var isFullwidthCodePoint = require_is_fullwidth_code_point();
		var emojiRegex = require_emoji_regex();
		var stringWidth = (string) => {
			if (typeof string !== "string" || string.length === 0) {
				return 0;
			}
			string = stripAnsi(string);
			if (string.length === 0) {
				return 0;
			}
			string = string.replace(emojiRegex(), "  ");
			let width = 0;
			for (let i = 0; i < string.length; i++) {
				const code = string.codePointAt(i);
				if (code <= 31 || (code >= 127 && code <= 159)) {
					continue;
				}
				if (code >= 768 && code <= 879) {
					continue;
				}
				if (code > 65535) {
					i++;
				}
				width += isFullwidthCodePoint(code) ? 2 : 1;
			}
			return width;
		};
		module2.exports = stringWidth;
		module2.exports.default = stringWidth;
	},
});

// node_modules/ansi-styles/node_modules/color-name/index.js
var require_color_name = __commonJS({
	"node_modules/ansi-styles/node_modules/color-name/index.js"(
		exports,
		module2,
	) {
		"use strict";
		module2.exports = {
			aliceblue: [240, 248, 255],
			antiquewhite: [250, 235, 215],
			aqua: [0, 255, 255],
			aquamarine: [127, 255, 212],
			azure: [240, 255, 255],
			beige: [245, 245, 220],
			bisque: [255, 228, 196],
			black: [0, 0, 0],
			blanchedalmond: [255, 235, 205],
			blue: [0, 0, 255],
			blueviolet: [138, 43, 226],
			brown: [165, 42, 42],
			burlywood: [222, 184, 135],
			cadetblue: [95, 158, 160],
			chartreuse: [127, 255, 0],
			chocolate: [210, 105, 30],
			coral: [255, 127, 80],
			cornflowerblue: [100, 149, 237],
			cornsilk: [255, 248, 220],
			crimson: [220, 20, 60],
			cyan: [0, 255, 255],
			darkblue: [0, 0, 139],
			darkcyan: [0, 139, 139],
			darkgoldenrod: [184, 134, 11],
			darkgray: [169, 169, 169],
			darkgreen: [0, 100, 0],
			darkgrey: [169, 169, 169],
			darkkhaki: [189, 183, 107],
			darkmagenta: [139, 0, 139],
			darkolivegreen: [85, 107, 47],
			darkorange: [255, 140, 0],
			darkorchid: [153, 50, 204],
			darkred: [139, 0, 0],
			darksalmon: [233, 150, 122],
			darkseagreen: [143, 188, 143],
			darkslateblue: [72, 61, 139],
			darkslategray: [47, 79, 79],
			darkslategrey: [47, 79, 79],
			darkturquoise: [0, 206, 209],
			darkviolet: [148, 0, 211],
			deeppink: [255, 20, 147],
			deepskyblue: [0, 191, 255],
			dimgray: [105, 105, 105],
			dimgrey: [105, 105, 105],
			dodgerblue: [30, 144, 255],
			firebrick: [178, 34, 34],
			floralwhite: [255, 250, 240],
			forestgreen: [34, 139, 34],
			fuchsia: [255, 0, 255],
			gainsboro: [220, 220, 220],
			ghostwhite: [248, 248, 255],
			gold: [255, 215, 0],
			goldenrod: [218, 165, 32],
			gray: [128, 128, 128],
			green: [0, 128, 0],
			greenyellow: [173, 255, 47],
			grey: [128, 128, 128],
			honeydew: [240, 255, 240],
			hotpink: [255, 105, 180],
			indianred: [205, 92, 92],
			indigo: [75, 0, 130],
			ivory: [255, 255, 240],
			khaki: [240, 230, 140],
			lavender: [230, 230, 250],
			lavenderblush: [255, 240, 245],
			lawngreen: [124, 252, 0],
			lemonchiffon: [255, 250, 205],
			lightblue: [173, 216, 230],
			lightcoral: [240, 128, 128],
			lightcyan: [224, 255, 255],
			lightgoldenrodyellow: [250, 250, 210],
			lightgray: [211, 211, 211],
			lightgreen: [144, 238, 144],
			lightgrey: [211, 211, 211],
			lightpink: [255, 182, 193],
			lightsalmon: [255, 160, 122],
			lightseagreen: [32, 178, 170],
			lightskyblue: [135, 206, 250],
			lightslategray: [119, 136, 153],
			lightslategrey: [119, 136, 153],
			lightsteelblue: [176, 196, 222],
			lightyellow: [255, 255, 224],
			lime: [0, 255, 0],
			limegreen: [50, 205, 50],
			linen: [250, 240, 230],
			magenta: [255, 0, 255],
			maroon: [128, 0, 0],
			mediumaquamarine: [102, 205, 170],
			mediumblue: [0, 0, 205],
			mediumorchid: [186, 85, 211],
			mediumpurple: [147, 112, 219],
			mediumseagreen: [60, 179, 113],
			mediumslateblue: [123, 104, 238],
			mediumspringgreen: [0, 250, 154],
			mediumturquoise: [72, 209, 204],
			mediumvioletred: [199, 21, 133],
			midnightblue: [25, 25, 112],
			mintcream: [245, 255, 250],
			mistyrose: [255, 228, 225],
			moccasin: [255, 228, 181],
			navajowhite: [255, 222, 173],
			navy: [0, 0, 128],
			oldlace: [253, 245, 230],
			olive: [128, 128, 0],
			olivedrab: [107, 142, 35],
			orange: [255, 165, 0],
			orangered: [255, 69, 0],
			orchid: [218, 112, 214],
			palegoldenrod: [238, 232, 170],
			palegreen: [152, 251, 152],
			paleturquoise: [175, 238, 238],
			palevioletred: [219, 112, 147],
			papayawhip: [255, 239, 213],
			peachpuff: [255, 218, 185],
			peru: [205, 133, 63],
			pink: [255, 192, 203],
			plum: [221, 160, 221],
			powderblue: [176, 224, 230],
			purple: [128, 0, 128],
			rebeccapurple: [102, 51, 153],
			red: [255, 0, 0],
			rosybrown: [188, 143, 143],
			royalblue: [65, 105, 225],
			saddlebrown: [139, 69, 19],
			salmon: [250, 128, 114],
			sandybrown: [244, 164, 96],
			seagreen: [46, 139, 87],
			seashell: [255, 245, 238],
			sienna: [160, 82, 45],
			silver: [192, 192, 192],
			skyblue: [135, 206, 235],
			slateblue: [106, 90, 205],
			slategray: [112, 128, 144],
			slategrey: [112, 128, 144],
			snow: [255, 250, 250],
			springgreen: [0, 255, 127],
			steelblue: [70, 130, 180],
			tan: [210, 180, 140],
			teal: [0, 128, 128],
			thistle: [216, 191, 216],
			tomato: [255, 99, 71],
			turquoise: [64, 224, 208],
			violet: [238, 130, 238],
			wheat: [245, 222, 179],
			white: [255, 255, 255],
			whitesmoke: [245, 245, 245],
			yellow: [255, 255, 0],
			yellowgreen: [154, 205, 50],
		};
	},
});

// node_modules/ansi-styles/node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
	"node_modules/ansi-styles/node_modules/color-convert/conversions.js"(
		exports,
		module2,
	) {
		var cssKeywords = require_color_name();
		var reverseKeywords = {};
		for (const key of Object.keys(cssKeywords)) {
			reverseKeywords[cssKeywords[key]] = key;
		}
		var convert = {
			rgb: { channels: 3, labels: "rgb" },
			hsl: { channels: 3, labels: "hsl" },
			hsv: { channels: 3, labels: "hsv" },
			hwb: { channels: 3, labels: "hwb" },
			cmyk: { channels: 4, labels: "cmyk" },
			xyz: { channels: 3, labels: "xyz" },
			lab: { channels: 3, labels: "lab" },
			lch: { channels: 3, labels: "lch" },
			hex: { channels: 1, labels: ["hex"] },
			keyword: { channels: 1, labels: ["keyword"] },
			ansi16: { channels: 1, labels: ["ansi16"] },
			ansi256: { channels: 1, labels: ["ansi256"] },
			hcg: { channels: 3, labels: ["h", "c", "g"] },
			apple: { channels: 3, labels: ["r16", "g16", "b16"] },
			gray: { channels: 1, labels: ["gray"] },
		};
		module2.exports = convert;
		for (const model of Object.keys(convert)) {
			if (!("channels" in convert[model])) {
				throw new Error("missing channels property: " + model);
			}
			if (!("labels" in convert[model])) {
				throw new Error("missing channel labels property: " + model);
			}
			if (convert[model].labels.length !== convert[model].channels) {
				throw new Error("channel and label counts mismatch: " + model);
			}
			const { channels, labels } = convert[model];
			delete convert[model].channels;
			delete convert[model].labels;
			Object.defineProperty(convert[model], "channels", {
				value: channels,
			});
			Object.defineProperty(convert[model], "labels", { value: labels });
		}
		convert.rgb.hsl = function (rgb) {
			const r = rgb[0] / 255;
			const g = rgb[1] / 255;
			const b = rgb[2] / 255;
			const min = Math.min(r, g, b);
			const max = Math.max(r, g, b);
			const delta = max - min;
			let h;
			let s;
			if (max === min) {
				h = 0;
			} else if (r === max) {
				h = (g - b) / delta;
			} else if (g === max) {
				h = 2 + (b - r) / delta;
			} else if (b === max) {
				h = 4 + (r - g) / delta;
			}
			h = Math.min(h * 60, 360);
			if (h < 0) {
				h += 360;
			}
			const l = (min + max) / 2;
			if (max === min) {
				s = 0;
			} else if (l <= 0.5) {
				s = delta / (max + min);
			} else {
				s = delta / (2 - max - min);
			}
			return [h, s * 100, l * 100];
		};
		convert.rgb.hsv = function (rgb) {
			let rdif;
			let gdif;
			let bdif;
			let h;
			let s;
			const r = rgb[0] / 255;
			const g = rgb[1] / 255;
			const b = rgb[2] / 255;
			const v = Math.max(r, g, b);
			const diff = v - Math.min(r, g, b);
			const diffc = function (c) {
				return (v - c) / 6 / diff + 1 / 2;
			};
			if (diff === 0) {
				h = 0;
				s = 0;
			} else {
				s = diff / v;
				rdif = diffc(r);
				gdif = diffc(g);
				bdif = diffc(b);
				if (r === v) {
					h = bdif - gdif;
				} else if (g === v) {
					h = 1 / 3 + rdif - bdif;
				} else if (b === v) {
					h = 2 / 3 + gdif - rdif;
				}
				if (h < 0) {
					h += 1;
				} else if (h > 1) {
					h -= 1;
				}
			}
			return [h * 360, s * 100, v * 100];
		};
		convert.rgb.hwb = function (rgb) {
			const r = rgb[0];
			const g = rgb[1];
			let b = rgb[2];
			const h = convert.rgb.hsl(rgb)[0];
			const w = (1 / 255) * Math.min(r, Math.min(g, b));
			b = 1 - (1 / 255) * Math.max(r, Math.max(g, b));
			return [h, w * 100, b * 100];
		};
		convert.rgb.cmyk = function (rgb) {
			const r = rgb[0] / 255;
			const g = rgb[1] / 255;
			const b = rgb[2] / 255;
			const k = Math.min(1 - r, 1 - g, 1 - b);
			const c = (1 - r - k) / (1 - k) || 0;
			const m = (1 - g - k) / (1 - k) || 0;
			const y = (1 - b - k) / (1 - k) || 0;
			return [c * 100, m * 100, y * 100, k * 100];
		};
		function comparativeDistance(x, y) {
			return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
		}
		convert.rgb.keyword = function (rgb) {
			const reversed = reverseKeywords[rgb];
			if (reversed) {
				return reversed;
			}
			let currentClosestDistance = Infinity;
			let currentClosestKeyword;
			for (const keyword of Object.keys(cssKeywords)) {
				const value = cssKeywords[keyword];
				const distance = comparativeDistance(rgb, value);
				if (distance < currentClosestDistance) {
					currentClosestDistance = distance;
					currentClosestKeyword = keyword;
				}
			}
			return currentClosestKeyword;
		};
		convert.keyword.rgb = function (keyword) {
			return cssKeywords[keyword];
		};
		convert.rgb.xyz = function (rgb) {
			let r = rgb[0] / 255;
			let g = rgb[1] / 255;
			let b = rgb[2] / 255;
			r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
			g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
			b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
			const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
			const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
			const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
			return [x * 100, y * 100, z * 100];
		};
		convert.rgb.lab = function (rgb) {
			const xyz = convert.rgb.xyz(rgb);
			let x = xyz[0];
			let y = xyz[1];
			let z = xyz[2];
			x /= 95.047;
			y /= 100;
			z /= 108.883;
			x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
			y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
			z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
			const l = 116 * y - 16;
			const a = 500 * (x - y);
			const b = 200 * (y - z);
			return [l, a, b];
		};
		convert.hsl.rgb = function (hsl) {
			const h = hsl[0] / 360;
			const s = hsl[1] / 100;
			const l = hsl[2] / 100;
			let t2;
			let t3;
			let val;
			if (s === 0) {
				val = l * 255;
				return [val, val, val];
			}
			if (l < 0.5) {
				t2 = l * (1 + s);
			} else {
				t2 = l + s - l * s;
			}
			const t1 = 2 * l - t2;
			const rgb = [0, 0, 0];
			for (let i = 0; i < 3; i++) {
				t3 = h + (1 / 3) * -(i - 1);
				if (t3 < 0) {
					t3++;
				}
				if (t3 > 1) {
					t3--;
				}
				if (6 * t3 < 1) {
					val = t1 + (t2 - t1) * 6 * t3;
				} else if (2 * t3 < 1) {
					val = t2;
				} else if (3 * t3 < 2) {
					val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
				} else {
					val = t1;
				}
				rgb[i] = val * 255;
			}
			return rgb;
		};
		convert.hsl.hsv = function (hsl) {
			const h = hsl[0];
			let s = hsl[1] / 100;
			let l = hsl[2] / 100;
			let smin = s;
			const lmin = Math.max(l, 0.01);
			l *= 2;
			s *= l <= 1 ? l : 2 - l;
			smin *= lmin <= 1 ? lmin : 2 - lmin;
			const v = (l + s) / 2;
			const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);
			return [h, sv * 100, v * 100];
		};
		convert.hsv.rgb = function (hsv) {
			const h = hsv[0] / 60;
			const s = hsv[1] / 100;
			let v = hsv[2] / 100;
			const hi = Math.floor(h) % 6;
			const f = h - Math.floor(h);
			const p = 255 * v * (1 - s);
			const q = 255 * v * (1 - s * f);
			const t = 255 * v * (1 - s * (1 - f));
			v *= 255;
			switch (hi) {
				case 0:
					return [v, t, p];
				case 1:
					return [q, v, p];
				case 2:
					return [p, v, t];
				case 3:
					return [p, q, v];
				case 4:
					return [t, p, v];
				case 5:
					return [v, p, q];
			}
		};
		convert.hsv.hsl = function (hsv) {
			const h = hsv[0];
			const s = hsv[1] / 100;
			const v = hsv[2] / 100;
			const vmin = Math.max(v, 0.01);
			let sl;
			let l;
			l = (2 - s) * v;
			const lmin = (2 - s) * vmin;
			sl = s * vmin;
			sl /= lmin <= 1 ? lmin : 2 - lmin;
			sl = sl || 0;
			l /= 2;
			return [h, sl * 100, l * 100];
		};
		convert.hwb.rgb = function (hwb) {
			const h = hwb[0] / 360;
			let wh = hwb[1] / 100;
			let bl = hwb[2] / 100;
			const ratio = wh + bl;
			let f;
			if (ratio > 1) {
				wh /= ratio;
				bl /= ratio;
			}
			const i = Math.floor(6 * h);
			const v = 1 - bl;
			f = 6 * h - i;
			if ((i & 1) !== 0) {
				f = 1 - f;
			}
			const n = wh + f * (v - wh);
			let r;
			let g;
			let b;
			switch (i) {
				default:
				case 6:
				case 0:
					r = v;
					g = n;
					b = wh;
					break;
				case 1:
					r = n;
					g = v;
					b = wh;
					break;
				case 2:
					r = wh;
					g = v;
					b = n;
					break;
				case 3:
					r = wh;
					g = n;
					b = v;
					break;
				case 4:
					r = n;
					g = wh;
					b = v;
					break;
				case 5:
					r = v;
					g = wh;
					b = n;
					break;
			}
			return [r * 255, g * 255, b * 255];
		};
		convert.cmyk.rgb = function (cmyk) {
			const c = cmyk[0] / 100;
			const m = cmyk[1] / 100;
			const y = cmyk[2] / 100;
			const k = cmyk[3] / 100;
			const r = 1 - Math.min(1, c * (1 - k) + k);
			const g = 1 - Math.min(1, m * (1 - k) + k);
			const b = 1 - Math.min(1, y * (1 - k) + k);
			return [r * 255, g * 255, b * 255];
		};
		convert.xyz.rgb = function (xyz) {
			const x = xyz[0] / 100;
			const y = xyz[1] / 100;
			const z = xyz[2] / 100;
			let r;
			let g;
			let b;
			r = x * 3.2406 + y * -1.5372 + z * -0.4986;
			g = x * -0.9689 + y * 1.8758 + z * 0.0415;
			b = x * 0.0557 + y * -0.204 + z * 1.057;
			r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
			g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
			b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
			r = Math.min(Math.max(0, r), 1);
			g = Math.min(Math.max(0, g), 1);
			b = Math.min(Math.max(0, b), 1);
			return [r * 255, g * 255, b * 255];
		};
		convert.xyz.lab = function (xyz) {
			let x = xyz[0];
			let y = xyz[1];
			let z = xyz[2];
			x /= 95.047;
			y /= 100;
			z /= 108.883;
			x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
			y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
			z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
			const l = 116 * y - 16;
			const a = 500 * (x - y);
			const b = 200 * (y - z);
			return [l, a, b];
		};
		convert.lab.xyz = function (lab) {
			const l = lab[0];
			const a = lab[1];
			const b = lab[2];
			let x;
			let y;
			let z;
			y = (l + 16) / 116;
			x = a / 500 + y;
			z = y - b / 200;
			const y2 = y ** 3;
			const x2 = x ** 3;
			const z2 = z ** 3;
			y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
			x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
			z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
			x *= 95.047;
			y *= 100;
			z *= 108.883;
			return [x, y, z];
		};
		convert.lab.lch = function (lab) {
			const l = lab[0];
			const a = lab[1];
			const b = lab[2];
			let h;
			const hr = Math.atan2(b, a);
			h = (hr * 360) / 2 / Math.PI;
			if (h < 0) {
				h += 360;
			}
			const c = Math.sqrt(a * a + b * b);
			return [l, c, h];
		};
		convert.lch.lab = function (lch) {
			const l = lch[0];
			const c = lch[1];
			const h = lch[2];
			const hr = (h / 360) * 2 * Math.PI;
			const a = c * Math.cos(hr);
			const b = c * Math.sin(hr);
			return [l, a, b];
		};
		convert.rgb.ansi16 = function (args, saturation = null) {
			const [r, g, b] = args;
			let value =
				saturation === null ? convert.rgb.hsv(args)[2] : saturation;
			value = Math.round(value / 50);
			if (value === 0) {
				return 30;
			}
			let ansi =
				30 +
				((Math.round(b / 255) << 2) |
					(Math.round(g / 255) << 1) |
					Math.round(r / 255));
			if (value === 2) {
				ansi += 60;
			}
			return ansi;
		};
		convert.hsv.ansi16 = function (args) {
			return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
		};
		convert.rgb.ansi256 = function (args) {
			const r = args[0];
			const g = args[1];
			const b = args[2];
			if (r === g && g === b) {
				if (r < 8) {
					return 16;
				}
				if (r > 248) {
					return 231;
				}
				return Math.round(((r - 8) / 247) * 24) + 232;
			}
			const ansi =
				16 +
				36 * Math.round((r / 255) * 5) +
				6 * Math.round((g / 255) * 5) +
				Math.round((b / 255) * 5);
			return ansi;
		};
		convert.ansi16.rgb = function (args) {
			let color = args % 10;
			if (color === 0 || color === 7) {
				if (args > 50) {
					color += 3.5;
				}
				color = (color / 10.5) * 255;
				return [color, color, color];
			}
			const mult = (~~(args > 50) + 1) * 0.5;
			const r = (color & 1) * mult * 255;
			const g = ((color >> 1) & 1) * mult * 255;
			const b = ((color >> 2) & 1) * mult * 255;
			return [r, g, b];
		};
		convert.ansi256.rgb = function (args) {
			if (args >= 232) {
				const c = (args - 232) * 10 + 8;
				return [c, c, c];
			}
			args -= 16;
			let rem;
			const r = (Math.floor(args / 36) / 5) * 255;
			const g = (Math.floor((rem = args % 36) / 6) / 5) * 255;
			const b = ((rem % 6) / 5) * 255;
			return [r, g, b];
		};
		convert.rgb.hex = function (args) {
			const integer =
				((Math.round(args[0]) & 255) << 16) +
				((Math.round(args[1]) & 255) << 8) +
				(Math.round(args[2]) & 255);
			const string = integer.toString(16).toUpperCase();
			return "000000".substring(string.length) + string;
		};
		convert.hex.rgb = function (args) {
			const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
			if (!match) {
				return [0, 0, 0];
			}
			let colorString = match[0];
			if (match[0].length === 3) {
				colorString = colorString
					.split("")
					.map((char) => {
						return char + char;
					})
					.join("");
			}
			const integer = parseInt(colorString, 16);
			const r = (integer >> 16) & 255;
			const g = (integer >> 8) & 255;
			const b = integer & 255;
			return [r, g, b];
		};
		convert.rgb.hcg = function (rgb) {
			const r = rgb[0] / 255;
			const g = rgb[1] / 255;
			const b = rgb[2] / 255;
			const max = Math.max(Math.max(r, g), b);
			const min = Math.min(Math.min(r, g), b);
			const chroma = max - min;
			let grayscale;
			let hue;
			if (chroma < 1) {
				grayscale = min / (1 - chroma);
			} else {
				grayscale = 0;
			}
			if (chroma <= 0) {
				hue = 0;
			} else if (max === r) {
				hue = ((g - b) / chroma) % 6;
			} else if (max === g) {
				hue = 2 + (b - r) / chroma;
			} else {
				hue = 4 + (r - g) / chroma;
			}
			hue /= 6;
			hue %= 1;
			return [hue * 360, chroma * 100, grayscale * 100];
		};
		convert.hsl.hcg = function (hsl) {
			const s = hsl[1] / 100;
			const l = hsl[2] / 100;
			const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
			let f = 0;
			if (c < 1) {
				f = (l - 0.5 * c) / (1 - c);
			}
			return [hsl[0], c * 100, f * 100];
		};
		convert.hsv.hcg = function (hsv) {
			const s = hsv[1] / 100;
			const v = hsv[2] / 100;
			const c = s * v;
			let f = 0;
			if (c < 1) {
				f = (v - c) / (1 - c);
			}
			return [hsv[0], c * 100, f * 100];
		};
		convert.hcg.rgb = function (hcg) {
			const h = hcg[0] / 360;
			const c = hcg[1] / 100;
			const g = hcg[2] / 100;
			if (c === 0) {
				return [g * 255, g * 255, g * 255];
			}
			const pure = [0, 0, 0];
			const hi = (h % 1) * 6;
			const v = hi % 1;
			const w = 1 - v;
			let mg = 0;
			switch (Math.floor(hi)) {
				case 0:
					pure[0] = 1;
					pure[1] = v;
					pure[2] = 0;
					break;
				case 1:
					pure[0] = w;
					pure[1] = 1;
					pure[2] = 0;
					break;
				case 2:
					pure[0] = 0;
					pure[1] = 1;
					pure[2] = v;
					break;
				case 3:
					pure[0] = 0;
					pure[1] = w;
					pure[2] = 1;
					break;
				case 4:
					pure[0] = v;
					pure[1] = 0;
					pure[2] = 1;
					break;
				default:
					pure[0] = 1;
					pure[1] = 0;
					pure[2] = w;
			}
			mg = (1 - c) * g;
			return [
				(c * pure[0] + mg) * 255,
				(c * pure[1] + mg) * 255,
				(c * pure[2] + mg) * 255,
			];
		};
		convert.hcg.hsv = function (hcg) {
			const c = hcg[1] / 100;
			const g = hcg[2] / 100;
			const v = c + g * (1 - c);
			let f = 0;
			if (v > 0) {
				f = c / v;
			}
			return [hcg[0], f * 100, v * 100];
		};
		convert.hcg.hsl = function (hcg) {
			const c = hcg[1] / 100;
			const g = hcg[2] / 100;
			const l = g * (1 - c) + 0.5 * c;
			let s = 0;
			if (l > 0 && l < 0.5) {
				s = c / (2 * l);
			} else if (l >= 0.5 && l < 1) {
				s = c / (2 * (1 - l));
			}
			return [hcg[0], s * 100, l * 100];
		};
		convert.hcg.hwb = function (hcg) {
			const c = hcg[1] / 100;
			const g = hcg[2] / 100;
			const v = c + g * (1 - c);
			return [hcg[0], (v - c) * 100, (1 - v) * 100];
		};
		convert.hwb.hcg = function (hwb) {
			const w = hwb[1] / 100;
			const b = hwb[2] / 100;
			const v = 1 - b;
			const c = v - w;
			let g = 0;
			if (c < 1) {
				g = (v - c) / (1 - c);
			}
			return [hwb[0], c * 100, g * 100];
		};
		convert.apple.rgb = function (apple) {
			return [
				(apple[0] / 65535) * 255,
				(apple[1] / 65535) * 255,
				(apple[2] / 65535) * 255,
			];
		};
		convert.rgb.apple = function (rgb) {
			return [
				(rgb[0] / 255) * 65535,
				(rgb[1] / 255) * 65535,
				(rgb[2] / 255) * 65535,
			];
		};
		convert.gray.rgb = function (args) {
			return [
				(args[0] / 100) * 255,
				(args[0] / 100) * 255,
				(args[0] / 100) * 255,
			];
		};
		convert.gray.hsl = function (args) {
			return [0, 0, args[0]];
		};
		convert.gray.hsv = convert.gray.hsl;
		convert.gray.hwb = function (gray) {
			return [0, 100, gray[0]];
		};
		convert.gray.cmyk = function (gray) {
			return [0, 0, 0, gray[0]];
		};
		convert.gray.lab = function (gray) {
			return [gray[0], 0, 0];
		};
		convert.gray.hex = function (gray) {
			const val = Math.round((gray[0] / 100) * 255) & 255;
			const integer = (val << 16) + (val << 8) + val;
			const string = integer.toString(16).toUpperCase();
			return "000000".substring(string.length) + string;
		};
		convert.rgb.gray = function (rgb) {
			const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
			return [(val / 255) * 100];
		};
	},
});

// node_modules/ansi-styles/node_modules/color-convert/route.js
var require_route = __commonJS({
	"node_modules/ansi-styles/node_modules/color-convert/route.js"(
		exports,
		module2,
	) {
		var conversions = require_conversions();
		function buildGraph() {
			const graph = {};
			const models = Object.keys(conversions);
			for (let len = models.length, i = 0; i < len; i++) {
				graph[models[i]] = {
					// http://jsperf.com/1-vs-infinity
					// micro-opt, but this is simple.
					distance: -1,
					parent: null,
				};
			}
			return graph;
		}
		function deriveBFS(fromModel) {
			const graph = buildGraph();
			const queue = [fromModel];
			graph[fromModel].distance = 0;
			while (queue.length) {
				const current = queue.pop();
				const adjacents = Object.keys(conversions[current]);
				for (let len = adjacents.length, i = 0; i < len; i++) {
					const adjacent = adjacents[i];
					const node = graph[adjacent];
					if (node.distance === -1) {
						node.distance = graph[current].distance + 1;
						node.parent = current;
						queue.unshift(adjacent);
					}
				}
			}
			return graph;
		}
		function link(from, to) {
			return function (args) {
				return to(from(args));
			};
		}
		function wrapConversion(toModel, graph) {
			const path = [graph[toModel].parent, toModel];
			let fn = conversions[graph[toModel].parent][toModel];
			let cur = graph[toModel].parent;
			while (graph[cur].parent) {
				path.unshift(graph[cur].parent);
				fn = link(conversions[graph[cur].parent][cur], fn);
				cur = graph[cur].parent;
			}
			fn.conversion = path;
			return fn;
		}
		module2.exports = function (fromModel) {
			const graph = deriveBFS(fromModel);
			const conversion = {};
			const models = Object.keys(graph);
			for (let len = models.length, i = 0; i < len; i++) {
				const toModel = models[i];
				const node = graph[toModel];
				if (node.parent === null) {
					continue;
				}
				conversion[toModel] = wrapConversion(toModel, graph);
			}
			return conversion;
		};
	},
});

// node_modules/ansi-styles/node_modules/color-convert/index.js
var require_color_convert = __commonJS({
	"node_modules/ansi-styles/node_modules/color-convert/index.js"(
		exports,
		module2,
	) {
		var conversions = require_conversions();
		var route = require_route();
		var convert = {};
		var models = Object.keys(conversions);
		function wrapRaw(fn) {
			const wrappedFn = function (...args) {
				const arg0 = args[0];
				if (arg0 === void 0 || arg0 === null) {
					return arg0;
				}
				if (arg0.length > 1) {
					args = arg0;
				}
				return fn(args);
			};
			if ("conversion" in fn) {
				wrappedFn.conversion = fn.conversion;
			}
			return wrappedFn;
		}
		function wrapRounded(fn) {
			const wrappedFn = function (...args) {
				const arg0 = args[0];
				if (arg0 === void 0 || arg0 === null) {
					return arg0;
				}
				if (arg0.length > 1) {
					args = arg0;
				}
				const result = fn(args);
				if (typeof result === "object") {
					for (let len = result.length, i = 0; i < len; i++) {
						result[i] = Math.round(result[i]);
					}
				}
				return result;
			};
			if ("conversion" in fn) {
				wrappedFn.conversion = fn.conversion;
			}
			return wrappedFn;
		}
		models.forEach((fromModel) => {
			convert[fromModel] = {};
			Object.defineProperty(convert[fromModel], "channels", {
				value: conversions[fromModel].channels,
			});
			Object.defineProperty(convert[fromModel], "labels", {
				value: conversions[fromModel].labels,
			});
			const routes = route(fromModel);
			const routeModels = Object.keys(routes);
			routeModels.forEach((toModel) => {
				const fn = routes[toModel];
				convert[fromModel][toModel] = wrapRounded(fn);
				convert[fromModel][toModel].raw = wrapRaw(fn);
			});
		});
		module2.exports = convert;
	},
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
	"node_modules/ansi-styles/index.js"(exports, module2) {
		"use strict";
		var wrapAnsi16 =
			(fn, offset) =>
			(...args) => {
				const code = fn(...args);
				return `\x1B[${code + offset}m`;
			};
		var wrapAnsi256 =
			(fn, offset) =>
			(...args) => {
				const code = fn(...args);
				return `\x1B[${38 + offset};5;${code}m`;
			};
		var wrapAnsi16m =
			(fn, offset) =>
			(...args) => {
				const rgb = fn(...args);
				return `\x1B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
			};
		var ansi2ansi = (n) => n;
		var rgb2rgb = (r, g, b) => [r, g, b];
		var setLazyProperty = (object, property, get) => {
			Object.defineProperty(object, property, {
				get: () => {
					const value = get();
					Object.defineProperty(object, property, {
						value,
						enumerable: true,
						configurable: true,
					});
					return value;
				},
				enumerable: true,
				configurable: true,
			});
		};
		var colorConvert;
		var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
			if (colorConvert === void 0) {
				colorConvert = require_color_convert();
			}
			const offset = isBackground ? 10 : 0;
			const styles = {};
			for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
				const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
				if (sourceSpace === targetSpace) {
					styles[name] = wrap(identity, offset);
				} else if (typeof suite === "object") {
					styles[name] = wrap(suite[targetSpace], offset);
				}
			}
			return styles;
		};
		function assembleStyles() {
			const codes = /* @__PURE__ */ new Map();
			const styles = {
				modifier: {
					reset: [0, 0],
					// 21 isn't widely supported and 22 does the same thing
					bold: [1, 22],
					dim: [2, 22],
					italic: [3, 23],
					underline: [4, 24],
					inverse: [7, 27],
					hidden: [8, 28],
					strikethrough: [9, 29],
				},
				color: {
					black: [30, 39],
					red: [31, 39],
					green: [32, 39],
					yellow: [33, 39],
					blue: [34, 39],
					magenta: [35, 39],
					cyan: [36, 39],
					white: [37, 39],
					// Bright color
					blackBright: [90, 39],
					redBright: [91, 39],
					greenBright: [92, 39],
					yellowBright: [93, 39],
					blueBright: [94, 39],
					magentaBright: [95, 39],
					cyanBright: [96, 39],
					whiteBright: [97, 39],
				},
				bgColor: {
					bgBlack: [40, 49],
					bgRed: [41, 49],
					bgGreen: [42, 49],
					bgYellow: [43, 49],
					bgBlue: [44, 49],
					bgMagenta: [45, 49],
					bgCyan: [46, 49],
					bgWhite: [47, 49],
					// Bright color
					bgBlackBright: [100, 49],
					bgRedBright: [101, 49],
					bgGreenBright: [102, 49],
					bgYellowBright: [103, 49],
					bgBlueBright: [104, 49],
					bgMagentaBright: [105, 49],
					bgCyanBright: [106, 49],
					bgWhiteBright: [107, 49],
				},
			};
			styles.color.gray = styles.color.blackBright;
			styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
			styles.color.grey = styles.color.blackBright;
			styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
			for (const [groupName, group] of Object.entries(styles)) {
				for (const [styleName, style] of Object.entries(group)) {
					styles[styleName] = {
						open: `\x1B[${style[0]}m`,
						close: `\x1B[${style[1]}m`,
					};
					group[styleName] = styles[styleName];
					codes.set(style[0], style[1]);
				}
				Object.defineProperty(styles, groupName, {
					value: group,
					enumerable: false,
				});
			}
			Object.defineProperty(styles, "codes", {
				value: codes,
				enumerable: false,
			});
			styles.color.close = "\x1B[39m";
			styles.bgColor.close = "\x1B[49m";
			setLazyProperty(styles.color, "ansi", () =>
				makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false),
			);
			setLazyProperty(styles.color, "ansi256", () =>
				makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false),
			);
			setLazyProperty(styles.color, "ansi16m", () =>
				makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false),
			);
			setLazyProperty(styles.bgColor, "ansi", () =>
				makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true),
			);
			setLazyProperty(styles.bgColor, "ansi256", () =>
				makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true),
			);
			setLazyProperty(styles.bgColor, "ansi16m", () =>
				makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true),
			);
			return styles;
		}
		Object.defineProperty(module2, "exports", {
			enumerable: true,
			get: assembleStyles,
		});
	},
});

// node_modules/cliui/node_modules/wrap-ansi/index.js
var require_wrap_ansi = __commonJS({
	"node_modules/cliui/node_modules/wrap-ansi/index.js"(exports, module2) {
		"use strict";
		var stringWidth = require_string_width();
		var stripAnsi = require_strip_ansi();
		var ansiStyles = require_ansi_styles();
		var ESCAPES = /* @__PURE__ */ new Set(["\x1B", "\x9B"]);
		var END_CODE = 39;
		var ANSI_ESCAPE_BELL = "\x07";
		var ANSI_CSI = "[";
		var ANSI_OSC = "]";
		var ANSI_SGR_TERMINATOR = "m";
		var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
		var wrapAnsi = (code) =>
			`${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
		var wrapAnsiHyperlink = (uri) =>
			`${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;
		var wordLengths = (string) =>
			string.split(" ").map((character) => stringWidth(character));
		var wrapWord = (rows, word, columns) => {
			const characters = [...word];
			let isInsideEscape = false;
			let isInsideLinkEscape = false;
			let visible = stringWidth(stripAnsi(rows[rows.length - 1]));
			for (const [index, character] of characters.entries()) {
				const characterLength = stringWidth(character);
				if (visible + characterLength <= columns) {
					rows[rows.length - 1] += character;
				} else {
					rows.push(character);
					visible = 0;
				}
				if (ESCAPES.has(character)) {
					isInsideEscape = true;
					isInsideLinkEscape = characters
						.slice(index + 1)
						.join("")
						.startsWith(ANSI_ESCAPE_LINK);
				}
				if (isInsideEscape) {
					if (isInsideLinkEscape) {
						if (character === ANSI_ESCAPE_BELL) {
							isInsideEscape = false;
							isInsideLinkEscape = false;
						}
					} else if (character === ANSI_SGR_TERMINATOR) {
						isInsideEscape = false;
					}
					continue;
				}
				visible += characterLength;
				if (visible === columns && index < characters.length - 1) {
					rows.push("");
					visible = 0;
				}
			}
			if (
				!visible &&
				rows[rows.length - 1].length > 0 &&
				rows.length > 1
			) {
				rows[rows.length - 2] += rows.pop();
			}
		};
		var stringVisibleTrimSpacesRight = (string) => {
			const words = string.split(" ");
			let last = words.length;
			while (last > 0) {
				if (stringWidth(words[last - 1]) > 0) {
					break;
				}
				last--;
			}
			if (last === words.length) {
				return string;
			}
			return words.slice(0, last).join(" ") + words.slice(last).join("");
		};
		var exec = (string, columns, options = {}) => {
			if (options.trim !== false && string.trim() === "") {
				return "";
			}
			let returnValue = "";
			let escapeCode;
			let escapeUrl;
			const lengths = wordLengths(string);
			let rows = [""];
			for (const [index, word] of string.split(" ").entries()) {
				if (options.trim !== false) {
					rows[rows.length - 1] = rows[rows.length - 1].trimStart();
				}
				let rowLength = stringWidth(rows[rows.length - 1]);
				if (index !== 0) {
					if (
						rowLength >= columns &&
						(options.wordWrap === false || options.trim === false)
					) {
						rows.push("");
						rowLength = 0;
					}
					if (rowLength > 0 || options.trim === false) {
						rows[rows.length - 1] += " ";
						rowLength++;
					}
				}
				if (options.hard && lengths[index] > columns) {
					const remainingColumns = columns - rowLength;
					const breaksStartingThisLine =
						1 +
						Math.floor(
							(lengths[index] - remainingColumns - 1) / columns,
						);
					const breaksStartingNextLine = Math.floor(
						(lengths[index] - 1) / columns,
					);
					if (breaksStartingNextLine < breaksStartingThisLine) {
						rows.push("");
					}
					wrapWord(rows, word, columns);
					continue;
				}
				if (
					rowLength + lengths[index] > columns &&
					rowLength > 0 &&
					lengths[index] > 0
				) {
					if (options.wordWrap === false && rowLength < columns) {
						wrapWord(rows, word, columns);
						continue;
					}
					rows.push("");
				}
				if (
					rowLength + lengths[index] > columns &&
					options.wordWrap === false
				) {
					wrapWord(rows, word, columns);
					continue;
				}
				rows[rows.length - 1] += word;
			}
			if (options.trim !== false) {
				rows = rows.map(stringVisibleTrimSpacesRight);
			}
			const pre = [...rows.join("\n")];
			for (const [index, character] of pre.entries()) {
				returnValue += character;
				if (ESCAPES.has(character)) {
					const { groups } = new RegExp(
						`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`,
					).exec(pre.slice(index).join("")) || { groups: {} };
					if (groups.code !== void 0) {
						const code2 = Number.parseFloat(groups.code);
						escapeCode = code2 === END_CODE ? void 0 : code2;
					} else if (groups.uri !== void 0) {
						escapeUrl =
							groups.uri.length === 0 ? void 0 : groups.uri;
					}
				}
				const code = ansiStyles.codes.get(Number(escapeCode));
				if (pre[index + 1] === "\n") {
					if (escapeUrl) {
						returnValue += wrapAnsiHyperlink("");
					}
					if (escapeCode && code) {
						returnValue += wrapAnsi(code);
					}
				} else if (character === "\n") {
					if (escapeCode && code) {
						returnValue += wrapAnsi(escapeCode);
					}
					if (escapeUrl) {
						returnValue += wrapAnsiHyperlink(escapeUrl);
					}
				}
			}
			return returnValue;
		};
		module2.exports = (string, columns, options) => {
			return String(string)
				.normalize()
				.replace(/\r\n/g, "\n")
				.split("\n")
				.map((line) => exec(line, columns, options))
				.join("\n");
		};
	},
});

// node_modules/cliui/build/index.cjs
var require_build3 = __commonJS({
	"node_modules/cliui/build/index.cjs"(exports, module2) {
		"use strict";
		var align = {
			right: alignRight,
			center: alignCenter,
		};
		var top = 0;
		var right = 1;
		var bottom = 2;
		var left = 3;
		var UI = class {
			constructor(opts) {
				var _a;
				this.width = opts.width;
				this.wrap =
					(_a = opts.wrap) !== null && _a !== void 0 ? _a : true;
				this.rows = [];
			}
			span(...args) {
				const cols = this.div(...args);
				cols.span = true;
			}
			resetOutput() {
				this.rows = [];
			}
			div(...args) {
				if (args.length === 0) {
					this.div("");
				}
				if (
					this.wrap &&
					this.shouldApplyLayoutDSL(...args) &&
					typeof args[0] === "string"
				) {
					return this.applyLayoutDSL(args[0]);
				}
				const cols = args.map((arg) => {
					if (typeof arg === "string") {
						return this.colFromString(arg);
					}
					return arg;
				});
				this.rows.push(cols);
				return cols;
			}
			shouldApplyLayoutDSL(...args) {
				return (
					args.length === 1 &&
					typeof args[0] === "string" &&
					/[\t\n]/.test(args[0])
				);
			}
			applyLayoutDSL(str) {
				const rows = str.split("\n").map((row) => row.split("	"));
				let leftColumnWidth = 0;
				rows.forEach((columns) => {
					if (
						columns.length > 1 &&
						mixin.stringWidth(columns[0]) > leftColumnWidth
					) {
						leftColumnWidth = Math.min(
							Math.floor(this.width * 0.5),
							mixin.stringWidth(columns[0]),
						);
					}
				});
				rows.forEach((columns) => {
					this.div(
						...columns.map((r, i) => {
							return {
								text: r.trim(),
								padding: this.measurePadding(r),
								width:
									i === 0 && columns.length > 1
										? leftColumnWidth
										: void 0,
							};
						}),
					);
				});
				return this.rows[this.rows.length - 1];
			}
			colFromString(text) {
				return {
					text,
					padding: this.measurePadding(text),
				};
			}
			measurePadding(str) {
				const noAnsi = mixin.stripAnsi(str);
				return [
					0,
					noAnsi.match(/\s*$/)[0].length,
					0,
					noAnsi.match(/^\s*/)[0].length,
				];
			}
			toString() {
				const lines = [];
				this.rows.forEach((row) => {
					this.rowToString(row, lines);
				});
				return lines
					.filter((line) => !line.hidden)
					.map((line) => line.text)
					.join("\n");
			}
			rowToString(row, lines) {
				this.rasterize(row).forEach((rrow, r) => {
					let str = "";
					rrow.forEach((col, c) => {
						const { width } = row[c];
						const wrapWidth = this.negatePadding(row[c]);
						let ts = col;
						if (wrapWidth > mixin.stringWidth(col)) {
							ts += " ".repeat(
								wrapWidth - mixin.stringWidth(col),
							);
						}
						if (
							row[c].align &&
							row[c].align !== "left" &&
							this.wrap
						) {
							const fn = align[row[c].align];
							ts = fn(ts, wrapWidth);
							if (mixin.stringWidth(ts) < wrapWidth) {
								ts += " ".repeat(
									(width || 0) - mixin.stringWidth(ts) - 1,
								);
							}
						}
						const padding = row[c].padding || [0, 0, 0, 0];
						if (padding[left]) {
							str += " ".repeat(padding[left]);
						}
						str += addBorder(row[c], ts, "| ");
						str += ts;
						str += addBorder(row[c], ts, " |");
						if (padding[right]) {
							str += " ".repeat(padding[right]);
						}
						if (r === 0 && lines.length > 0) {
							str = this.renderInline(
								str,
								lines[lines.length - 1],
							);
						}
					});
					lines.push({
						text: str.replace(/ +$/, ""),
						span: row.span,
					});
				});
				return lines;
			}
			// if the full 'source' can render in
			// the target line, do so.
			renderInline(source, previousLine) {
				const match = source.match(/^ */);
				const leadingWhitespace = match ? match[0].length : 0;
				const target = previousLine.text;
				const targetTextWidth = mixin.stringWidth(target.trimRight());
				if (!previousLine.span) {
					return source;
				}
				if (!this.wrap) {
					previousLine.hidden = true;
					return target + source;
				}
				if (leadingWhitespace < targetTextWidth) {
					return source;
				}
				previousLine.hidden = true;
				return (
					target.trimRight() +
					" ".repeat(leadingWhitespace - targetTextWidth) +
					source.trimLeft()
				);
			}
			rasterize(row) {
				const rrows = [];
				const widths = this.columnWidths(row);
				let wrapped;
				row.forEach((col, c) => {
					col.width = widths[c];
					if (this.wrap) {
						wrapped = mixin
							.wrap(col.text, this.negatePadding(col), {
								hard: true,
							})
							.split("\n");
					} else {
						wrapped = col.text.split("\n");
					}
					if (col.border) {
						wrapped.unshift(
							"." + "-".repeat(this.negatePadding(col) + 2) + ".",
						);
						wrapped.push(
							"'" + "-".repeat(this.negatePadding(col) + 2) + "'",
						);
					}
					if (col.padding) {
						wrapped.unshift(
							...new Array(col.padding[top] || 0).fill(""),
						);
						wrapped.push(
							...new Array(col.padding[bottom] || 0).fill(""),
						);
					}
					wrapped.forEach((str, r) => {
						if (!rrows[r]) {
							rrows.push([]);
						}
						const rrow = rrows[r];
						for (let i = 0; i < c; i++) {
							if (rrow[i] === void 0) {
								rrow.push("");
							}
						}
						rrow.push(str);
					});
				});
				return rrows;
			}
			negatePadding(col) {
				let wrapWidth = col.width || 0;
				if (col.padding) {
					wrapWidth -=
						(col.padding[left] || 0) + (col.padding[right] || 0);
				}
				if (col.border) {
					wrapWidth -= 4;
				}
				return wrapWidth;
			}
			columnWidths(row) {
				if (!this.wrap) {
					return row.map((col) => {
						return col.width || mixin.stringWidth(col.text);
					});
				}
				let unset = row.length;
				let remainingWidth = this.width;
				const widths = row.map((col) => {
					if (col.width) {
						unset--;
						remainingWidth -= col.width;
						return col.width;
					}
					return void 0;
				});
				const unsetWidth = unset
					? Math.floor(remainingWidth / unset)
					: 0;
				return widths.map((w, i) => {
					if (w === void 0) {
						return Math.max(unsetWidth, _minWidth(row[i]));
					}
					return w;
				});
			}
		};
		function addBorder(col, ts, style) {
			if (col.border) {
				if (/[.']-+[.']/.test(ts)) {
					return "";
				}
				if (ts.trim().length !== 0) {
					return style;
				}
				return "  ";
			}
			return "";
		}
		function _minWidth(col) {
			const padding = col.padding || [];
			const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
			if (col.border) {
				return minWidth + 4;
			}
			return minWidth;
		}
		function getWindowWidth() {
			if (
				typeof process === "object" &&
				process.stdout &&
				process.stdout.columns
			) {
				return process.stdout.columns;
			}
			return 80;
		}
		function alignRight(str, width) {
			str = str.trim();
			const strWidth = mixin.stringWidth(str);
			if (strWidth < width) {
				return " ".repeat(width - strWidth) + str;
			}
			return str;
		}
		function alignCenter(str, width) {
			str = str.trim();
			const strWidth = mixin.stringWidth(str);
			if (strWidth >= width) {
				return str;
			}
			return " ".repeat((width - strWidth) >> 1) + str;
		}
		var mixin;
		function cliui(opts, _mixin) {
			mixin = _mixin;
			return new UI({
				width:
					(opts === null || opts === void 0 ? void 0 : opts.width) ||
					getWindowWidth(),
				wrap: opts === null || opts === void 0 ? void 0 : opts.wrap,
			});
		}
		var stringWidth = require_string_width();
		var stripAnsi = require_strip_ansi();
		var wrap = require_wrap_ansi();
		function ui(opts) {
			return cliui(opts, {
				stringWidth,
				stripAnsi,
				wrap,
			});
		}
		module2.exports = ui;
	},
});

// node_modules/escalade/sync/index.js
var require_sync = __commonJS({
	"node_modules/escalade/sync/index.js"(exports, module2) {
		var { dirname, resolve } = require("path");
		var { readdirSync, statSync } = require("fs");
		module2.exports = function (start, callback) {
			let dir = resolve(".", start);
			let tmp,
				stats = statSync(dir);
			if (!stats.isDirectory()) {
				dir = dirname(dir);
			}
			while (true) {
				tmp = callback(dir, readdirSync(dir));
				if (tmp) return resolve(dir, tmp);
				dir = dirname((tmp = dir));
				if (tmp === dir) break;
			}
		};
	},
});

// node_modules/get-caller-file/index.js
var require_get_caller_file = __commonJS({
	"node_modules/get-caller-file/index.js"(exports, module2) {
		"use strict";
		module2.exports = function getCallerFile(position) {
			if (position === void 0) {
				position = 2;
			}
			if (position >= Error.stackTraceLimit) {
				throw new TypeError(
					"getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" +
						position +
						"` and Error.stackTraceLimit was: `" +
						Error.stackTraceLimit +
						"`",
				);
			}
			var oldPrepareStackTrace = Error.prepareStackTrace;
			Error.prepareStackTrace = function (_, stack2) {
				return stack2;
			};
			var stack = new Error().stack;
			Error.prepareStackTrace = oldPrepareStackTrace;
			if (stack !== null && typeof stack === "object") {
				return stack[position] ? stack[position].getFileName() : void 0;
			}
		};
	},
});

// node_modules/require-directory/index.js
var require_require_directory = __commonJS({
	"node_modules/require-directory/index.js"(exports, module2) {
		"use strict";
		var fs = require("fs");
		var join = require("path").join;
		var resolve = require("path").resolve;
		var dirname = require("path").dirname;
		var defaultOptions = {
			extensions: ["js", "json", "coffee"],
			recurse: true,
			rename: function (name) {
				return name;
			},
			visit: function (obj) {
				return obj;
			},
		};
		function checkFileInclusion(path, filename, options) {
			return (
				// verify file has valid extension
				new RegExp(
					"\\.(" + options.extensions.join("|") + ")$",
					"i",
				).test(filename) && // if options.include is a RegExp, evaluate it and make sure the path passes
				!(
					options.include &&
					options.include instanceof RegExp &&
					!options.include.test(path)
				) && // if options.include is a function, evaluate it and make sure the path passes
				!(
					options.include &&
					typeof options.include === "function" &&
					!options.include(path, filename)
				) && // if options.exclude is a RegExp, evaluate it and make sure the path doesn't pass
				!(
					options.exclude &&
					options.exclude instanceof RegExp &&
					options.exclude.test(path)
				) && // if options.exclude is a function, evaluate it and make sure the path doesn't pass
				!(
					options.exclude &&
					typeof options.exclude === "function" &&
					options.exclude(path, filename)
				)
			);
		}
		function requireDirectory(m, path, options) {
			var retval = {};
			if (path && !options && typeof path !== "string") {
				options = path;
				path = null;
			}
			options = options || {};
			for (var prop in defaultOptions) {
				if (typeof options[prop] === "undefined") {
					options[prop] = defaultOptions[prop];
				}
			}
			path = !path
				? dirname(m.filename)
				: resolve(dirname(m.filename), path);
			fs.readdirSync(path).forEach(function (filename) {
				var joined = join(path, filename),
					files,
					key,
					obj;
				if (fs.statSync(joined).isDirectory() && options.recurse) {
					files = requireDirectory(m, joined, options);
					if (Object.keys(files).length) {
						retval[options.rename(filename, joined, filename)] =
							files;
					}
				} else {
					if (
						joined !== m.filename &&
						checkFileInclusion(joined, filename, options)
					) {
						key = filename.substring(0, filename.lastIndexOf("."));
						obj = m.require(joined);
						retval[options.rename(key, joined, filename)] =
							options.visit(obj, joined, filename) || obj;
					}
				}
			});
			return retval;
		}
		module2.exports = requireDirectory;
		module2.exports.defaults = defaultOptions;
	},
});

// node_modules/yargs/build/index.cjs
var require_build4 = __commonJS({
	"node_modules/yargs/build/index.cjs"(exports, module2) {
		"use strict";
		var t = require("assert");
		var e = class extends Error {
			constructor(t2) {
				super(t2 || "yargs error"),
					(this.name = "YError"),
					Error.captureStackTrace(this, e);
			}
		};
		var s;
		var i = [];
		function n(t2, o2, a2, h2) {
			s = h2;
			let l2 = {};
			if (Object.prototype.hasOwnProperty.call(t2, "extends")) {
				if ("string" != typeof t2.extends) return l2;
				const r2 = /\.json|\..*rc$/.test(t2.extends);
				let h3 = null;
				if (r2)
					h3 = (function (t3, e2) {
						return s.path.resolve(t3, e2);
					})(o2, t2.extends);
				else
					try {
						h3 = require.resolve(t2.extends);
					} catch (e2) {
						return t2;
					}
				!(function (t3) {
					if (i.indexOf(t3) > -1)
						throw new e(
							`Circular extended configurations: '${t3}'.`,
						);
				})(h3),
					i.push(h3),
					(l2 = r2
						? JSON.parse(s.readFileSync(h3, "utf8"))
						: require(t2.extends)),
					delete t2.extends,
					(l2 = n(l2, s.path.dirname(h3), a2, s));
			}
			return (i = []), a2 ? r(l2, t2) : Object.assign({}, l2, t2);
		}
		function r(t2, e2) {
			const s2 = {};
			function i2(t3) {
				return t3 && "object" == typeof t3 && !Array.isArray(t3);
			}
			Object.assign(s2, t2);
			for (const n2 of Object.keys(e2))
				i2(e2[n2]) && i2(s2[n2])
					? (s2[n2] = r(t2[n2], e2[n2]))
					: (s2[n2] = e2[n2]);
			return s2;
		}
		function o(t2) {
			const e2 = t2.replace(/\s{2,}/g, " ").split(/\s+(?![^[]*]|[^<]*>)/),
				s2 = /\.*[\][<>]/g,
				i2 = e2.shift();
			if (!i2) throw new Error(`No command found in: ${t2}`);
			const n2 = { cmd: i2.replace(s2, ""), demanded: [], optional: [] };
			return (
				e2.forEach((t3, i3) => {
					let r2 = false;
					(t3 = t3.replace(/\s/g, "")),
						/\.+[\]>]/.test(t3) &&
							i3 === e2.length - 1 &&
							(r2 = true),
						/^\[/.test(t3)
							? n2.optional.push({
									cmd: t3.replace(s2, "").split("|"),
									variadic: r2,
								})
							: n2.demanded.push({
									cmd: t3.replace(s2, "").split("|"),
									variadic: r2,
								});
				}),
				n2
			);
		}
		var a = ["first", "second", "third", "fourth", "fifth", "sixth"];
		function h(t2, s2, i2) {
			try {
				let n2 = 0;
				const [r2, a2, h2] =
						"object" == typeof t2
							? [{ demanded: [], optional: [] }, t2, s2]
							: [o(`cmd ${t2}`), s2, i2],
					f2 = [].slice.call(a2);
				for (; f2.length && void 0 === f2[f2.length - 1]; ) f2.pop();
				const d2 = h2 || f2.length;
				if (d2 < r2.demanded.length)
					throw new e(
						`Not enough arguments provided. Expected ${r2.demanded.length} but received ${f2.length}.`,
					);
				const u2 = r2.demanded.length + r2.optional.length;
				if (d2 > u2)
					throw new e(
						`Too many arguments provided. Expected max ${u2} but received ${d2}.`,
					);
				r2.demanded.forEach((t3) => {
					const e2 = l(f2.shift());
					0 ===
						t3.cmd.filter((t4) => t4 === e2 || "*" === t4).length &&
						c(e2, t3.cmd, n2),
						(n2 += 1);
				}),
					r2.optional.forEach((t3) => {
						if (0 === f2.length) return;
						const e2 = l(f2.shift());
						0 ===
							t3.cmd.filter((t4) => t4 === e2 || "*" === t4)
								.length && c(e2, t3.cmd, n2),
							(n2 += 1);
					});
			} catch (t3) {
				console.warn(t3.stack);
			}
		}
		function l(t2) {
			return Array.isArray(t2)
				? "array"
				: null === t2
					? "null"
					: typeof t2;
		}
		function c(t2, s2, i2) {
			throw new e(
				`Invalid ${a[i2] || "manyith"} argument. Expected ${s2.join(" or ")} but received ${t2}.`,
			);
		}
		function f(t2) {
			return !!t2 && !!t2.then && "function" == typeof t2.then;
		}
		function d(t2, e2, s2, i2) {
			s2.assert.notStrictEqual(t2, e2, i2);
		}
		function u(t2, e2) {
			e2.assert.strictEqual(typeof t2, "string");
		}
		function p(t2) {
			return Object.keys(t2);
		}
		function g(t2 = {}, e2 = () => true) {
			const s2 = {};
			return (
				p(t2).forEach((i2) => {
					e2(i2, t2[i2]) && (s2[i2] = t2[i2]);
				}),
				s2
			);
		}
		function m() {
			return process.versions.electron && !process.defaultApp ? 0 : 1;
		}
		function y() {
			return process.argv[m()];
		}
		var b = Object.freeze({
			__proto__: null,
			hideBin: function (t2) {
				return t2.slice(m() + 1);
			},
			getProcessArgvBin: y,
		});
		function v(t2, e2, s2, i2) {
			if ("a" === s2 && !i2)
				throw new TypeError(
					"Private accessor was defined without a getter",
				);
			if ("function" == typeof e2 ? t2 !== e2 || !i2 : !e2.has(t2))
				throw new TypeError(
					"Cannot read private member from an object whose class did not declare it",
				);
			return "m" === s2
				? i2
				: "a" === s2
					? i2.call(t2)
					: i2
						? i2.value
						: e2.get(t2);
		}
		function O(t2, e2, s2, i2, n2) {
			if ("m" === i2)
				throw new TypeError("Private method is not writable");
			if ("a" === i2 && !n2)
				throw new TypeError(
					"Private accessor was defined without a setter",
				);
			if ("function" == typeof e2 ? t2 !== e2 || !n2 : !e2.has(t2))
				throw new TypeError(
					"Cannot write private member to an object whose class did not declare it",
				);
			return (
				"a" === i2
					? n2.call(t2, s2)
					: n2
						? (n2.value = s2)
						: e2.set(t2, s2),
				s2
			);
		}
		var w = class {
			constructor(t2) {
				(this.globalMiddleware = []),
					(this.frozens = []),
					(this.yargs = t2);
			}
			addMiddleware(t2, e2, s2 = true, i2 = false) {
				if (
					(h(
						"<array|function> [boolean] [boolean] [boolean]",
						[t2, e2, s2],
						arguments.length,
					),
					Array.isArray(t2))
				) {
					for (let i3 = 0; i3 < t2.length; i3++) {
						if ("function" != typeof t2[i3])
							throw Error("middleware must be a function");
						const n2 = t2[i3];
						(n2.applyBeforeValidation = e2), (n2.global = s2);
					}
					Array.prototype.push.apply(this.globalMiddleware, t2);
				} else if ("function" == typeof t2) {
					const n2 = t2;
					(n2.applyBeforeValidation = e2),
						(n2.global = s2),
						(n2.mutates = i2),
						this.globalMiddleware.push(t2);
				}
				return this.yargs;
			}
			addCoerceMiddleware(t2, e2) {
				const s2 = this.yargs.getAliases();
				return (
					(this.globalMiddleware = this.globalMiddleware.filter(
						(t3) => {
							const i2 = [...(s2[e2] || []), e2];
							return !t3.option || !i2.includes(t3.option);
						},
					)),
					(t2.option = e2),
					this.addMiddleware(t2, true, true, true)
				);
			}
			getMiddleware() {
				return this.globalMiddleware;
			}
			freeze() {
				this.frozens.push([...this.globalMiddleware]);
			}
			unfreeze() {
				const t2 = this.frozens.pop();
				void 0 !== t2 && (this.globalMiddleware = t2);
			}
			reset() {
				this.globalMiddleware = this.globalMiddleware.filter(
					(t2) => t2.global,
				);
			}
		};
		function C(t2, e2, s2, i2) {
			return s2.reduce((t3, s3) => {
				if (s3.applyBeforeValidation !== i2) return t3;
				if (s3.mutates) {
					if (s3.applied) return t3;
					s3.applied = true;
				}
				if (f(t3))
					return t3
						.then((t4) => Promise.all([t4, s3(t4, e2)]))
						.then(([t4, e3]) => Object.assign(t4, e3));
				{
					const i3 = s3(t3, e2);
					return f(i3)
						? i3.then((e3) => Object.assign(t3, e3))
						: Object.assign(t3, i3);
				}
			}, t2);
		}
		function j(
			t2,
			e2,
			s2 = (t3) => {
				throw t3;
			},
		) {
			try {
				const s3 = "function" == typeof t2 ? t2() : t2;
				return f(s3) ? s3.then((t3) => e2(t3)) : e2(s3);
			} catch (t3) {
				return s2(t3);
			}
		}
		var _ = /(^\*)|(^\$0)/;
		var M = class {
			constructor(t2, e2, s2, i2) {
				(this.requireCache = /* @__PURE__ */ new Set()),
					(this.handlers = {}),
					(this.aliasMap = {}),
					(this.frozens = []),
					(this.shim = i2),
					(this.usage = t2),
					(this.globalMiddleware = s2),
					(this.validation = e2);
			}
			addDirectory(t2, e2, s2, i2) {
				"boolean" != typeof (i2 = i2 || {}).recurse &&
					(i2.recurse = false),
					Array.isArray(i2.extensions) || (i2.extensions = ["js"]);
				const n2 =
					"function" == typeof i2.visit ? i2.visit : (t3) => t3;
				(i2.visit = (t3, e3, s3) => {
					const i3 = n2(t3, e3, s3);
					if (i3) {
						if (this.requireCache.has(e3)) return i3;
						this.requireCache.add(e3), this.addHandler(i3);
					}
					return i3;
				}),
					this.shim.requireDirectory(
						{ require: e2, filename: s2 },
						t2,
						i2,
					);
			}
			addHandler(t2, e2, s2, i2, n2, r2) {
				let a2 = [];
				const h2 = (function (t3) {
					return t3
						? t3.map(
								(t4) => (
									(t4.applyBeforeValidation = false), t4
								),
							)
						: [];
				})(n2);
				if (((i2 = i2 || (() => {})), Array.isArray(t2)))
					if (
						(function (t3) {
							return t3.every((t4) => "string" == typeof t4);
						})(t2)
					)
						[t2, ...a2] = t2;
					else for (const e3 of t2) this.addHandler(e3);
				else {
					if (
						(function (t3) {
							return "object" == typeof t3 && !Array.isArray(t3);
						})(t2)
					) {
						let e3 =
							Array.isArray(t2.command) ||
							"string" == typeof t2.command
								? t2.command
								: this.moduleName(t2);
						return (
							t2.aliases &&
								(e3 = [].concat(e3).concat(t2.aliases)),
							void this.addHandler(
								e3,
								this.extractDesc(t2),
								t2.builder,
								t2.handler,
								t2.middlewares,
								t2.deprecated,
							)
						);
					}
					if (k(s2))
						return void this.addHandler(
							[t2].concat(a2),
							e2,
							s2.builder,
							s2.handler,
							s2.middlewares,
							s2.deprecated,
						);
				}
				if ("string" == typeof t2) {
					const n3 = o(t2);
					a2 = a2.map((t3) => o(t3).cmd);
					let l2 = false;
					const c2 = [n3.cmd]
						.concat(a2)
						.filter((t3) => !_.test(t3) || ((l2 = true), false));
					0 === c2.length && l2 && c2.push("$0"),
						l2 &&
							((n3.cmd = c2[0]),
							(a2 = c2.slice(1)),
							(t2 = t2.replace(_, n3.cmd))),
						a2.forEach((t3) => {
							this.aliasMap[t3] = n3.cmd;
						}),
						false !== e2 && this.usage.command(t2, e2, l2, a2, r2),
						(this.handlers[n3.cmd] = {
							original: t2,
							description: e2,
							handler: i2,
							builder: s2 || {},
							middlewares: h2,
							deprecated: r2,
							demanded: n3.demanded,
							optional: n3.optional,
						}),
						l2 && (this.defaultCommand = this.handlers[n3.cmd]);
				}
			}
			getCommandHandlers() {
				return this.handlers;
			}
			getCommands() {
				return Object.keys(this.handlers).concat(
					Object.keys(this.aliasMap),
				);
			}
			hasDefaultCommand() {
				return !!this.defaultCommand;
			}
			runCommand(t2, e2, s2, i2, n2, r2) {
				const o2 =
						this.handlers[t2] ||
						this.handlers[this.aliasMap[t2]] ||
						this.defaultCommand,
					a2 = e2.getInternalMethods().getContext(),
					h2 = a2.commands.slice(),
					l2 = !t2;
				t2 && (a2.commands.push(t2), a2.fullCommands.push(o2.original));
				const c2 = this.applyBuilderUpdateUsageAndParse(
					l2,
					o2,
					e2,
					s2.aliases,
					h2,
					i2,
					n2,
					r2,
				);
				return f(c2)
					? c2.then((t3) =>
							this.applyMiddlewareAndGetResult(
								l2,
								o2,
								t3.innerArgv,
								a2,
								n2,
								t3.aliases,
								e2,
							),
						)
					: this.applyMiddlewareAndGetResult(
							l2,
							o2,
							c2.innerArgv,
							a2,
							n2,
							c2.aliases,
							e2,
						);
			}
			applyBuilderUpdateUsageAndParse(t2, e2, s2, i2, n2, r2, o2, a2) {
				const h2 = e2.builder;
				let l2 = s2;
				if (x(h2)) {
					const c2 = h2(s2.getInternalMethods().reset(i2), a2);
					if (f(c2))
						return c2.then((i3) => {
							var a3;
							return (
								(l2 =
									(a3 = i3) &&
									"function" == typeof a3.getInternalMethods
										? i3
										: s2),
								this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2)
							);
						});
				} else
					(function (t3) {
						return "object" == typeof t3;
					})(h2) &&
						((l2 = s2.getInternalMethods().reset(i2)),
						Object.keys(e2.builder).forEach((t3) => {
							l2.option(t3, h2[t3]);
						}));
				return this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2);
			}
			parseAndUpdateUsage(t2, e2, s2, i2, n2, r2) {
				t2 && s2.getInternalMethods().getUsageInstance().unfreeze(true),
					this.shouldUpdateUsage(s2) &&
						s2
							.getInternalMethods()
							.getUsageInstance()
							.usage(
								this.usageFromParentCommandsCommandHandler(
									i2,
									e2,
								),
								e2.description,
							);
				const o2 = s2
					.getInternalMethods()
					.runYargsParserAndExecuteCommands(
						null,
						void 0,
						true,
						n2,
						r2,
					);
				return f(o2)
					? o2.then((t3) => ({
							aliases: s2.parsed.aliases,
							innerArgv: t3,
						}))
					: { aliases: s2.parsed.aliases, innerArgv: o2 };
			}
			shouldUpdateUsage(t2) {
				return (
					!t2
						.getInternalMethods()
						.getUsageInstance()
						.getUsageDisabled() &&
					0 ===
						t2.getInternalMethods().getUsageInstance().getUsage()
							.length
				);
			}
			usageFromParentCommandsCommandHandler(t2, e2) {
				const s2 = _.test(e2.original)
						? e2.original.replace(_, "").trim()
						: e2.original,
					i2 = t2.filter((t3) => !_.test(t3));
				return i2.push(s2), `$0 ${i2.join(" ")}`;
			}
			applyMiddlewareAndGetResult(t2, e2, s2, i2, n2, r2, o2) {
				let a2 = {};
				if (n2) return s2;
				o2.getInternalMethods().getHasOutput() ||
					(a2 = this.populatePositionals(e2, s2, i2, o2));
				const h2 = this.globalMiddleware
					.getMiddleware()
					.slice(0)
					.concat(e2.middlewares);
				if (
					((s2 = C(s2, o2, h2, true)),
					!o2.getInternalMethods().getHasOutput())
				) {
					const e3 = o2
						.getInternalMethods()
						.runValidation(r2, a2, o2.parsed.error, t2);
					s2 = j(s2, (t3) => (e3(t3), t3));
				}
				if (e2.handler && !o2.getInternalMethods().getHasOutput()) {
					o2.getInternalMethods().setHasOutput();
					const i3 = !!o2.getOptions().configuration["populate--"];
					o2.getInternalMethods().postProcess(s2, i3, false, false),
						(s2 = j((s2 = C(s2, o2, h2, false)), (t3) => {
							const s3 = e2.handler(t3);
							return f(s3) ? s3.then(() => t3) : t3;
						})),
						t2 ||
							o2
								.getInternalMethods()
								.getUsageInstance()
								.cacheHelpMessage(),
						f(s2) &&
							!o2.getInternalMethods().hasParseCallback() &&
							s2.catch((t3) => {
								try {
									o2.getInternalMethods()
										.getUsageInstance()
										.fail(null, t3);
								} catch (t4) {}
							});
				}
				return t2 || (i2.commands.pop(), i2.fullCommands.pop()), s2;
			}
			populatePositionals(t2, e2, s2, i2) {
				e2._ = e2._.slice(s2.commands.length);
				const n2 = t2.demanded.slice(0),
					r2 = t2.optional.slice(0),
					o2 = {};
				for (
					this.validation.positionalCount(n2.length, e2._.length);
					n2.length;

				) {
					const t3 = n2.shift();
					this.populatePositional(t3, e2, o2);
				}
				for (; r2.length; ) {
					const t3 = r2.shift();
					this.populatePositional(t3, e2, o2);
				}
				return (
					(e2._ = s2.commands.concat(e2._.map((t3) => "" + t3))),
					this.postProcessPositionals(
						e2,
						o2,
						this.cmdToParseOptions(t2.original),
						i2,
					),
					o2
				);
			}
			populatePositional(t2, e2, s2) {
				const i2 = t2.cmd[0];
				t2.variadic
					? (s2[i2] = e2._.splice(0).map(String))
					: e2._.length && (s2[i2] = [String(e2._.shift())]);
			}
			cmdToParseOptions(t2) {
				const e2 = { array: [], default: {}, alias: {}, demand: {} },
					s2 = o(t2);
				return (
					s2.demanded.forEach((t3) => {
						const [s3, ...i2] = t3.cmd;
						t3.variadic &&
							(e2.array.push(s3), (e2.default[s3] = [])),
							(e2.alias[s3] = i2),
							(e2.demand[s3] = true);
					}),
					s2.optional.forEach((t3) => {
						const [s3, ...i2] = t3.cmd;
						t3.variadic &&
							(e2.array.push(s3), (e2.default[s3] = [])),
							(e2.alias[s3] = i2);
					}),
					e2
				);
			}
			postProcessPositionals(t2, e2, s2, i2) {
				const n2 = Object.assign({}, i2.getOptions());
				n2.default = Object.assign(s2.default, n2.default);
				for (const t3 of Object.keys(s2.alias))
					n2.alias[t3] = (n2.alias[t3] || []).concat(s2.alias[t3]);
				(n2.array = n2.array.concat(s2.array)), (n2.config = {});
				const r2 = [];
				if (
					(Object.keys(e2).forEach((t3) => {
						e2[t3].map((e3) => {
							n2.configuration["unknown-options-as-args"] &&
								(n2.key[t3] = true),
								r2.push(`--${t3}`),
								r2.push(e3);
						});
					}),
					!r2.length)
				)
					return;
				const o2 = Object.assign({}, n2.configuration, {
						"populate--": false,
					}),
					a2 = this.shim.Parser.detailed(
						r2,
						Object.assign({}, n2, { configuration: o2 }),
					);
				if (a2.error)
					i2.getInternalMethods()
						.getUsageInstance()
						.fail(a2.error.message, a2.error);
				else {
					const s3 = Object.keys(e2);
					Object.keys(e2).forEach((t3) => {
						s3.push(...a2.aliases[t3]);
					});
					const n3 = i2.getOptions().default;
					Object.keys(a2.argv).forEach((i3) => {
						s3.includes(i3) &&
							(e2[i3] || (e2[i3] = a2.argv[i3]),
							!Object.hasOwnProperty.call(n3, i3) &&
							Object.hasOwnProperty.call(t2, i3) &&
							Object.hasOwnProperty.call(a2.argv, i3) &&
							(Array.isArray(t2[i3]) ||
								Array.isArray(a2.argv[i3]))
								? (t2[i3] = [].concat(t2[i3], a2.argv[i3]))
								: (t2[i3] = a2.argv[i3]));
					});
				}
			}
			runDefaultBuilderOn(t2) {
				if (!this.defaultCommand) return;
				if (this.shouldUpdateUsage(t2)) {
					const e3 = _.test(this.defaultCommand.original)
						? this.defaultCommand.original
						: this.defaultCommand.original.replace(
								/^[^[\]<>]*/,
								"$0 ",
							);
					t2.getInternalMethods()
						.getUsageInstance()
						.usage(e3, this.defaultCommand.description);
				}
				const e2 = this.defaultCommand.builder;
				if (x(e2)) return e2(t2, true);
				k(e2) ||
					Object.keys(e2).forEach((s2) => {
						t2.option(s2, e2[s2]);
					});
			}
			moduleName(t2) {
				const e2 = (function (t3) {
					if ("undefined" == typeof require) return null;
					for (
						let e3, s2 = 0, i2 = Object.keys(require.cache);
						s2 < i2.length;
						s2++
					)
						if (((e3 = require.cache[i2[s2]]), e3.exports === t3))
							return e3;
					return null;
				})(t2);
				if (!e2)
					throw new Error(
						`No command name given for module: ${this.shim.inspect(t2)}`,
					);
				return this.commandFromFilename(e2.filename);
			}
			commandFromFilename(t2) {
				return this.shim.path.basename(t2, this.shim.path.extname(t2));
			}
			extractDesc({ describe: t2, description: e2, desc: s2 }) {
				for (const i2 of [t2, e2, s2]) {
					if ("string" == typeof i2 || false === i2) return i2;
					d(i2, true, this.shim);
				}
				return false;
			}
			freeze() {
				this.frozens.push({
					handlers: this.handlers,
					aliasMap: this.aliasMap,
					defaultCommand: this.defaultCommand,
				});
			}
			unfreeze() {
				const t2 = this.frozens.pop();
				d(t2, void 0, this.shim),
					({
						handlers: this.handlers,
						aliasMap: this.aliasMap,
						defaultCommand: this.defaultCommand,
					} = t2);
			}
			reset() {
				return (
					(this.handlers = {}),
					(this.aliasMap = {}),
					(this.defaultCommand = void 0),
					(this.requireCache = /* @__PURE__ */ new Set()),
					this
				);
			}
		};
		function k(t2) {
			return (
				"object" == typeof t2 &&
				!!t2.builder &&
				"function" == typeof t2.handler
			);
		}
		function x(t2) {
			return "function" == typeof t2;
		}
		function E(t2) {
			"undefined" != typeof process &&
				[process.stdout, process.stderr].forEach((e2) => {
					const s2 = e2;
					s2._handle &&
						s2.isTTY &&
						"function" == typeof s2._handle.setBlocking &&
						s2._handle.setBlocking(t2);
				});
		}
		function A(t2) {
			return "boolean" == typeof t2;
		}
		function P(t2, s2) {
			const i2 = s2.y18n.__,
				n2 = {},
				r2 = [];
			n2.failFn = function (t3) {
				r2.push(t3);
			};
			let o2 = null,
				a2 = null,
				h2 = true;
			n2.showHelpOnFail = function (e2 = true, s3) {
				const [i3, r3] = "string" == typeof e2 ? [true, e2] : [e2, s3];
				return (
					t2.getInternalMethods().isGlobalContext() && (a2 = r3),
					(o2 = r3),
					(h2 = i3),
					n2
				);
			};
			let l2 = false;
			n2.fail = function (s3, i3) {
				const c3 = t2.getInternalMethods().getLoggerInstance();
				if (!r2.length) {
					if ((t2.getExitProcess() && E(true), !l2)) {
						(l2 = true),
							h2 && (t2.showHelp("error"), c3.error()),
							(s3 || i3) && c3.error(s3 || i3);
						const e2 = o2 || a2;
						e2 && ((s3 || i3) && c3.error(""), c3.error(e2));
					}
					if (((i3 = i3 || new e(s3)), t2.getExitProcess()))
						return t2.exit(1);
					if (t2.getInternalMethods().hasParseCallback())
						return t2.exit(1, i3);
					throw i3;
				}
				for (let t3 = r2.length - 1; t3 >= 0; --t3) {
					const e2 = r2[t3];
					if (A(e2)) {
						if (i3) throw i3;
						if (s3) throw Error(s3);
					} else e2(s3, i3, n2);
				}
			};
			let c2 = [],
				f2 = false;
			(n2.usage = (t3, e2) =>
				null === t3
					? ((f2 = true), (c2 = []), n2)
					: ((f2 = false), c2.push([t3, e2 || ""]), n2)),
				(n2.getUsage = () => c2),
				(n2.getUsageDisabled = () => f2),
				(n2.getPositionalGroupName = () => i2("Positionals:"));
			let d2 = [];
			n2.example = (t3, e2) => {
				d2.push([t3, e2 || ""]);
			};
			let u2 = [];
			(n2.command = function (t3, e2, s3, i3, n3 = false) {
				s3 && (u2 = u2.map((t4) => ((t4[2] = false), t4))),
					u2.push([t3, e2 || "", s3, i3, n3]);
			}),
				(n2.getCommands = () => u2);
			let p2 = {};
			(n2.describe = function (t3, e2) {
				Array.isArray(t3)
					? t3.forEach((t4) => {
							n2.describe(t4, e2);
						})
					: "object" == typeof t3
						? Object.keys(t3).forEach((e3) => {
								n2.describe(e3, t3[e3]);
							})
						: (p2[t3] = e2);
			}),
				(n2.getDescriptions = () => p2);
			let m2 = [];
			n2.epilog = (t3) => {
				m2.push(t3);
			};
			let y2,
				b2 = false;
			function v2() {
				return (
					b2 ||
						((y2 = (function () {
							const t3 = 80;
							return s2.process.stdColumns
								? Math.min(t3, s2.process.stdColumns)
								: t3;
						})()),
						(b2 = true)),
					y2
				);
			}
			n2.wrap = (t3) => {
				(b2 = true), (y2 = t3);
			};
			const O2 = "__yargsString__:";
			function w2(t3, e2, i3) {
				let n3 = 0;
				return (
					Array.isArray(t3) ||
						(t3 = Object.values(t3).map((t4) => [t4])),
					t3.forEach((t4) => {
						n3 = Math.max(
							s2.stringWidth(
								i3 ? `${i3} ${I(t4[0])}` : I(t4[0]),
							) + $(t4[0]),
							n3,
						);
					}),
					e2 &&
						(n3 = Math.min(
							n3,
							parseInt((0.5 * e2).toString(), 10),
						)),
					n3
				);
			}
			let C2;
			function j2(e2) {
				return (
					t2.getOptions().hiddenOptions.indexOf(e2) < 0 ||
					t2.parsed.argv[t2.getOptions().showHiddenOpt]
				);
			}
			function _2(t3, e2) {
				let s3 = `[${i2("default:")} `;
				if (void 0 === t3 && !e2) return null;
				if (e2) s3 += e2;
				else
					switch (typeof t3) {
						case "string":
							s3 += `"${t3}"`;
							break;
						case "object":
							s3 += JSON.stringify(t3);
							break;
						default:
							s3 += t3;
					}
				return `${s3}]`;
			}
			(n2.deferY18nLookup = (t3) => O2 + t3),
				(n2.help = function () {
					if (C2) return C2;
					!(function () {
						const e3 = t2.getDemandedOptions(),
							s3 = t2.getOptions();
						(Object.keys(s3.alias) || []).forEach((i3) => {
							s3.alias[i3].forEach((r4) => {
								p2[r4] && n2.describe(i3, p2[r4]),
									r4 in e3 && t2.demandOption(i3, e3[r4]),
									s3.boolean.includes(r4) && t2.boolean(i3),
									s3.count.includes(r4) && t2.count(i3),
									s3.string.includes(r4) && t2.string(i3),
									s3.normalize.includes(r4) &&
										t2.normalize(i3),
									s3.array.includes(r4) && t2.array(i3),
									s3.number.includes(r4) && t2.number(i3);
							});
						});
					})();
					const e2 = t2.customScriptName
							? t2.$0
							: s2.path.basename(t2.$0),
						r3 = t2.getDemandedOptions(),
						o3 = t2.getDemandedCommands(),
						a3 = t2.getDeprecatedOptions(),
						h3 = t2.getGroups(),
						l3 = t2.getOptions();
					let g2 = [];
					(g2 = g2.concat(Object.keys(p2))),
						(g2 = g2.concat(Object.keys(r3))),
						(g2 = g2.concat(Object.keys(o3))),
						(g2 = g2.concat(Object.keys(l3.default))),
						(g2 = g2.filter(j2)),
						(g2 = Object.keys(
							g2.reduce(
								(t3, e3) => ("_" !== e3 && (t3[e3] = true), t3),
								{},
							),
						));
					const y3 = v2(),
						b3 = s2.cliui({ width: y3, wrap: !!y3 });
					if (!f2) {
						if (c2.length)
							c2.forEach((t3) => {
								b3.div({
									text: `${t3[0].replace(/\$0/g, e2)}`,
								}),
									t3[1] &&
										b3.div({
											text: `${t3[1]}`,
											padding: [1, 0, 0, 0],
										});
							}),
								b3.div();
						else if (u2.length) {
							let t3 = null;
							(t3 = o3._
								? `${e2} <${i2("command")}>
`
								: `${e2} [${i2("command")}]
`),
								b3.div(`${t3}`);
						}
					}
					if (u2.length > 1 || (1 === u2.length && !u2[0][2])) {
						b3.div(i2("Commands:"));
						const s3 = t2.getInternalMethods().getContext(),
							n3 = s3.commands.length
								? `${s3.commands.join(" ")} `
								: "";
						true ===
							t2.getInternalMethods().getParserConfiguration()[
								"sort-commands"
							] &&
							(u2 = u2.sort((t3, e3) =>
								t3[0].localeCompare(e3[0]),
							));
						const r4 = e2 ? `${e2} ` : "";
						u2.forEach((t3) => {
							const s4 = `${r4}${n3}${t3[0].replace(/^\$0 ?/, "")}`;
							b3.span(
								{
									text: s4,
									padding: [0, 2, 0, 2],
									width: w2(u2, y3, `${e2}${n3}`) + 4,
								},
								{ text: t3[1] },
							);
							const o4 = [];
							t3[2] && o4.push(`[${i2("default")}]`),
								t3[3] &&
									t3[3].length &&
									o4.push(
										`[${i2("aliases:")} ${t3[3].join(", ")}]`,
									),
								t3[4] &&
									("string" == typeof t3[4]
										? o4.push(
												`[${i2("deprecated: %s", t3[4])}]`,
											)
										: o4.push(`[${i2("deprecated")}]`)),
								o4.length
									? b3.div({
											text: o4.join(" "),
											padding: [0, 0, 0, 2],
											align: "right",
										})
									: b3.div();
						}),
							b3.div();
					}
					const M3 = (Object.keys(l3.alias) || []).concat(
						Object.keys(t2.parsed.newAliases) || [],
					);
					g2 = g2.filter(
						(e3) =>
							!t2.parsed.newAliases[e3] &&
							M3.every(
								(t3) => -1 === (l3.alias[t3] || []).indexOf(e3),
							),
					);
					const k3 = i2("Options:");
					h3[k3] || (h3[k3] = []),
						(function (t3, e3, s3, i3) {
							let n3 = [],
								r4 = null;
							Object.keys(s3).forEach((t4) => {
								n3 = n3.concat(s3[t4]);
							}),
								t3.forEach((t4) => {
									(r4 = [t4].concat(e3[t4])),
										r4.some(
											(t5) => -1 !== n3.indexOf(t5),
										) || s3[i3].push(t4);
								});
						})(g2, l3.alias, h3, k3);
					const x2 = (t3) => /^--/.test(I(t3)),
						E2 = Object.keys(h3)
							.filter((t3) => h3[t3].length > 0)
							.map((t3) => ({
								groupName: t3,
								normalizedKeys: h3[t3].filter(j2).map((t4) => {
									if (M3.includes(t4)) return t4;
									for (
										let e3, s3 = 0;
										void 0 !== (e3 = M3[s3]);
										s3++
									)
										if ((l3.alias[e3] || []).includes(t4))
											return e3;
									return t4;
								}),
							}))
							.filter(({ normalizedKeys: t3 }) => t3.length > 0)
							.map(({ groupName: t3, normalizedKeys: e3 }) => {
								const s3 = e3.reduce(
									(e4, s4) => (
										(e4[s4] = [s4]
											.concat(l3.alias[s4] || [])
											.map((e5) =>
												t3 ===
												n2.getPositionalGroupName()
													? e5
													: (/^[0-9]$/.test(e5)
															? l3.boolean.includes(
																	s4,
																)
																? "-"
																: "--"
															: e5.length > 1
																? "--"
																: "-") + e5,
											)
											.sort((t4, e5) =>
												x2(t4) === x2(e5)
													? 0
													: x2(t4)
														? 1
														: -1,
											)
											.join(", ")),
										e4
									),
									{},
								);
								return {
									groupName: t3,
									normalizedKeys: e3,
									switches: s3,
								};
							});
					if (
						(E2.filter(
							({ groupName: t3 }) =>
								t3 !== n2.getPositionalGroupName(),
						).some(
							({ normalizedKeys: t3, switches: e3 }) =>
								!t3.every((t4) => x2(e3[t4])),
						) &&
							E2.filter(
								({ groupName: t3 }) =>
									t3 !== n2.getPositionalGroupName(),
							).forEach(
								({ normalizedKeys: t3, switches: e3 }) => {
									t3.forEach((t4) => {
										var s3, i3;
										x2(e3[t4]) &&
											(e3[t4] =
												((s3 = e3[t4]),
												(i3 = "-x, ".length),
												S(s3)
													? {
															text: s3.text,
															indentation:
																s3.indentation +
																i3,
														}
													: {
															text: s3,
															indentation: i3,
														}));
									});
								},
							),
						E2.forEach(
							({
								groupName: t3,
								normalizedKeys: e3,
								switches: s3,
							}) => {
								b3.div(t3),
									e3.forEach((t4) => {
										const e4 = s3[t4];
										let o4 = p2[t4] || "",
											h4 = null;
										o4.includes(O2) &&
											(o4 = i2(o4.substring(O2.length))),
											l3.boolean.includes(t4) &&
												(h4 = `[${i2("boolean")}]`),
											l3.count.includes(t4) &&
												(h4 = `[${i2("count")}]`),
											l3.string.includes(t4) &&
												(h4 = `[${i2("string")}]`),
											l3.normalize.includes(t4) &&
												(h4 = `[${i2("string")}]`),
											l3.array.includes(t4) &&
												(h4 = `[${i2("array")}]`),
											l3.number.includes(t4) &&
												(h4 = `[${i2("number")}]`);
										const c3 = [
											t4 in a3
												? ((f3 = a3[t4]),
													"string" == typeof f3
														? `[${i2("deprecated: %s", f3)}]`
														: `[${i2("deprecated")}]`)
												: null,
											h4,
											t4 in r3
												? `[${i2("required")}]`
												: null,
											l3.choices && l3.choices[t4]
												? `[${i2("choices:")} ${n2.stringifiedValues(l3.choices[t4])}]`
												: null,
											_2(
												l3.default[t4],
												l3.defaultDescription[t4],
											),
										]
											.filter(Boolean)
											.join(" ");
										var f3;
										b3.span(
											{
												text: I(e4),
												padding: [0, 2, 0, 2 + $(e4)],
												width: w2(s3, y3) + 4,
											},
											o4,
										),
											c3
												? b3.div({
														text: c3,
														padding: [0, 0, 0, 2],
														align: "right",
													})
												: b3.div();
									}),
									b3.div();
							},
						),
						d2.length &&
							(b3.div(i2("Examples:")),
							d2.forEach((t3) => {
								t3[0] = t3[0].replace(/\$0/g, e2);
							}),
							d2.forEach((t3) => {
								"" === t3[1]
									? b3.div({
											text: t3[0],
											padding: [0, 2, 0, 2],
										})
									: b3.div(
											{
												text: t3[0],
												padding: [0, 2, 0, 2],
												width: w2(d2, y3) + 4,
											},
											{ text: t3[1] },
										);
							}),
							b3.div()),
						m2.length > 0)
					) {
						const t3 = m2
							.map((t4) => t4.replace(/\$0/g, e2))
							.join("\n");
						b3.div(`${t3}
`);
					}
					return b3.toString().replace(/\s*$/, "");
				}),
				(n2.cacheHelpMessage = function () {
					C2 = this.help();
				}),
				(n2.clearCachedHelpMessage = function () {
					C2 = void 0;
				}),
				(n2.hasCachedHelpMessage = function () {
					return !!C2;
				}),
				(n2.showHelp = (e2) => {
					const s3 = t2.getInternalMethods().getLoggerInstance();
					e2 || (e2 = "error");
					("function" == typeof e2 ? e2 : s3[e2])(n2.help());
				}),
				(n2.functionDescription = (t3) =>
					[
						"(",
						t3.name
							? s2.Parser.decamelize(t3.name, "-")
							: i2("generated-value"),
						")",
					].join("")),
				(n2.stringifiedValues = function (t3, e2) {
					let s3 = "";
					const i3 = e2 || ", ",
						n3 = [].concat(t3);
					return t3 && n3.length
						? (n3.forEach((t4) => {
								s3.length && (s3 += i3),
									(s3 += JSON.stringify(t4));
							}),
							s3)
						: s3;
				});
			let M2 = null;
			(n2.version = (t3) => {
				M2 = t3;
			}),
				(n2.showVersion = (e2) => {
					const s3 = t2.getInternalMethods().getLoggerInstance();
					e2 || (e2 = "error");
					("function" == typeof e2 ? e2 : s3[e2])(M2);
				}),
				(n2.reset = function (t3) {
					return (
						(o2 = null),
						(l2 = false),
						(c2 = []),
						(f2 = false),
						(m2 = []),
						(d2 = []),
						(u2 = []),
						(p2 = g(p2, (e2) => !t3[e2])),
						n2
					);
				});
			const k2 = [];
			return (
				(n2.freeze = function () {
					k2.push({
						failMessage: o2,
						failureOutput: l2,
						usages: c2,
						usageDisabled: f2,
						epilogs: m2,
						examples: d2,
						commands: u2,
						descriptions: p2,
					});
				}),
				(n2.unfreeze = function (t3 = false) {
					const e2 = k2.pop();
					e2 &&
						(t3
							? ((p2 = { ...e2.descriptions, ...p2 }),
								(u2 = [...e2.commands, ...u2]),
								(c2 = [...e2.usages, ...c2]),
								(d2 = [...e2.examples, ...d2]),
								(m2 = [...e2.epilogs, ...m2]))
							: ({
									failMessage: o2,
									failureOutput: l2,
									usages: c2,
									usageDisabled: f2,
									epilogs: m2,
									examples: d2,
									commands: u2,
									descriptions: p2,
								} = e2));
				}),
				n2
			);
		}
		function S(t2) {
			return "object" == typeof t2;
		}
		function $(t2) {
			return S(t2) ? t2.indentation : 0;
		}
		function I(t2) {
			return S(t2) ? t2.text : t2;
		}
		var N = class {
			constructor(t2, e2, s2, i2) {
				var n2, r2, o2;
				(this.yargs = t2),
					(this.usage = e2),
					(this.command = s2),
					(this.shim = i2),
					(this.completionKey = "get-yargs-completions"),
					(this.aliases = null),
					(this.customCompletionFunction = null),
					(this.indexAfterLastReset = 0),
					(this.zshShell =
						null !==
							(o2 =
								(null === (n2 = this.shim.getEnv("SHELL")) ||
								void 0 === n2
									? void 0
									: n2.includes("zsh")) ||
								(null === (r2 = this.shim.getEnv("ZSH_NAME")) ||
								void 0 === r2
									? void 0
									: r2.includes("zsh"))) &&
						void 0 !== o2 &&
						o2);
			}
			defaultCompletion(t2, e2, s2, i2) {
				const n2 = this.command.getCommandHandlers();
				for (let e3 = 0, s3 = t2.length; e3 < s3; ++e3)
					if (n2[t2[e3]] && n2[t2[e3]].builder) {
						const s4 = n2[t2[e3]].builder;
						if (x(s4)) {
							this.indexAfterLastReset = e3 + 1;
							const t3 = this.yargs.getInternalMethods().reset();
							return s4(t3, true), t3.argv;
						}
					}
				const r2 = [];
				this.commandCompletions(r2, t2, s2),
					this.optionCompletions(r2, t2, e2, s2),
					this.choicesFromOptionsCompletions(r2, t2, e2, s2),
					this.choicesFromPositionalsCompletions(r2, t2, e2, s2),
					i2(null, r2);
			}
			commandCompletions(t2, e2, s2) {
				const i2 = this.yargs
					.getInternalMethods()
					.getContext().commands;
				s2.match(/^-/) ||
					i2[i2.length - 1] === s2 ||
					this.previousArgHasChoices(e2) ||
					this.usage.getCommands().forEach((s3) => {
						const i3 = o(s3[0]).cmd;
						if (-1 === e2.indexOf(i3))
							if (this.zshShell) {
								const e3 = s3[1] || "";
								t2.push(i3.replace(/:/g, "\\:") + ":" + e3);
							} else t2.push(i3);
					});
			}
			optionCompletions(t2, e2, s2, i2) {
				if (
					(i2.match(/^-/) || ("" === i2 && 0 === t2.length)) &&
					!this.previousArgHasChoices(e2)
				) {
					const n2 = this.yargs.getOptions(),
						r2 =
							this.yargs.getGroups()[
								this.usage.getPositionalGroupName()
							] || [];
					Object.keys(n2.key).forEach((o2) => {
						const a2 =
							!!n2.configuration["boolean-negation"] &&
							n2.boolean.includes(o2);
						r2.includes(o2) ||
							n2.hiddenOptions.includes(o2) ||
							this.argsContainKey(e2, s2, o2, a2) ||
							(this.completeOptionKey(o2, t2, i2),
							a2 &&
								n2.default[o2] &&
								this.completeOptionKey(`no-${o2}`, t2, i2));
					});
				}
			}
			choicesFromOptionsCompletions(t2, e2, s2, i2) {
				if (this.previousArgHasChoices(e2)) {
					const s3 = this.getPreviousArgChoices(e2);
					s3 &&
						s3.length > 0 &&
						t2.push(...s3.map((t3) => t3.replace(/:/g, "\\:")));
				}
			}
			choicesFromPositionalsCompletions(t2, e2, s2, i2) {
				if (
					"" === i2 &&
					t2.length > 0 &&
					this.previousArgHasChoices(e2)
				)
					return;
				const n2 =
						this.yargs.getGroups()[
							this.usage.getPositionalGroupName()
						] || [],
					r2 = Math.max(
						this.indexAfterLastReset,
						this.yargs.getInternalMethods().getContext().commands
							.length + 1,
					),
					o2 = n2[s2._.length - r2 - 1];
				if (!o2) return;
				const a2 = this.yargs.getOptions().choices[o2] || [];
				for (const e3 of a2)
					e3.startsWith(i2) && t2.push(e3.replace(/:/g, "\\:"));
			}
			getPreviousArgChoices(t2) {
				if (t2.length < 1) return;
				let e2 = t2[t2.length - 1],
					s2 = "";
				if (
					(!e2.startsWith("-") &&
						t2.length > 1 &&
						((s2 = e2), (e2 = t2[t2.length - 2])),
					!e2.startsWith("-"))
				)
					return;
				const i2 = e2.replace(/^-+/, ""),
					n2 = this.yargs.getOptions(),
					r2 = [i2, ...(this.yargs.getAliases()[i2] || [])];
				let o2;
				for (const t3 of r2)
					if (
						Object.prototype.hasOwnProperty.call(n2.key, t3) &&
						Array.isArray(n2.choices[t3])
					) {
						o2 = n2.choices[t3];
						break;
					}
				return o2
					? o2.filter((t3) => !s2 || t3.startsWith(s2))
					: void 0;
			}
			previousArgHasChoices(t2) {
				const e2 = this.getPreviousArgChoices(t2);
				return void 0 !== e2 && e2.length > 0;
			}
			argsContainKey(t2, e2, s2, i2) {
				if (-1 !== t2.indexOf(`--${s2}`)) return true;
				if (i2 && -1 !== t2.indexOf(`--no-${s2}`)) return true;
				if (this.aliases) {
					for (const t3 of this.aliases[s2])
						if (void 0 !== e2[t3]) return true;
				}
				return false;
			}
			completeOptionKey(t2, e2, s2) {
				const i2 = this.usage.getDescriptions(),
					n2 =
						!/^--/.test(s2) && ((t3) => /^[^0-9]$/.test(t3))(t2)
							? "-"
							: "--";
				if (this.zshShell) {
					const s3 = i2[t2] || "";
					e2.push(
						n2 +
							`${t2.replace(/:/g, "\\:")}:${s3.replace("__yargsString__:", "")}`,
					);
				} else e2.push(n2 + t2);
			}
			customCompletion(t2, e2, s2, i2) {
				if (
					(d(this.customCompletionFunction, null, this.shim),
					this.customCompletionFunction.length < 3)
				) {
					const t3 = this.customCompletionFunction(s2, e2);
					return f(t3)
						? t3
								.then((t4) => {
									this.shim.process.nextTick(() => {
										i2(null, t4);
									});
								})
								.catch((t4) => {
									this.shim.process.nextTick(() => {
										i2(t4, void 0);
									});
								})
						: i2(null, t3);
				}
				return (function (t3) {
					return t3.length > 3;
				})(this.customCompletionFunction)
					? this.customCompletionFunction(
							s2,
							e2,
							(n2 = i2) => this.defaultCompletion(t2, e2, s2, n2),
							(t3) => {
								i2(null, t3);
							},
						)
					: this.customCompletionFunction(s2, e2, (t3) => {
							i2(null, t3);
						});
			}
			getCompletion(t2, e2) {
				const s2 = t2.length ? t2[t2.length - 1] : "",
					i2 = this.yargs.parse(t2, true),
					n2 = this.customCompletionFunction
						? (i3) => this.customCompletion(t2, i3, s2, e2)
						: (i3) => this.defaultCompletion(t2, i3, s2, e2);
				return f(i2) ? i2.then(n2) : n2(i2);
			}
			generateCompletionScript(t2, e2) {
				let s2 = this.zshShell
					? `#compdef {{app_name}}
###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
#    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.
#
_{{app_name}}_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'
' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`
					: '###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc\n#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.\n#\n_{{app_name}}_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word="${COMP_WORDS[COMP_CWORD]}"\n    args=("${COMP_WORDS[@]}")\n\n    # ask yargs to generate completions.\n    type_list=$({{app_path}} --get-yargs-completions "${args[@]}")\n\n    COMPREPLY=( $(compgen -W "${type_list}" -- ${cur_word}) )\n\n    # if no match was found, fall back to filename completion\n    if [ ${#COMPREPLY[@]} -eq 0 ]; then\n      COMPREPLY=()\n    fi\n\n    return 0\n}\ncomplete -o bashdefault -o default -F _{{app_name}}_yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n';
				const i2 = this.shim.path.basename(t2);
				return (
					t2.match(/\.js$/) && (t2 = `./${t2}`),
					(s2 = s2.replace(/{{app_name}}/g, i2)),
					(s2 = s2.replace(/{{completion_command}}/g, e2)),
					s2.replace(/{{app_path}}/g, t2)
				);
			}
			registerFunction(t2) {
				this.customCompletionFunction = t2;
			}
			setParsed(t2) {
				this.aliases = t2.aliases;
			}
		};
		function D(t2, e2) {
			if (0 === t2.length) return e2.length;
			if (0 === e2.length) return t2.length;
			const s2 = [];
			let i2, n2;
			for (i2 = 0; i2 <= e2.length; i2++) s2[i2] = [i2];
			for (n2 = 0; n2 <= t2.length; n2++) s2[0][n2] = n2;
			for (i2 = 1; i2 <= e2.length; i2++)
				for (n2 = 1; n2 <= t2.length; n2++)
					e2.charAt(i2 - 1) === t2.charAt(n2 - 1)
						? (s2[i2][n2] = s2[i2 - 1][n2 - 1])
						: i2 > 1 &&
							  n2 > 1 &&
							  e2.charAt(i2 - 2) === t2.charAt(n2 - 1) &&
							  e2.charAt(i2 - 1) === t2.charAt(n2 - 2)
							? (s2[i2][n2] = s2[i2 - 2][n2 - 2] + 1)
							: (s2[i2][n2] = Math.min(
									s2[i2 - 1][n2 - 1] + 1,
									Math.min(
										s2[i2][n2 - 1] + 1,
										s2[i2 - 1][n2] + 1,
									),
								));
			return s2[e2.length][t2.length];
		}
		var H = ["$0", "--", "_"];
		var z;
		var q;
		var W;
		var F;
		var U;
		var L;
		var V;
		var G;
		var R;
		var T;
		var K;
		var B;
		var Y;
		var J;
		var Z;
		var X;
		var Q;
		var tt;
		var et;
		var st;
		var it;
		var nt;
		var rt;
		var ot;
		var at;
		var ht;
		var lt;
		var ct;
		var ft;
		var dt;
		var ut;
		var pt;
		var gt;
		var mt;
		var yt = Symbol("copyDoubleDash");
		var bt = Symbol("copyDoubleDash");
		var vt = Symbol("deleteFromParserHintObject");
		var Ot = Symbol("emitWarning");
		var wt = Symbol("freeze");
		var Ct = Symbol("getDollarZero");
		var jt = Symbol("getParserConfiguration");
		var _t = Symbol("guessLocale");
		var Mt = Symbol("guessVersion");
		var kt = Symbol("parsePositionalNumbers");
		var xt = Symbol("pkgUp");
		var Et = Symbol("populateParserHintArray");
		var At = Symbol("populateParserHintSingleValueDictionary");
		var Pt = Symbol("populateParserHintArrayDictionary");
		var St = Symbol("populateParserHintDictionary");
		var $t = Symbol("sanitizeKey");
		var It = Symbol("setKey");
		var Nt = Symbol("unfreeze");
		var Dt = Symbol("validateAsync");
		var Ht = Symbol("getCommandInstance");
		var zt = Symbol("getContext");
		var qt = Symbol("getHasOutput");
		var Wt = Symbol("getLoggerInstance");
		var Ft = Symbol("getParseContext");
		var Ut = Symbol("getUsageInstance");
		var Lt = Symbol("getValidationInstance");
		var Vt = Symbol("hasParseCallback");
		var Gt = Symbol("isGlobalContext");
		var Rt = Symbol("postProcess");
		var Tt = Symbol("rebase");
		var Kt = Symbol("reset");
		var Bt = Symbol("runYargsParserAndExecuteCommands");
		var Yt = Symbol("runValidation");
		var Jt = Symbol("setHasOutput");
		var Zt = Symbol("kTrackManuallySetKeys");
		var Xt = class {
			constructor(t2 = [], e2, s2, i2) {
				(this.customScriptName = false),
					(this.parsed = false),
					z.set(this, void 0),
					q.set(this, void 0),
					W.set(this, { commands: [], fullCommands: [] }),
					F.set(this, null),
					U.set(this, null),
					L.set(this, "show-hidden"),
					V.set(this, null),
					G.set(this, true),
					R.set(this, {}),
					T.set(this, true),
					K.set(this, []),
					B.set(this, void 0),
					Y.set(this, {}),
					J.set(this, false),
					Z.set(this, null),
					X.set(this, true),
					Q.set(this, void 0),
					tt.set(this, ""),
					et.set(this, void 0),
					st.set(this, void 0),
					it.set(this, {}),
					nt.set(this, null),
					rt.set(this, null),
					ot.set(this, {}),
					at.set(this, {}),
					ht.set(this, void 0),
					lt.set(this, false),
					ct.set(this, void 0),
					ft.set(this, false),
					dt.set(this, false),
					ut.set(this, false),
					pt.set(this, void 0),
					gt.set(this, null),
					mt.set(this, void 0),
					O(this, ct, i2, "f"),
					O(this, ht, t2, "f"),
					O(this, q, e2, "f"),
					O(this, st, s2, "f"),
					O(this, B, new w(this), "f"),
					(this.$0 = this[Ct]()),
					this[Kt](),
					O(this, z, v(this, z, "f"), "f"),
					O(this, pt, v(this, pt, "f"), "f"),
					O(this, mt, v(this, mt, "f"), "f"),
					O(this, et, v(this, et, "f"), "f"),
					(v(this, et, "f").showHiddenOpt = v(this, L, "f")),
					O(this, Q, this[bt](), "f");
			}
			addHelpOpt(t2, e2) {
				return (
					h("[string|boolean] [string]", [t2, e2], arguments.length),
					v(this, Z, "f") &&
						(this[vt](v(this, Z, "f")), O(this, Z, null, "f")),
					(false === t2 && void 0 === e2) ||
						(O(this, Z, "string" == typeof t2 ? t2 : "help", "f"),
						this.boolean(v(this, Z, "f")),
						this.describe(
							v(this, Z, "f"),
							e2 || v(this, pt, "f").deferY18nLookup("Show help"),
						)),
					this
				);
			}
			help(t2, e2) {
				return this.addHelpOpt(t2, e2);
			}
			addShowHiddenOpt(t2, e2) {
				if (
					(h("[string|boolean] [string]", [t2, e2], arguments.length),
					false === t2 && void 0 === e2)
				)
					return this;
				const s2 = "string" == typeof t2 ? t2 : v(this, L, "f");
				return (
					this.boolean(s2),
					this.describe(
						s2,
						e2 ||
							v(this, pt, "f").deferY18nLookup(
								"Show hidden options",
							),
					),
					(v(this, et, "f").showHiddenOpt = s2),
					this
				);
			}
			showHidden(t2, e2) {
				return this.addShowHiddenOpt(t2, e2);
			}
			alias(t2, e2) {
				return (
					h(
						"<object|string|array> [string|array]",
						[t2, e2],
						arguments.length,
					),
					this[Pt](this.alias.bind(this), "alias", t2, e2),
					this
				);
			}
			array(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("array", t2),
					this[Zt](t2),
					this
				);
			}
			boolean(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("boolean", t2),
					this[Zt](t2),
					this
				);
			}
			check(t2, e2) {
				return (
					h("<function> [boolean]", [t2, e2], arguments.length),
					this.middleware(
						(e3, s2) =>
							j(
								() => t2(e3, s2.getOptions()),
								(s3) => (
									s3
										? ("string" == typeof s3 ||
												s3 instanceof Error) &&
											v(this, pt, "f").fail(
												s3.toString(),
												s3,
											)
										: v(this, pt, "f").fail(
												v(this, ct, "f").y18n.__(
													"Argument check failed: %s",
													t2.toString(),
												),
											),
									e3
								),
								(t3) => (
									v(this, pt, "f").fail(
										t3.message ? t3.message : t3.toString(),
										t3,
									),
									e3
								),
							),
						false,
						e2,
					),
					this
				);
			}
			choices(t2, e2) {
				return (
					h(
						"<object|string|array> [string|array]",
						[t2, e2],
						arguments.length,
					),
					this[Pt](this.choices.bind(this), "choices", t2, e2),
					this
				);
			}
			coerce(t2, s2) {
				if (
					(h(
						"<object|string|array> [function]",
						[t2, s2],
						arguments.length,
					),
					Array.isArray(t2))
				) {
					if (!s2) throw new e("coerce callback must be provided");
					for (const e2 of t2) this.coerce(e2, s2);
					return this;
				}
				if ("object" == typeof t2) {
					for (const e2 of Object.keys(t2)) this.coerce(e2, t2[e2]);
					return this;
				}
				if (!s2) throw new e("coerce callback must be provided");
				return (
					(v(this, et, "f").key[t2] = true),
					v(this, B, "f").addCoerceMiddleware((i2, n2) => {
						let r2;
						return Object.hasOwnProperty.call(i2, t2)
							? j(
									() => ((r2 = n2.getAliases()), s2(i2[t2])),
									(e2) => {
										i2[t2] = e2;
										const s3 = n2
											.getInternalMethods()
											.getParserConfiguration()[
											"strip-aliased"
										];
										if (r2[t2] && true !== s3)
											for (const s4 of r2[t2])
												i2[s4] = e2;
										return i2;
									},
									(t3) => {
										throw new e(t3.message);
									},
								)
							: i2;
					}, t2),
					this
				);
			}
			conflicts(t2, e2) {
				return (
					h(
						"<string|object> [string|array]",
						[t2, e2],
						arguments.length,
					),
					v(this, mt, "f").conflicts(t2, e2),
					this
				);
			}
			config(t2 = "config", e2, s2) {
				return (
					h(
						"[object|string] [string|function] [function]",
						[t2, e2, s2],
						arguments.length,
					),
					"object" != typeof t2 || Array.isArray(t2)
						? ("function" == typeof e2 &&
								((s2 = e2), (e2 = void 0)),
							this.describe(
								t2,
								e2 ||
									v(this, pt, "f").deferY18nLookup(
										"Path to JSON config file",
									),
							),
							(Array.isArray(t2) ? t2 : [t2]).forEach((t3) => {
								v(this, et, "f").config[t3] = s2 || true;
							}),
							this)
						: ((t2 = n(
								t2,
								v(this, q, "f"),
								this[jt]()["deep-merge-config"] || false,
								v(this, ct, "f"),
							)),
							(v(this, et, "f").configObjects = (
								v(this, et, "f").configObjects || []
							).concat(t2)),
							this)
				);
			}
			completion(t2, e2, s2) {
				return (
					h(
						"[string] [string|boolean|function] [function]",
						[t2, e2, s2],
						arguments.length,
					),
					"function" == typeof e2 && ((s2 = e2), (e2 = void 0)),
					O(this, U, t2 || v(this, U, "f") || "completion", "f"),
					e2 || false === e2 || (e2 = "generate completion script"),
					this.command(v(this, U, "f"), e2),
					s2 && v(this, F, "f").registerFunction(s2),
					this
				);
			}
			command(t2, e2, s2, i2, n2, r2) {
				return (
					h(
						"<string|array|object> [string|boolean] [function|object] [function] [array] [boolean|string]",
						[t2, e2, s2, i2, n2, r2],
						arguments.length,
					),
					v(this, z, "f").addHandler(t2, e2, s2, i2, n2, r2),
					this
				);
			}
			commands(t2, e2, s2, i2, n2, r2) {
				return this.command(t2, e2, s2, i2, n2, r2);
			}
			commandDir(t2, e2) {
				h("<string> [object]", [t2, e2], arguments.length);
				const s2 = v(this, st, "f") || v(this, ct, "f").require;
				return (
					v(this, z, "f").addDirectory(
						t2,
						s2,
						v(this, ct, "f").getCallerFile(),
						e2,
					),
					this
				);
			}
			count(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("count", t2),
					this[Zt](t2),
					this
				);
			}
			default(t2, e2, s2) {
				return (
					h(
						"<object|string|array> [*] [string]",
						[t2, e2, s2],
						arguments.length,
					),
					s2 &&
						(u(t2, v(this, ct, "f")),
						(v(this, et, "f").defaultDescription[t2] = s2)),
					"function" == typeof e2 &&
						(u(t2, v(this, ct, "f")),
						v(this, et, "f").defaultDescription[t2] ||
							(v(this, et, "f").defaultDescription[t2] = v(
								this,
								pt,
								"f",
							).functionDescription(e2)),
						(e2 = e2.call())),
					this[At](this.default.bind(this), "default", t2, e2),
					this
				);
			}
			defaults(t2, e2, s2) {
				return this.default(t2, e2, s2);
			}
			demandCommand(t2 = 1, e2, s2, i2) {
				return (
					h(
						"[number] [number|string] [string|null|undefined] [string|null|undefined]",
						[t2, e2, s2, i2],
						arguments.length,
					),
					"number" != typeof e2 && ((s2 = e2), (e2 = 1 / 0)),
					this.global("_", false),
					(v(this, et, "f").demandedCommands._ = {
						min: t2,
						max: e2,
						minMsg: s2,
						maxMsg: i2,
					}),
					this
				);
			}
			demand(t2, e2, s2) {
				return (
					Array.isArray(e2)
						? (e2.forEach((t3) => {
								d(s2, true, v(this, ct, "f")),
									this.demandOption(t3, s2);
							}),
							(e2 = 1 / 0))
						: "number" != typeof e2 && ((s2 = e2), (e2 = 1 / 0)),
					"number" == typeof t2
						? (d(s2, true, v(this, ct, "f")),
							this.demandCommand(t2, e2, s2, s2))
						: Array.isArray(t2)
							? t2.forEach((t3) => {
									d(s2, true, v(this, ct, "f")),
										this.demandOption(t3, s2);
								})
							: "string" == typeof s2
								? this.demandOption(t2, s2)
								: (true !== s2 && void 0 !== s2) ||
									this.demandOption(t2),
					this
				);
			}
			demandOption(t2, e2) {
				return (
					h(
						"<object|string|array> [string]",
						[t2, e2],
						arguments.length,
					),
					this[At](
						this.demandOption.bind(this),
						"demandedOptions",
						t2,
						e2,
					),
					this
				);
			}
			deprecateOption(t2, e2) {
				return (
					h("<string> [string|boolean]", [t2, e2], arguments.length),
					(v(this, et, "f").deprecatedOptions[t2] = e2),
					this
				);
			}
			describe(t2, e2) {
				return (
					h(
						"<object|string|array> [string]",
						[t2, e2],
						arguments.length,
					),
					this[It](t2, true),
					v(this, pt, "f").describe(t2, e2),
					this
				);
			}
			detectLocale(t2) {
				return (
					h("<boolean>", [t2], arguments.length),
					O(this, G, t2, "f"),
					this
				);
			}
			env(t2) {
				return (
					h("[string|boolean]", [t2], arguments.length),
					false === t2
						? delete v(this, et, "f").envPrefix
						: (v(this, et, "f").envPrefix = t2 || ""),
					this
				);
			}
			epilogue(t2) {
				return (
					h("<string>", [t2], arguments.length),
					v(this, pt, "f").epilog(t2),
					this
				);
			}
			epilog(t2) {
				return this.epilogue(t2);
			}
			example(t2, e2) {
				return (
					h("<string|array> [string]", [t2, e2], arguments.length),
					Array.isArray(t2)
						? t2.forEach((t3) => this.example(...t3))
						: v(this, pt, "f").example(t2, e2),
					this
				);
			}
			exit(t2, e2) {
				O(this, J, true, "f"),
					O(this, V, e2, "f"),
					v(this, T, "f") && v(this, ct, "f").process.exit(t2);
			}
			exitProcess(t2 = true) {
				return (
					h("[boolean]", [t2], arguments.length),
					O(this, T, t2, "f"),
					this
				);
			}
			fail(t2) {
				if (
					(h("<function|boolean>", [t2], arguments.length),
					"boolean" == typeof t2 && false !== t2)
				)
					throw new e(
						"Invalid first argument. Expected function or boolean 'false'",
					);
				return v(this, pt, "f").failFn(t2), this;
			}
			getAliases() {
				return this.parsed ? this.parsed.aliases : {};
			}
			async getCompletion(t2, e2) {
				return (
					h("<array> [function]", [t2, e2], arguments.length),
					e2
						? v(this, F, "f").getCompletion(t2, e2)
						: new Promise((e3, s2) => {
								v(this, F, "f").getCompletion(t2, (t3, i2) => {
									t3 ? s2(t3) : e3(i2);
								});
							})
				);
			}
			getDemandedOptions() {
				return h([], 0), v(this, et, "f").demandedOptions;
			}
			getDemandedCommands() {
				return h([], 0), v(this, et, "f").demandedCommands;
			}
			getDeprecatedOptions() {
				return h([], 0), v(this, et, "f").deprecatedOptions;
			}
			getDetectLocale() {
				return v(this, G, "f");
			}
			getExitProcess() {
				return v(this, T, "f");
			}
			getGroups() {
				return Object.assign({}, v(this, Y, "f"), v(this, at, "f"));
			}
			getHelp() {
				if (
					(O(this, J, true, "f"),
					!v(this, pt, "f").hasCachedHelpMessage())
				) {
					if (!this.parsed) {
						const t3 = this[Bt](
							v(this, ht, "f"),
							void 0,
							void 0,
							0,
							true,
						);
						if (f(t3))
							return t3.then(() => v(this, pt, "f").help());
					}
					const t2 = v(this, z, "f").runDefaultBuilderOn(this);
					if (f(t2)) return t2.then(() => v(this, pt, "f").help());
				}
				return Promise.resolve(v(this, pt, "f").help());
			}
			getOptions() {
				return v(this, et, "f");
			}
			getStrict() {
				return v(this, ft, "f");
			}
			getStrictCommands() {
				return v(this, dt, "f");
			}
			getStrictOptions() {
				return v(this, ut, "f");
			}
			global(t2, e2) {
				return (
					h("<string|array> [boolean]", [t2, e2], arguments.length),
					(t2 = [].concat(t2)),
					false !== e2
						? (v(this, et, "f").local = v(
								this,
								et,
								"f",
							).local.filter((e3) => -1 === t2.indexOf(e3)))
						: t2.forEach((t3) => {
								v(this, et, "f").local.includes(t3) ||
									v(this, et, "f").local.push(t3);
							}),
					this
				);
			}
			group(t2, e2) {
				h("<string|array> <string>", [t2, e2], arguments.length);
				const s2 = v(this, at, "f")[e2] || v(this, Y, "f")[e2];
				v(this, at, "f")[e2] && delete v(this, at, "f")[e2];
				const i2 = {};
				return (
					(v(this, Y, "f")[e2] = (s2 || [])
						.concat(t2)
						.filter((t3) => !i2[t3] && (i2[t3] = true))),
					this
				);
			}
			hide(t2) {
				return (
					h("<string>", [t2], arguments.length),
					v(this, et, "f").hiddenOptions.push(t2),
					this
				);
			}
			implies(t2, e2) {
				return (
					h(
						"<string|object> [number|string|array]",
						[t2, e2],
						arguments.length,
					),
					v(this, mt, "f").implies(t2, e2),
					this
				);
			}
			locale(t2) {
				return (
					h("[string]", [t2], arguments.length),
					t2
						? (O(this, G, false, "f"),
							v(this, ct, "f").y18n.setLocale(t2),
							this)
						: (this[_t](), v(this, ct, "f").y18n.getLocale())
				);
			}
			middleware(t2, e2, s2) {
				return v(this, B, "f").addMiddleware(t2, !!e2, s2);
			}
			nargs(t2, e2) {
				return (
					h(
						"<string|object|array> [number]",
						[t2, e2],
						arguments.length,
					),
					this[At](this.nargs.bind(this), "narg", t2, e2),
					this
				);
			}
			normalize(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("normalize", t2),
					this
				);
			}
			number(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("number", t2),
					this[Zt](t2),
					this
				);
			}
			option(t2, e2) {
				if (
					(h("<string|object> [object]", [t2, e2], arguments.length),
					"object" == typeof t2)
				)
					Object.keys(t2).forEach((e3) => {
						this.options(e3, t2[e3]);
					});
				else {
					"object" != typeof e2 && (e2 = {}),
						this[Zt](t2),
						!v(this, gt, "f") ||
							("version" !== t2 &&
								"version" !==
									(null == e2 ? void 0 : e2.alias)) ||
							this[Ot](
								[
									'"version" is a reserved word.',
									"Please do one of the following:",
									'- Disable version with `yargs.version(false)` if using "version" as an option',
									"- Use the built-in `yargs.version` method instead (if applicable)",
									"- Use a different option key",
									"https://yargs.js.org/docs/#api-reference-version",
								].join("\n"),
								void 0,
								"versionWarning",
							),
						(v(this, et, "f").key[t2] = true),
						e2.alias && this.alias(t2, e2.alias);
					const s2 = e2.deprecate || e2.deprecated;
					s2 && this.deprecateOption(t2, s2);
					const i2 = e2.demand || e2.required || e2.require;
					i2 && this.demand(t2, i2),
						e2.demandOption &&
							this.demandOption(
								t2,
								"string" == typeof e2.demandOption
									? e2.demandOption
									: void 0,
							),
						e2.conflicts && this.conflicts(t2, e2.conflicts),
						"default" in e2 && this.default(t2, e2.default),
						void 0 !== e2.implies && this.implies(t2, e2.implies),
						void 0 !== e2.nargs && this.nargs(t2, e2.nargs),
						e2.config && this.config(t2, e2.configParser),
						e2.normalize && this.normalize(t2),
						e2.choices && this.choices(t2, e2.choices),
						e2.coerce && this.coerce(t2, e2.coerce),
						e2.group && this.group(t2, e2.group),
						(e2.boolean || "boolean" === e2.type) &&
							(this.boolean(t2),
							e2.alias && this.boolean(e2.alias)),
						(e2.array || "array" === e2.type) &&
							(this.array(t2), e2.alias && this.array(e2.alias)),
						(e2.number || "number" === e2.type) &&
							(this.number(t2),
							e2.alias && this.number(e2.alias)),
						(e2.string || "string" === e2.type) &&
							(this.string(t2),
							e2.alias && this.string(e2.alias)),
						(e2.count || "count" === e2.type) && this.count(t2),
						"boolean" == typeof e2.global &&
							this.global(t2, e2.global),
						e2.defaultDescription &&
							(v(this, et, "f").defaultDescription[t2] =
								e2.defaultDescription),
						e2.skipValidation && this.skipValidation(t2);
					const n2 = e2.describe || e2.description || e2.desc;
					this.describe(t2, n2),
						e2.hidden && this.hide(t2),
						e2.requiresArg && this.requiresArg(t2);
				}
				return this;
			}
			options(t2, e2) {
				return this.option(t2, e2);
			}
			parse(t2, e2, s2) {
				h(
					"[string|array] [function|boolean|object] [function]",
					[t2, e2, s2],
					arguments.length,
				),
					this[wt](),
					void 0 === t2 && (t2 = v(this, ht, "f")),
					"object" == typeof e2 && (O(this, rt, e2, "f"), (e2 = s2)),
					"function" == typeof e2 &&
						(O(this, nt, e2, "f"), (e2 = false)),
					e2 || O(this, ht, t2, "f"),
					v(this, nt, "f") && O(this, T, false, "f");
				const i2 = this[Bt](t2, !!e2),
					n2 = this.parsed;
				return (
					v(this, F, "f").setParsed(this.parsed),
					f(i2)
						? i2
								.then(
									(t3) => (
										v(this, nt, "f") &&
											v(this, nt, "f").call(
												this,
												v(this, V, "f"),
												t3,
												v(this, tt, "f"),
											),
										t3
									),
								)
								.catch((t3) => {
									throw (
										(v(this, nt, "f") &&
											v(this, nt, "f")(
												t3,
												this.parsed.argv,
												v(this, tt, "f"),
											),
										t3)
									);
								})
								.finally(() => {
									this[Nt](), (this.parsed = n2);
								})
						: (v(this, nt, "f") &&
								v(this, nt, "f").call(
									this,
									v(this, V, "f"),
									i2,
									v(this, tt, "f"),
								),
							this[Nt](),
							(this.parsed = n2),
							i2)
				);
			}
			parseAsync(t2, e2, s2) {
				const i2 = this.parse(t2, e2, s2);
				return f(i2) ? i2 : Promise.resolve(i2);
			}
			parseSync(t2, s2, i2) {
				const n2 = this.parse(t2, s2, i2);
				if (f(n2))
					throw new e(
						".parseSync() must not be used with asynchronous builders, handlers, or middleware",
					);
				return n2;
			}
			parserConfiguration(t2) {
				return (
					h("<object>", [t2], arguments.length),
					O(this, it, t2, "f"),
					this
				);
			}
			pkgConf(t2, e2) {
				h("<string> [string]", [t2, e2], arguments.length);
				let s2 = null;
				const i2 = this[xt](e2 || v(this, q, "f"));
				return (
					i2[t2] &&
						"object" == typeof i2[t2] &&
						((s2 = n(
							i2[t2],
							e2 || v(this, q, "f"),
							this[jt]()["deep-merge-config"] || false,
							v(this, ct, "f"),
						)),
						(v(this, et, "f").configObjects = (
							v(this, et, "f").configObjects || []
						).concat(s2))),
					this
				);
			}
			positional(t2, e2) {
				h("<string> <object>", [t2, e2], arguments.length);
				const s2 = [
					"default",
					"defaultDescription",
					"implies",
					"normalize",
					"choices",
					"conflicts",
					"coerce",
					"type",
					"describe",
					"desc",
					"description",
					"alias",
				];
				e2 = g(
					e2,
					(t3, e3) =>
						!(
							"type" === t3 &&
							!["string", "number", "boolean"].includes(e3)
						) && s2.includes(t3),
				);
				const i2 = v(this, W, "f").fullCommands[
						v(this, W, "f").fullCommands.length - 1
					],
					n2 = i2
						? v(this, z, "f").cmdToParseOptions(i2)
						: { array: [], alias: {}, default: {}, demand: {} };
				return (
					p(n2).forEach((s3) => {
						const i3 = n2[s3];
						Array.isArray(i3)
							? -1 !== i3.indexOf(t2) && (e2[s3] = true)
							: i3[t2] && !(s3 in e2) && (e2[s3] = i3[t2]);
					}),
					this.group(t2, v(this, pt, "f").getPositionalGroupName()),
					this.option(t2, e2)
				);
			}
			recommendCommands(t2 = true) {
				return (
					h("[boolean]", [t2], arguments.length),
					O(this, lt, t2, "f"),
					this
				);
			}
			required(t2, e2, s2) {
				return this.demand(t2, e2, s2);
			}
			require(t2, e2, s2) {
				return this.demand(t2, e2, s2);
			}
			requiresArg(t2) {
				return (
					h("<array|string|object> [number]", [t2], arguments.length),
					("string" == typeof t2 && v(this, et, "f").narg[t2]) ||
						this[At](this.requiresArg.bind(this), "narg", t2, NaN),
					this
				);
			}
			showCompletionScript(t2, e2) {
				return (
					h("[string] [string]", [t2, e2], arguments.length),
					(t2 = t2 || this.$0),
					v(this, Q, "f").log(
						v(this, F, "f").generateCompletionScript(
							t2,
							e2 || v(this, U, "f") || "completion",
						),
					),
					this
				);
			}
			showHelp(t2) {
				if (
					(h("[string|function]", [t2], arguments.length),
					O(this, J, true, "f"),
					!v(this, pt, "f").hasCachedHelpMessage())
				) {
					if (!this.parsed) {
						const e3 = this[Bt](
							v(this, ht, "f"),
							void 0,
							void 0,
							0,
							true,
						);
						if (f(e3))
							return (
								e3.then(() => {
									v(this, pt, "f").showHelp(t2);
								}),
								this
							);
					}
					const e2 = v(this, z, "f").runDefaultBuilderOn(this);
					if (f(e2))
						return (
							e2.then(() => {
								v(this, pt, "f").showHelp(t2);
							}),
							this
						);
				}
				return v(this, pt, "f").showHelp(t2), this;
			}
			scriptName(t2) {
				return (this.customScriptName = true), (this.$0 = t2), this;
			}
			showHelpOnFail(t2, e2) {
				return (
					h("[boolean|string] [string]", [t2, e2], arguments.length),
					v(this, pt, "f").showHelpOnFail(t2, e2),
					this
				);
			}
			showVersion(t2) {
				return (
					h("[string|function]", [t2], arguments.length),
					v(this, pt, "f").showVersion(t2),
					this
				);
			}
			skipValidation(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("skipValidation", t2),
					this
				);
			}
			strict(t2) {
				return (
					h("[boolean]", [t2], arguments.length),
					O(this, ft, false !== t2, "f"),
					this
				);
			}
			strictCommands(t2) {
				return (
					h("[boolean]", [t2], arguments.length),
					O(this, dt, false !== t2, "f"),
					this
				);
			}
			strictOptions(t2) {
				return (
					h("[boolean]", [t2], arguments.length),
					O(this, ut, false !== t2, "f"),
					this
				);
			}
			string(t2) {
				return (
					h("<array|string>", [t2], arguments.length),
					this[Et]("string", t2),
					this[Zt](t2),
					this
				);
			}
			terminalWidth() {
				return h([], 0), v(this, ct, "f").process.stdColumns;
			}
			updateLocale(t2) {
				return this.updateStrings(t2);
			}
			updateStrings(t2) {
				return (
					h("<object>", [t2], arguments.length),
					O(this, G, false, "f"),
					v(this, ct, "f").y18n.updateLocale(t2),
					this
				);
			}
			usage(t2, s2, i2, n2) {
				if (
					(h(
						"<string|null|undefined> [string|boolean] [function|object] [function]",
						[t2, s2, i2, n2],
						arguments.length,
					),
					void 0 !== s2)
				) {
					if (
						(d(t2, null, v(this, ct, "f")),
						(t2 || "").match(/^\$0( |$)/))
					)
						return this.command(t2, s2, i2, n2);
					throw new e(
						".usage() description must start with $0 if being used as alias for .command()",
					);
				}
				return v(this, pt, "f").usage(t2), this;
			}
			version(t2, e2, s2) {
				const i2 = "version";
				if (
					(h(
						"[boolean|string] [string] [string]",
						[t2, e2, s2],
						arguments.length,
					),
					v(this, gt, "f") &&
						(this[vt](v(this, gt, "f")),
						v(this, pt, "f").version(void 0),
						O(this, gt, null, "f")),
					0 === arguments.length)
				)
					(s2 = this[Mt]()), (t2 = i2);
				else if (1 === arguments.length) {
					if (false === t2) return this;
					(s2 = t2), (t2 = i2);
				} else 2 === arguments.length && ((s2 = e2), (e2 = void 0));
				return (
					O(this, gt, "string" == typeof t2 ? t2 : i2, "f"),
					(e2 =
						e2 ||
						v(this, pt, "f").deferY18nLookup(
							"Show version number",
						)),
					v(this, pt, "f").version(s2 || void 0),
					this.boolean(v(this, gt, "f")),
					this.describe(v(this, gt, "f"), e2),
					this
				);
			}
			wrap(t2) {
				return (
					h("<number|null|undefined>", [t2], arguments.length),
					v(this, pt, "f").wrap(t2),
					this
				);
			}
			[((z = /* @__PURE__ */ new WeakMap()),
			(q = /* @__PURE__ */ new WeakMap()),
			(W = /* @__PURE__ */ new WeakMap()),
			(F = /* @__PURE__ */ new WeakMap()),
			(U = /* @__PURE__ */ new WeakMap()),
			(L = /* @__PURE__ */ new WeakMap()),
			(V = /* @__PURE__ */ new WeakMap()),
			(G = /* @__PURE__ */ new WeakMap()),
			(R = /* @__PURE__ */ new WeakMap()),
			(T = /* @__PURE__ */ new WeakMap()),
			(K = /* @__PURE__ */ new WeakMap()),
			(B = /* @__PURE__ */ new WeakMap()),
			(Y = /* @__PURE__ */ new WeakMap()),
			(J = /* @__PURE__ */ new WeakMap()),
			(Z = /* @__PURE__ */ new WeakMap()),
			(X = /* @__PURE__ */ new WeakMap()),
			(Q = /* @__PURE__ */ new WeakMap()),
			(tt = /* @__PURE__ */ new WeakMap()),
			(et = /* @__PURE__ */ new WeakMap()),
			(st = /* @__PURE__ */ new WeakMap()),
			(it = /* @__PURE__ */ new WeakMap()),
			(nt = /* @__PURE__ */ new WeakMap()),
			(rt = /* @__PURE__ */ new WeakMap()),
			(ot = /* @__PURE__ */ new WeakMap()),
			(at = /* @__PURE__ */ new WeakMap()),
			(ht = /* @__PURE__ */ new WeakMap()),
			(lt = /* @__PURE__ */ new WeakMap()),
			(ct = /* @__PURE__ */ new WeakMap()),
			(ft = /* @__PURE__ */ new WeakMap()),
			(dt = /* @__PURE__ */ new WeakMap()),
			(ut = /* @__PURE__ */ new WeakMap()),
			(pt = /* @__PURE__ */ new WeakMap()),
			(gt = /* @__PURE__ */ new WeakMap()),
			(mt = /* @__PURE__ */ new WeakMap()),
			yt)](t2) {
				if (!t2._ || !t2["--"]) return t2;
				t2._.push.apply(t2._, t2["--"]);
				try {
					delete t2["--"];
				} catch (t3) {}
				return t2;
			}
			[bt]() {
				return {
					log: (...t2) => {
						this[Vt]() || console.log(...t2),
							O(this, J, true, "f"),
							v(this, tt, "f").length &&
								O(this, tt, v(this, tt, "f") + "\n", "f"),
							O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
					},
					error: (...t2) => {
						this[Vt]() || console.error(...t2),
							O(this, J, true, "f"),
							v(this, tt, "f").length &&
								O(this, tt, v(this, tt, "f") + "\n", "f"),
							O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
					},
				};
			}
			[vt](t2) {
				p(v(this, et, "f")).forEach((e2) => {
					if ("configObjects" === e2) return;
					const s2 = v(this, et, "f")[e2];
					Array.isArray(s2)
						? s2.includes(t2) && s2.splice(s2.indexOf(t2), 1)
						: "object" == typeof s2 && delete s2[t2];
				}),
					delete v(this, pt, "f").getDescriptions()[t2];
			}
			[Ot](t2, e2, s2) {
				v(this, R, "f")[s2] ||
					(v(this, ct, "f").process.emitWarning(t2, e2),
					(v(this, R, "f")[s2] = true));
			}
			[wt]() {
				v(this, K, "f").push({
					options: v(this, et, "f"),
					configObjects: v(this, et, "f").configObjects.slice(0),
					exitProcess: v(this, T, "f"),
					groups: v(this, Y, "f"),
					strict: v(this, ft, "f"),
					strictCommands: v(this, dt, "f"),
					strictOptions: v(this, ut, "f"),
					completionCommand: v(this, U, "f"),
					output: v(this, tt, "f"),
					exitError: v(this, V, "f"),
					hasOutput: v(this, J, "f"),
					parsed: this.parsed,
					parseFn: v(this, nt, "f"),
					parseContext: v(this, rt, "f"),
				}),
					v(this, pt, "f").freeze(),
					v(this, mt, "f").freeze(),
					v(this, z, "f").freeze(),
					v(this, B, "f").freeze();
			}
			[Ct]() {
				let t2,
					e2 = "";
				return (
					(t2 = /\b(node|iojs|electron)(\.exe)?$/.test(
						v(this, ct, "f").process.argv()[0],
					)
						? v(this, ct, "f").process.argv().slice(1, 2)
						: v(this, ct, "f").process.argv().slice(0, 1)),
					(e2 = t2
						.map((t3) => {
							const e3 = this[Tt](v(this, q, "f"), t3);
							return t3.match(/^(\/|([a-zA-Z]:)?\\)/) &&
								e3.length < t3.length
								? e3
								: t3;
						})
						.join(" ")
						.trim()),
					v(this, ct, "f").getEnv("_") &&
						v(this, ct, "f").getProcessArgvBin() ===
							v(this, ct, "f").getEnv("_") &&
						(e2 = v(this, ct, "f")
							.getEnv("_")
							.replace(
								`${v(this, ct, "f").path.dirname(v(this, ct, "f").process.execPath())}/`,
								"",
							)),
					e2
				);
			}
			[jt]() {
				return v(this, it, "f");
			}
			[_t]() {
				if (!v(this, G, "f")) return;
				const t2 =
					v(this, ct, "f").getEnv("LC_ALL") ||
					v(this, ct, "f").getEnv("LC_MESSAGES") ||
					v(this, ct, "f").getEnv("LANG") ||
					v(this, ct, "f").getEnv("LANGUAGE") ||
					"en_US";
				this.locale(t2.replace(/[.:].*/, ""));
			}
			[Mt]() {
				return this[xt]().version || "unknown";
			}
			[kt](t2) {
				const e2 = t2["--"] ? t2["--"] : t2._;
				for (let t3, s2 = 0; void 0 !== (t3 = e2[s2]); s2++)
					v(this, ct, "f").Parser.looksLikeNumber(t3) &&
						Number.isSafeInteger(Math.floor(parseFloat(`${t3}`))) &&
						(e2[s2] = Number(t3));
				return t2;
			}
			[xt](t2) {
				const e2 = t2 || "*";
				if (v(this, ot, "f")[e2]) return v(this, ot, "f")[e2];
				let s2 = {};
				try {
					let e3 = t2 || v(this, ct, "f").mainFilename;
					!t2 &&
						v(this, ct, "f").path.extname(e3) &&
						(e3 = v(this, ct, "f").path.dirname(e3));
					const i2 = v(this, ct, "f").findUp(e3, (t3, e4) =>
						e4.includes("package.json") ? "package.json" : void 0,
					);
					d(i2, void 0, v(this, ct, "f")),
						(s2 = JSON.parse(
							v(this, ct, "f").readFileSync(i2, "utf8"),
						));
				} catch (t3) {}
				return (v(this, ot, "f")[e2] = s2 || {}), v(this, ot, "f")[e2];
			}
			[Et](t2, e2) {
				(e2 = [].concat(e2)).forEach((e3) => {
					(e3 = this[$t](e3)), v(this, et, "f")[t2].push(e3);
				});
			}
			[At](t2, e2, s2, i2) {
				this[St](t2, e2, s2, i2, (t3, e3, s3) => {
					v(this, et, "f")[t3][e3] = s3;
				});
			}
			[Pt](t2, e2, s2, i2) {
				this[St](t2, e2, s2, i2, (t3, e3, s3) => {
					v(this, et, "f")[t3][e3] = (
						v(this, et, "f")[t3][e3] || []
					).concat(s3);
				});
			}
			[St](t2, e2, s2, i2, n2) {
				if (Array.isArray(s2))
					s2.forEach((e3) => {
						t2(e3, i2);
					});
				else if (((t3) => "object" == typeof t3)(s2))
					for (const e3 of p(s2)) t2(e3, s2[e3]);
				else n2(e2, this[$t](s2), i2);
			}
			[$t](t2) {
				return "__proto__" === t2 ? "___proto___" : t2;
			}
			[It](t2, e2) {
				return this[At](this[It].bind(this), "key", t2, e2), this;
			}
			[Nt]() {
				var t2, e2, s2, i2, n2, r2, o2, a2, h2, l2, c2, f2;
				const u2 = v(this, K, "f").pop();
				let p2;
				d(u2, void 0, v(this, ct, "f")),
					(t2 = this),
					(e2 = this),
					(s2 = this),
					(i2 = this),
					(n2 = this),
					(r2 = this),
					(o2 = this),
					(a2 = this),
					(h2 = this),
					(l2 = this),
					(c2 = this),
					(f2 = this),
					({
						options: {
							set value(e3) {
								O(t2, et, e3, "f");
							},
						}.value,
						configObjects: p2,
						exitProcess: {
							set value(t3) {
								O(e2, T, t3, "f");
							},
						}.value,
						groups: {
							set value(t3) {
								O(s2, Y, t3, "f");
							},
						}.value,
						output: {
							set value(t3) {
								O(i2, tt, t3, "f");
							},
						}.value,
						exitError: {
							set value(t3) {
								O(n2, V, t3, "f");
							},
						}.value,
						hasOutput: {
							set value(t3) {
								O(r2, J, t3, "f");
							},
						}.value,
						parsed: this.parsed,
						strict: {
							set value(t3) {
								O(o2, ft, t3, "f");
							},
						}.value,
						strictCommands: {
							set value(t3) {
								O(a2, dt, t3, "f");
							},
						}.value,
						strictOptions: {
							set value(t3) {
								O(h2, ut, t3, "f");
							},
						}.value,
						completionCommand: {
							set value(t3) {
								O(l2, U, t3, "f");
							},
						}.value,
						parseFn: {
							set value(t3) {
								O(c2, nt, t3, "f");
							},
						}.value,
						parseContext: {
							set value(t3) {
								O(f2, rt, t3, "f");
							},
						}.value,
					} = u2),
					(v(this, et, "f").configObjects = p2),
					v(this, pt, "f").unfreeze(),
					v(this, mt, "f").unfreeze(),
					v(this, z, "f").unfreeze(),
					v(this, B, "f").unfreeze();
			}
			[Dt](t2, e2) {
				return j(e2, (e3) => (t2(e3), e3));
			}
			getInternalMethods() {
				return {
					getCommandInstance: this[Ht].bind(this),
					getContext: this[zt].bind(this),
					getHasOutput: this[qt].bind(this),
					getLoggerInstance: this[Wt].bind(this),
					getParseContext: this[Ft].bind(this),
					getParserConfiguration: this[jt].bind(this),
					getUsageInstance: this[Ut].bind(this),
					getValidationInstance: this[Lt].bind(this),
					hasParseCallback: this[Vt].bind(this),
					isGlobalContext: this[Gt].bind(this),
					postProcess: this[Rt].bind(this),
					reset: this[Kt].bind(this),
					runValidation: this[Yt].bind(this),
					runYargsParserAndExecuteCommands: this[Bt].bind(this),
					setHasOutput: this[Jt].bind(this),
				};
			}
			[Ht]() {
				return v(this, z, "f");
			}
			[zt]() {
				return v(this, W, "f");
			}
			[qt]() {
				return v(this, J, "f");
			}
			[Wt]() {
				return v(this, Q, "f");
			}
			[Ft]() {
				return v(this, rt, "f") || {};
			}
			[Ut]() {
				return v(this, pt, "f");
			}
			[Lt]() {
				return v(this, mt, "f");
			}
			[Vt]() {
				return !!v(this, nt, "f");
			}
			[Gt]() {
				return v(this, X, "f");
			}
			[Rt](t2, e2, s2, i2) {
				if (s2) return t2;
				if (f(t2)) return t2;
				e2 || (t2 = this[yt](t2));
				return (
					(this[jt]()["parse-positional-numbers"] ||
						void 0 === this[jt]()["parse-positional-numbers"]) &&
						(t2 = this[kt](t2)),
					i2 &&
						(t2 = C(
							t2,
							this,
							v(this, B, "f").getMiddleware(),
							false,
						)),
					t2
				);
			}
			[Kt](t2 = {}) {
				O(this, et, v(this, et, "f") || {}, "f");
				const e2 = {};
				(e2.local = v(this, et, "f").local || []),
					(e2.configObjects = v(this, et, "f").configObjects || []);
				const s2 = {};
				e2.local.forEach((e3) => {
					(s2[e3] = true),
						(t2[e3] || []).forEach((t3) => {
							s2[t3] = true;
						});
				}),
					Object.assign(
						v(this, at, "f"),
						Object.keys(v(this, Y, "f")).reduce((t3, e3) => {
							const i2 = v(this, Y, "f")[e3].filter(
								(t4) => !(t4 in s2),
							);
							return i2.length > 0 && (t3[e3] = i2), t3;
						}, {}),
					),
					O(this, Y, {}, "f");
				return (
					[
						"array",
						"boolean",
						"string",
						"skipValidation",
						"count",
						"normalize",
						"number",
						"hiddenOptions",
					].forEach((t3) => {
						e2[t3] = (v(this, et, "f")[t3] || []).filter(
							(t4) => !s2[t4],
						);
					}),
					[
						"narg",
						"key",
						"alias",
						"default",
						"defaultDescription",
						"config",
						"choices",
						"demandedOptions",
						"demandedCommands",
						"deprecatedOptions",
					].forEach((t3) => {
						e2[t3] = g(v(this, et, "f")[t3], (t4) => !s2[t4]);
					}),
					(e2.envPrefix = v(this, et, "f").envPrefix),
					O(this, et, e2, "f"),
					O(
						this,
						pt,
						v(this, pt, "f")
							? v(this, pt, "f").reset(s2)
							: P(this, v(this, ct, "f")),
						"f",
					),
					O(
						this,
						mt,
						v(this, mt, "f")
							? v(this, mt, "f").reset(s2)
							: (function (t3, e3, s3) {
									const i2 = s3.y18n.__,
										n2 = s3.y18n.__n,
										r2 = {
											nonOptionCount: function (s4) {
												const i3 =
														t3.getDemandedCommands(),
													r3 =
														s4._.length +
														(s4["--"]
															? s4["--"].length
															: 0) -
														t3
															.getInternalMethods()
															.getContext()
															.commands.length;
												i3._ &&
													(r3 < i3._.min ||
														r3 > i3._.max) &&
													(r3 < i3._.min
														? void 0 !== i3._.minMsg
															? e3.fail(
																	i3._.minMsg
																		? i3._.minMsg
																				.replace(
																					/\$0/g,
																					r3.toString(),
																				)
																				.replace(
																					/\$1/,
																					i3._.min.toString(),
																				)
																		: null,
																)
															: e3.fail(
																	n2(
																		"Not enough non-option arguments: got %s, need at least %s",
																		"Not enough non-option arguments: got %s, need at least %s",
																		r3,
																		r3.toString(),
																		i3._.min.toString(),
																	),
																)
														: r3 > i3._.max &&
															(void 0 !==
															i3._.maxMsg
																? e3.fail(
																		i3._
																			.maxMsg
																			? i3._.maxMsg
																					.replace(
																						/\$0/g,
																						r3.toString(),
																					)
																					.replace(
																						/\$1/,
																						i3._.max.toString(),
																					)
																			: null,
																	)
																: e3.fail(
																		n2(
																			"Too many non-option arguments: got %s, maximum of %s",
																			"Too many non-option arguments: got %s, maximum of %s",
																			r3,
																			r3.toString(),
																			i3._.max.toString(),
																		),
																	)));
											},
											positionalCount: function (t4, s4) {
												s4 < t4 &&
													e3.fail(
														n2(
															"Not enough non-option arguments: got %s, need at least %s",
															"Not enough non-option arguments: got %s, need at least %s",
															s4,
															s4 + "",
															t4 + "",
														),
													);
											},
											requiredArguments: function (
												t4,
												s4,
											) {
												let i3 = null;
												for (const e4 of Object.keys(
													s4,
												))
													(Object.prototype.hasOwnProperty.call(
														t4,
														e4,
													) &&
														void 0 !== t4[e4]) ||
														((i3 = i3 || {}),
														(i3[e4] = s4[e4]));
												if (i3) {
													const t5 = [];
													for (const e4 of Object.keys(
														i3,
													)) {
														const s6 = i3[e4];
														s6 &&
															t5.indexOf(s6) <
																0 &&
															t5.push(s6);
													}
													const s5 = t5.length
														? `
${t5.join("\n")}`
														: "";
													e3.fail(
														n2(
															"Missing required argument: %s",
															"Missing required arguments: %s",
															Object.keys(i3)
																.length,
															Object.keys(
																i3,
															).join(", ") + s5,
														),
													);
												}
											},
											unknownArguments: function (
												s4,
												i3,
												o3,
												a3,
												h2 = true,
											) {
												var l3;
												const c3 = t3
														.getInternalMethods()
														.getCommandInstance()
														.getCommands(),
													f2 = [],
													d2 = t3
														.getInternalMethods()
														.getContext();
												if (
													(Object.keys(s4).forEach(
														(e4) => {
															H.includes(e4) ||
																Object.prototype.hasOwnProperty.call(
																	o3,
																	e4,
																) ||
																Object.prototype.hasOwnProperty.call(
																	t3
																		.getInternalMethods()
																		.getParseContext(),
																	e4,
																) ||
																r2.isValidAndSomeAliasIsNotNew(
																	e4,
																	i3,
																) ||
																f2.push(e4);
														},
													),
													h2 &&
														(d2.commands.length >
															0 ||
															c3.length > 0 ||
															a3) &&
														s4._.slice(
															d2.commands.length,
														).forEach((t4) => {
															c3.includes(
																"" + t4,
															) ||
																f2.push(
																	"" + t4,
																);
														}),
													h2)
												) {
													const e4 =
															(null ===
																(l3 =
																	t3.getDemandedCommands()
																		._) ||
															void 0 === l3
																? void 0
																: l3.max) || 0,
														i4 =
															d2.commands.length +
															e4;
													i4 < s4._.length &&
														s4._.slice(i4).forEach(
															(t4) => {
																(t4 =
																	String(t4)),
																	d2.commands.includes(
																		t4,
																	) ||
																		f2.includes(
																			t4,
																		) ||
																		f2.push(
																			t4,
																		);
															},
														);
												}
												f2.length &&
													e3.fail(
														n2(
															"Unknown argument: %s",
															"Unknown arguments: %s",
															f2.length,
															f2
																.map((t4) =>
																	t4.trim()
																		? t4
																		: `"${t4}"`,
																)
																.join(", "),
														),
													);
											},
											unknownCommands: function (s4) {
												const i3 = t3
														.getInternalMethods()
														.getCommandInstance()
														.getCommands(),
													r3 = [],
													o3 = t3
														.getInternalMethods()
														.getContext();
												return (
													(o3.commands.length > 0 ||
														i3.length > 0) &&
														s4._.slice(
															o3.commands.length,
														).forEach((t4) => {
															i3.includes(
																"" + t4,
															) ||
																r3.push(
																	"" + t4,
																);
														}),
													r3.length > 0 &&
														(e3.fail(
															n2(
																"Unknown command: %s",
																"Unknown commands: %s",
																r3.length,
																r3.join(", "),
															),
														),
														true)
												);
											},
											isValidAndSomeAliasIsNotNew:
												function (e4, s4) {
													if (
														!Object.prototype.hasOwnProperty.call(
															s4,
															e4,
														)
													)
														return false;
													const i3 =
														t3.parsed.newAliases;
													return [e4, ...s4[e4]].some(
														(t4) =>
															!Object.prototype.hasOwnProperty.call(
																i3,
																t4,
															) || !i3[e4],
													);
												},
											limitedChoices: function (s4) {
												const n3 = t3.getOptions(),
													r3 = {};
												if (
													!Object.keys(n3.choices)
														.length
												)
													return;
												Object.keys(s4).forEach(
													(t4) => {
														-1 === H.indexOf(t4) &&
															Object.prototype.hasOwnProperty.call(
																n3.choices,
																t4,
															) &&
															[]
																.concat(s4[t4])
																.forEach(
																	(e4) => {
																		-1 ===
																			n3.choices[
																				t4
																			].indexOf(
																				e4,
																			) &&
																			void 0 !==
																				e4 &&
																			(r3[
																				t4
																			] =
																				(
																					r3[
																						t4
																					] ||
																					[]
																				).concat(
																					e4,
																				));
																	},
																);
													},
												);
												const o3 = Object.keys(r3);
												if (!o3.length) return;
												let a3 = i2("Invalid values:");
												o3.forEach((t4) => {
													a3 += `
  ${i2("Argument: %s, Given: %s, Choices: %s", t4, e3.stringifiedValues(r3[t4]), e3.stringifiedValues(n3.choices[t4]))}`;
												}),
													e3.fail(a3);
											},
										};
									let o2 = {};
									function a2(t4, e4) {
										const s4 = Number(e4);
										return (
											"number" ==
											typeof (e4 = isNaN(s4) ? e4 : s4)
												? (e4 = t4._.length >= e4)
												: e4.match(/^--no-.+/)
													? ((e4 =
															e4.match(
																/^--no-(.+)/,
															)[1]),
														(e4 =
															!Object.prototype.hasOwnProperty.call(
																t4,
																e4,
															)))
													: (e4 =
															Object.prototype.hasOwnProperty.call(
																t4,
																e4,
															)),
											e4
										);
									}
									(r2.implies = function (e4, i3) {
										h(
											"<string|object> [array|number|string]",
											[e4, i3],
											arguments.length,
										),
											"object" == typeof e4
												? Object.keys(e4).forEach(
														(t4) => {
															r2.implies(
																t4,
																e4[t4],
															);
														},
													)
												: (t3.global(e4),
													o2[e4] || (o2[e4] = []),
													Array.isArray(i3)
														? i3.forEach((t4) =>
																r2.implies(
																	e4,
																	t4,
																),
															)
														: (d(i3, void 0, s3),
															o2[e4].push(i3)));
									}),
										(r2.getImplied = function () {
											return o2;
										}),
										(r2.implications = function (t4) {
											const s4 = [];
											if (
												(Object.keys(o2).forEach(
													(e4) => {
														const i3 = e4;
														(o2[e4] || []).forEach(
															(e5) => {
																let n3 = i3;
																const r3 = e5;
																(n3 = a2(
																	t4,
																	n3,
																)),
																	(e5 = a2(
																		t4,
																		e5,
																	)),
																	n3 &&
																		!e5 &&
																		s4.push(
																			` ${i3} -> ${r3}`,
																		);
															},
														);
													},
												),
												s4.length)
											) {
												let t5 = `${i2("Implications failed:")}
`;
												s4.forEach((e4) => {
													t5 += e4;
												}),
													e3.fail(t5);
											}
										});
									let l2 = {};
									(r2.conflicts = function (e4, s4) {
										h(
											"<string|object> [array|string]",
											[e4, s4],
											arguments.length,
										),
											"object" == typeof e4
												? Object.keys(e4).forEach(
														(t4) => {
															r2.conflicts(
																t4,
																e4[t4],
															);
														},
													)
												: (t3.global(e4),
													l2[e4] || (l2[e4] = []),
													Array.isArray(s4)
														? s4.forEach((t4) =>
																r2.conflicts(
																	e4,
																	t4,
																),
															)
														: l2[e4].push(s4));
									}),
										(r2.getConflicting = () => l2),
										(r2.conflicting = function (n3) {
											Object.keys(n3).forEach((t4) => {
												l2[t4] &&
													l2[t4].forEach((s4) => {
														s4 &&
															void 0 !== n3[t4] &&
															void 0 !== n3[s4] &&
															e3.fail(
																i2(
																	"Arguments %s and %s are mutually exclusive",
																	t4,
																	s4,
																),
															);
													});
											}),
												t3
													.getInternalMethods()
													.getParserConfiguration()[
													"strip-dashed"
												] &&
													Object.keys(l2).forEach(
														(t4) => {
															l2[t4].forEach(
																(r3) => {
																	r3 &&
																		void 0 !==
																			n3[
																				s3.Parser.camelCase(
																					t4,
																				)
																			] &&
																		void 0 !==
																			n3[
																				s3.Parser.camelCase(
																					r3,
																				)
																			] &&
																		e3.fail(
																			i2(
																				"Arguments %s and %s are mutually exclusive",
																				t4,
																				r3,
																			),
																		);
																},
															);
														},
													);
										}),
										(r2.recommendCommands = function (
											t4,
											s4,
										) {
											s4 = s4.sort(
												(t5, e4) =>
													e4.length - t5.length,
											);
											let n3 = null,
												r3 = 1 / 0;
											for (
												let e4, i3 = 0;
												void 0 !== (e4 = s4[i3]);
												i3++
											) {
												const s5 = D(t4, e4);
												s5 <= 3 &&
													s5 < r3 &&
													((r3 = s5), (n3 = e4));
											}
											n3 &&
												e3.fail(
													i2("Did you mean %s?", n3),
												);
										}),
										(r2.reset = function (t4) {
											return (
												(o2 = g(o2, (e4) => !t4[e4])),
												(l2 = g(l2, (e4) => !t4[e4])),
												r2
											);
										});
									const c2 = [];
									return (
										(r2.freeze = function () {
											c2.push({
												implied: o2,
												conflicting: l2,
											});
										}),
										(r2.unfreeze = function () {
											const t4 = c2.pop();
											d(t4, void 0, s3),
												({
													implied: o2,
													conflicting: l2,
												} = t4);
										}),
										r2
									);
								})(this, v(this, pt, "f"), v(this, ct, "f")),
						"f",
					),
					O(
						this,
						z,
						v(this, z, "f")
							? v(this, z, "f").reset()
							: (function (t3, e3, s3, i2) {
									return new M(t3, e3, s3, i2);
								})(
									v(this, pt, "f"),
									v(this, mt, "f"),
									v(this, B, "f"),
									v(this, ct, "f"),
								),
						"f",
					),
					v(this, F, "f") ||
						O(
							this,
							F,
							(function (t3, e3, s3, i2) {
								return new N(t3, e3, s3, i2);
							})(
								this,
								v(this, pt, "f"),
								v(this, z, "f"),
								v(this, ct, "f"),
							),
							"f",
						),
					v(this, B, "f").reset(),
					O(this, U, null, "f"),
					O(this, tt, "", "f"),
					O(this, V, null, "f"),
					O(this, J, false, "f"),
					(this.parsed = false),
					this
				);
			}
			[Tt](t2, e2) {
				return v(this, ct, "f").path.relative(t2, e2);
			}
			[Bt](t2, s2, i2, n2 = 0, r2 = false) {
				let o2 = !!i2 || r2;
				(t2 = t2 || v(this, ht, "f")),
					(v(this, et, "f").__ = v(this, ct, "f").y18n.__),
					(v(this, et, "f").configuration = this[jt]());
				const a2 = !!v(this, et, "f").configuration["populate--"],
					h2 = Object.assign({}, v(this, et, "f").configuration, {
						"populate--": true,
					}),
					l2 = v(this, ct, "f").Parser.detailed(
						t2,
						Object.assign({}, v(this, et, "f"), {
							configuration: {
								"parse-positional-numbers": false,
								...h2,
							},
						}),
					),
					c2 = Object.assign(l2.argv, v(this, rt, "f"));
				let d2;
				const u2 = l2.aliases;
				let p2 = false,
					g2 = false;
				Object.keys(c2).forEach((t3) => {
					t3 === v(this, Z, "f") && c2[t3]
						? (p2 = true)
						: t3 === v(this, gt, "f") && c2[t3] && (g2 = true);
				}),
					(c2.$0 = this.$0),
					(this.parsed = l2),
					0 === n2 && v(this, pt, "f").clearCachedHelpMessage();
				try {
					if ((this[_t](), s2)) return this[Rt](c2, a2, !!i2, false);
					if (v(this, Z, "f")) {
						[v(this, Z, "f")]
							.concat(u2[v(this, Z, "f")] || [])
							.filter((t3) => t3.length > 1)
							.includes("" + c2._[c2._.length - 1]) &&
							(c2._.pop(), (p2 = true));
					}
					O(this, X, false, "f");
					const h3 = v(this, z, "f").getCommands(),
						m2 = v(this, F, "f").completionKey in c2,
						y2 = p2 || m2 || r2;
					if (c2._.length) {
						if (h3.length) {
							let t3;
							for (
								let e2, s3 = n2 || 0;
								void 0 !== c2._[s3];
								s3++
							) {
								if (
									((e2 = String(c2._[s3])),
									h3.includes(e2) && e2 !== v(this, U, "f"))
								) {
									const t4 = v(this, z, "f").runCommand(
										e2,
										this,
										l2,
										s3 + 1,
										r2,
										p2 || g2 || r2,
									);
									return this[Rt](t4, a2, !!i2, false);
								}
								if (!t3 && e2 !== v(this, U, "f")) {
									t3 = e2;
									break;
								}
							}
							!v(this, z, "f").hasDefaultCommand() &&
								v(this, lt, "f") &&
								t3 &&
								!y2 &&
								v(this, mt, "f").recommendCommands(t3, h3);
						}
						v(this, U, "f") &&
							c2._.includes(v(this, U, "f")) &&
							!m2 &&
							(v(this, T, "f") && E(true),
							this.showCompletionScript(),
							this.exit(0));
					}
					if (v(this, z, "f").hasDefaultCommand() && !y2) {
						const t3 = v(this, z, "f").runCommand(
							null,
							this,
							l2,
							0,
							r2,
							p2 || g2 || r2,
						);
						return this[Rt](t3, a2, !!i2, false);
					}
					if (m2) {
						v(this, T, "f") && E(true);
						const s3 = (t2 = [].concat(t2)).slice(
							t2.indexOf(`--${v(this, F, "f").completionKey}`) +
								1,
						);
						return (
							v(this, F, "f").getCompletion(s3, (t3, s4) => {
								if (t3) throw new e(t3.message);
								(s4 || []).forEach((t4) => {
									v(this, Q, "f").log(t4);
								}),
									this.exit(0);
							}),
							this[Rt](c2, !a2, !!i2, false)
						);
					}
					if (
						(v(this, J, "f") ||
							(p2
								? (v(this, T, "f") && E(true),
									(o2 = true),
									this.showHelp("log"),
									this.exit(0))
								: g2 &&
									(v(this, T, "f") && E(true),
									(o2 = true),
									v(this, pt, "f").showVersion("log"),
									this.exit(0))),
						!o2 &&
							v(this, et, "f").skipValidation.length > 0 &&
							(o2 = Object.keys(c2).some(
								(t3) =>
									v(this, et, "f").skipValidation.indexOf(
										t3,
									) >= 0 && true === c2[t3],
							)),
						!o2)
					) {
						if (l2.error) throw new e(l2.error.message);
						if (!m2) {
							const t3 = this[Yt](u2, {}, l2.error);
							i2 ||
								(d2 = C(
									c2,
									this,
									v(this, B, "f").getMiddleware(),
									true,
								)),
								(d2 = this[Dt](t3, null != d2 ? d2 : c2)),
								f(d2) &&
									!i2 &&
									(d2 = d2.then(() =>
										C(
											c2,
											this,
											v(this, B, "f").getMiddleware(),
											false,
										),
									));
						}
					}
				} catch (t3) {
					if (!(t3 instanceof e)) throw t3;
					v(this, pt, "f").fail(t3.message, t3);
				}
				return this[Rt](null != d2 ? d2 : c2, a2, !!i2, true);
			}
			[Yt](t2, s2, i2, n2) {
				const r2 = { ...this.getDemandedOptions() };
				return (o2) => {
					if (i2) throw new e(i2.message);
					v(this, mt, "f").nonOptionCount(o2),
						v(this, mt, "f").requiredArguments(o2, r2);
					let a2 = false;
					v(this, dt, "f") &&
						(a2 = v(this, mt, "f").unknownCommands(o2)),
						v(this, ft, "f") && !a2
							? v(this, mt, "f").unknownArguments(
									o2,
									t2,
									s2,
									!!n2,
								)
							: v(this, ut, "f") &&
								v(this, mt, "f").unknownArguments(
									o2,
									t2,
									{},
									false,
									false,
								),
						v(this, mt, "f").limitedChoices(o2),
						v(this, mt, "f").implications(o2),
						v(this, mt, "f").conflicting(o2);
				};
			}
			[Jt]() {
				O(this, J, true, "f");
			}
			[Zt](t2) {
				if ("string" == typeof t2) v(this, et, "f").key[t2] = true;
				else for (const e2 of t2) v(this, et, "f").key[e2] = true;
			}
		};
		var Qt;
		var te;
		var { readFileSync: ee } = require("fs");
		var { inspect: se } = require("util");
		var { resolve: ie } = require("path");
		var ne = require_build();
		var re = require_build2();
		var oe;
		var ae = {
			assert: {
				notStrictEqual: t.notStrictEqual,
				strictEqual: t.strictEqual,
			},
			cliui: require_build3(),
			findUp: require_sync(),
			getEnv: (t2) => process.env[t2],
			getCallerFile: require_get_caller_file(),
			getProcessArgvBin: y,
			inspect: se,
			mainFilename:
				null !==
					(te =
						null ===
							(Qt =
								null === require || void 0 === require
									? void 0
									: require.main) || void 0 === Qt
							? void 0
							: Qt.filename) && void 0 !== te
					? te
					: process.cwd(),
			Parser: re,
			path: require("path"),
			process: {
				argv: () => process.argv,
				cwd: process.cwd,
				emitWarning: (t2, e2) => process.emitWarning(t2, e2),
				execPath: () => process.execPath,
				exit: (t2) => {
					process.exit(t2);
				},
				nextTick: process.nextTick,
				stdColumns:
					void 0 !== process.stdout.columns
						? process.stdout.columns
						: null,
			},
			readFileSync: ee,
			require,
			requireDirectory: require_require_directory(),
			stringWidth: require_string_width(),
			y18n: ne({
				directory: ie(__dirname, "../locales"),
				updateFiles: false,
			}),
		};
		var he = (
			null ===
				(oe =
					null === process || void 0 === process
						? void 0
						: process.env) || void 0 === oe
				? void 0
				: oe.YARGS_MIN_NODE_VERSION
		)
			? Number(process.env.YARGS_MIN_NODE_VERSION)
			: 12;
		if (process && process.version) {
			if (Number(process.version.match(/v([^.]+)/)[1]) < he)
				throw Error(
					`yargs supports a minimum Node.js version of ${he}. Read our version support policy: https://github.com/yargs/yargs#supported-nodejs-versions`,
				);
		}
		var le = require_build2();
		var ce;
		var fe = {
			applyExtends: n,
			cjsPlatformShim: ae,
			Yargs:
				((ce = ae),
				(t2 = [], e2 = ce.process.cwd(), s2) => {
					const i2 = new Xt(t2, e2, s2, ce);
					return (
						Object.defineProperty(i2, "argv", {
							get: () => i2.parse(),
							enumerable: true,
						}),
						i2.help(),
						i2.version(),
						i2
					);
				}),
			argsert: h,
			isPromise: f,
			objFilter: g,
			parseCommand: o,
			Parser: le,
			processArgv: b,
			YError: e,
		};
		module2.exports = fe;
	},
});

// node_modules/yargs/index.cjs
var require_yargs = __commonJS({
	"node_modules/yargs/index.cjs"(exports, module2) {
		"use strict";
		var { Yargs, processArgv } = require_build4();
		Argv(processArgv.hideBin(process.argv));
		module2.exports = Argv;
		function Argv(processArgs, cwd) {
			const argv2 = Yargs(processArgs, cwd, require);
			singletonify(argv2);
			return argv2;
		}
		function defineGetter(obj, key, getter) {
			Object.defineProperty(obj, key, {
				configurable: true,
				enumerable: true,
				get: getter,
			});
		}
		function lookupGetter(obj, key) {
			const desc = Object.getOwnPropertyDescriptor(obj, key);
			if (typeof desc !== "undefined") {
				return desc.get;
			}
		}
		function singletonify(inst) {
			[
				...Object.keys(inst),
				...Object.getOwnPropertyNames(inst.constructor.prototype),
			].forEach((key) => {
				if (key === "argv") {
					defineGetter(Argv, key, lookupGetter(inst, key));
				} else if (typeof inst[key] === "function") {
					Argv[key] = inst[key].bind(inst);
				} else {
					defineGetter(Argv, "$0", () => inst.$0);
					defineGetter(Argv, "parsed", () => inst.parsed);
				}
			});
		}
	},
});

// src/scanProcess.ts
var import_net = require("net");

// src/lib/misc.ts
function pick(obj, keys) {
	const ret = {};
	for (const key of keys) {
		if (key in obj) ret[key] = obj[key];
	}
	return ret;
}

// src/lib/scanProcessInterface.ts
var import_typeguards = __toESM(require_typeguards());

// src/scanProcess.ts
var yargs = require_yargs();
var argv = yargs
	.env("IOB_BLE")
	.strict()
	.usage("ioBroker.ble scanner process\n\nUsage: $0 [options]")
	.options({
		hciDevice: {
			alias: "-d",
			type: "number",
			desc: "Index of the HCI device to use for scanning",
			default: 0,
		},
		services: {
			alias: "-s",
			type: "array",
			desc: "Which BLE services to scan for",
			default: [],
		},
		listenInterface: {
			alias: "-i",
			type: "string",
			desc: "If not spawned as a child process, the interface to listen for TCP connections. Default: all interfaces.",
		},
		listenPort: {
			alias: "-p",
			type: "number",
			desc: "If not spawned as a child process, the port to listen on.",
			default: 8734,
		},
	})
	.parseSync();
var noble;
var server;
var clients = /* @__PURE__ */ new Set();
function sendAsync(message, sendHandle, swallowErrors = true) {
	if (process.send) {
		return new Promise((resolve, reject) => {
			process.send(message, sendHandle, void 0, (err) => {
				if (err && !swallowErrors) reject(err);
				else resolve();
			});
		});
	} else {
		const promises = [...clients].map((client) => {
			return new Promise((resolve, reject) => {
				client.write(JSON.stringify(message) + "\n", (err) => {
					if (err && !swallowErrors) reject(err);
					else resolve();
				});
			});
		});
		return Promise.all(promises).then(() => void 0);
	}
}
Error.prototype.toJSON = function () {
	const ret = {
		type: "Error",
		name: this.name,
		message: this.message,
		stack: this.stack,
	};
	for (const key of Object.keys(this)) {
		if (!ret[key]) {
			ret[key] = this[key];
		}
	}
	return ret;
};
process.on("uncaughtException", (error) => {
	sendAsync({ type: "error", error });
});
process.on("unhandledRejection", (error) => {
	sendAsync({
		type: "error",
		error:
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			error instanceof Error ? error : new Error(`${error}`),
	});
});
process.on("message", (msg) => {
	handleMessage(msg);
});
function handleMessage(msg) {
	switch (msg.type) {
		case "startScanning":
			startScanning();
			break;
		case "stopScanning":
			stopScanning();
			break;
	}
}
function serializePeripheral(peripheral) {
	return pick(peripheral, [
		"id",
		"uuid",
		"address",
		"addressType",
		"connectable",
		"advertisement",
		"rssi",
		"services",
		"state",
	]);
}
function onDiscover(peripheral) {
	if (peripheral == void 0) return;
	sendAsync({
		type: "discover",
		peripheral: serializePeripheral(peripheral),
	});
}
var isScanning = false;
async function startScanning() {
	if (isScanning) return;
	await sendAsync({ type: "connected" });
	await sendAsync({
		type: "log",
		message: `starting scan for services ${JSON.stringify(argv.services)}`,
	});
	noble.on("discover", onDiscover);
	await noble.startScanningAsync(argv.services, true);
	isScanning = true;
}
async function stopScanning() {
	if (!isScanning) return;
	noble.removeAllListeners("discover");
	sendAsync({
		type: "log",
		message: `stopping scan`,
	});
	noble.stopScanning();
	sendAsync({ type: "disconnected" });
	isScanning = false;
}
function maybeStartServer() {
	if (process.send) return Promise.resolve();
	return new Promise((resolve, reject) => {
		server = (0, import_net.createServer)((socket) => {
			console.log("Client connected");
			clients.add(socket);
			socket.on("close", () => {
				console.log("Client disconnected");
				clients.delete(socket);
			});
		});
		server.maxConnections = 1;
		server.on("error", (err) => {
			if (err.code === "EADDRINUSE") {
				reject(err);
			}
		});
		server.listen(
			{
				host: argv.listenInterface,
				port: argv.listenPort,
			},
			() => {
				const address = server.address();
				console.log(
					`Server listening on tcp://${address.address}:${address.port}`,
				);
				resolve();
			},
		);
	});
}
async function loadNoble() {
	process.env.NOBLE_HCI_DEVICE_ID = argv.hciDevice.toString();
	try {
		noble = require("@stoprocent/noble");
		if (typeof noble.on !== "function") {
			noble = noble({ extended: false });
		}
	} catch (error) {
		await sendAsync({ type: "fatal", error });
		process.exit(1 /* RequireNobleFailed */);
	}
}
async function main() {
	noble.on("stateChange", (state) => {
		switch (state) {
			case "poweredOn":
				startScanning();
				break;
			case "poweredOff":
				stopScanning();
				break;
		}
		console.log(`driver state is ${state}`);
		sendAsync({ type: "driverState", driverState: state });
	});
	if (noble.state === "poweredOn") startScanning();
	sendAsync({ type: "driverState", driverState: noble.state });
}
(async () => {
	await loadNoble();
	await maybeStartServer();
	if (server) {
		server.once("connection", () => {
			main();
		});
	} else {
		main();
	}
})();
