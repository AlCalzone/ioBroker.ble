import fs = require('fs');

declare global { 
	namespace ioBroker {

		enum StateQuality {
			good = 0x00, // or undefined or null
			bad = 0x01,
			general_problem = 0x01,
			general_device_problem = 0x41,
			general_sensor_problem = 0x81,
			device_not_connected = 0x42,
			sensor_not_connected = 0x82,
			device_reports_error = 0x44,
			sensor_reports_error = 0x84
		}

		interface State {
			/** The value of the state. */
			val: any;

			/** Direction flag: false for desired value and true for actual value. Default: false. */
			ack: boolean;

			/** Unix timestamp. Default: current time */
			ts: number;

			/** Unix timestamp of the last time the value changed */
			lc: number;

			/** Name of the adapter instance which set the value, e.g. "system.adapter.web.0" */
			from: string;

			/** Optional time in seconds after which the state is reset to null */
			expire?: number;

			/** Optional quality of the state value */
			q?: StateQuality;

			/** Optional comment */
			c?: string;
		}
		//interface States { }
		type States = any; // TODO implement

		type ObjectType = "state" | "channel" | "device";
		type CommonType = "number" | "string" | "boolean" | "array" | "object" | "mixed" | "file";

		interface ObjectCommon {
			/** name of this object */
			name: string;
		}

		interface StateCommon extends ObjectCommon {
			/** Type of this state. See https://github.com/ioBroker/ioBroker/blob/master/doc/SCHEMA.md#state-commonrole for a detailed description */
			type?: CommonType;
			/** minimum value */
			min?: number;
			/** maximum value */
			max?: number;
			/** unit of the value */
			unit?: string;
			/** the default value */
			def?: any;
			/** description of this state */
			desc?: string;

			/** if this state is readable */
			read: boolean;
			/** if this state is writable */
			write: boolean;
			/** role of the state (used in user interfaces to indicate which widget to choose) */
			role: string;

			/** all possible states */
			states?: any[];

			/** ID of a helper state indicating if the handler of this state is working */
			workingID?: string;

			/** attached history information */
			history?: any
		}
		interface ChannelCommon extends ObjectCommon {
			/** role of the channel */
			role?: string;
			/** description of this channel */
			desc?: string;
		}

		type Object = {
			/** The ID of this object */
			_id?: string;
			native: { [id: string]: any };
			enums?: { [id: string]: string };
			type: "state";
			common: StateCommon;
		} | {
			/** The ID of this object */
			_id?: string;
			native: { [id: string]: any };
			enums?: { [id: string]: string };
			type: "channel";
			common: ChannelCommon;
		} | {
			/** The ID of this object */
			_id?: string;
			native: { [id: string]: any };
			enums?: { [id: string]: string };
			type: "device";
			common: ObjectCommon; //TODO: any definition for device?
		};
		//interface Objects { }
		type Objects = any; // TODO implement


		interface Logger {
			/** log message with debug level */
			debug(message: string);
			/** log message with info level (default output level for all adapters) */
			info(message: string);
			/** log message with warning severity */
			warn(message: string);
			/** log message with error severity */
			error(message: string);
		}

		interface Certificates {
			/** private key file */
			key: string | Buffer;
			/** public certificate */
			cert: string | Buffer;
			/** chained CA certificates */
			ca: (string | Buffer)[];
		}



		type EnumList = string | string[];

		interface Enum { } 

		interface DirectoryEntry {
			file: string;
			stats: fs.Stats;
			isDir: boolean;
			acl: any; // access control list object
			modifiedAt: number;
			createdAt: number;
		}


		interface GetHistoryOptions {
			instance?: string;
			start?: number;
			end?: number;
			step?: number;
			count?: number;
			from?: boolean;
			ack?: boolean;
			q?: boolean;
			addID?: boolean;
			limit?: number;
			ignoreNull: boolean;
			sessionId?: any;
			aggregate?: "minmax" | "min" | "max" | "average" | "total" | "count" | "none";
		}

		interface AdapterOptions {
			/** The name of the adapter */
			name: string;

			/** path to adapter */
			dirname?: string;

			/** if the global system config should be included in the created object. Default: false */
			systemConfig?: boolean;

			/** provide alternative global configuration for the adapter. Default: null */
			config?: any;

			/** instance of the created adapter. Default: null */
			instance?: number;

			/** If the adapter needs access to the formatDate function to format dates according to the global settings. Default: false */
			useFormatDate?: boolean;

			/** If the adapter collects logs from all adapters (experts only). Default: false */
			logTransporter?: boolean;

			/** Handler for changes of subscribed objects */
			objectChange?: ObjectChangeHandler;
			/** Handler for received adapter messages */
			message?: (obj: any) => void;
			/** Handler for changes of subscribed states */
			stateChange?: StateChangeHandler;
			/** Will be called when the adapter is intialized */
			ready?: () => void;
			/** Will be called on adapter termination */
			unload?: (callback: Function) => void;

			/** if true, stateChange will be called with an id that has no namespace, e.g. "state" instead of "adapter.0.state". Default: false */
			noNamespace?: boolean;
		}

		interface Adapter {
			/** The name of the adapter */
			name: string;
			/** The name of the host where the adapter is running */
			host: string;
			/** instance number of this adapter instance */
			instance: number;
			/** Namespace of adapter objects: "<name>.<instance>" */
			readonly namespace: string;
			/** native part of the adapter settings */
			config: any;
			/** common part of the adapter settings */
			common: any;
			/** system part of the adapter settings */
			systemConfig?: any;
			/** path to the adapter folder */
			adapterDir: string;
			/** content of io-package.json */
			ioPack: any;
			/** content of package.json */
			pack: any;
			/** access to the logging functions */
			log: Logger;
			/** adapter version */
			version: any;
			states: States;
			objects: Objects;
			/** if the adapter is connected to the host */
			connected: boolean;

			/*	===============================
				Functions defined in adapter.js
				=============================== */

			/**
			 * Helper function that looks for first free TCP port starting with the given one.
			 * @param port - The port to start with
			 * @param callback - gets called when a free port is found
			 */
			getPort(port: number, callback: (port: number) => void);

			// ==============================
			// GENERAL

			/** Validates username and password */
			checkPassword(user: string, password: string, callback: (result: boolean) => void);
			checkPassword(user: string, password: string, options: any, callback: (result: boolean) => void);
			/** Sets a new password for the given user */
			setPassword(user: string, password: string, options?: any, callback?: (err?: any) => void);
			/** <INTERNAL> Checks if a user exists and is in the given group. */
			checkGroup(user: string, group: string, callback: (result: boolean) => void);
			checkGroup(user: string, group: string, options: any, callback: (result: boolean) => void);
			/** <INTERNAL> Determines the users permissions */
			calculatePermissions(user: string, commandsPermissions: any, callback: (result: any) => void);
			calculatePermissions(user: string, commandsPermissions: any, options: any, callback: (result: any) => void);
			/** Returns SSL certificates by name (private key, public cert and chained certificate) for creation of HTTPS servers */
			getCertificates(publicName: string, privateName: string, chainedName: string, callback: (err: string, certs?: Certificates, useLetsEncryptCert?: boolean) => void);

			/**
			 * Sends a message to a specific instance or all instances of some specific adapter.
			 */
			sendTo(instanceName: string, message: string | object, callback?: (result?: any) => void);
			sendTo(instanceName: string, command: string, message: string | object, callback?: (result?: any) => void);

			/**
			 * Sends a message to a specific host or all hosts.
			 */
			sendToHost(hostName: string, message: string | object, callback?: (result?: any) => void);
			sendToHost(hostName: string, command: string, message: string | object, callback?: (result?: any) => void);

			/** Convert ID to {device: D, channel: C, state: S} */
			idToDCS(id: string): {
				device: string;
				channel: string;
				state: string;
			}

			// ==============================
			// own objects

			/** Reads an object from the object db */
			getObject(id: string, callback: GetObjectCallback): void;
			getObject(id: string, options: any, callback: GetObjectCallback): void;
			/** Creates or overwrites an object in the object db */
			setObject(id: string, obj: Object, options?: any, callback?: SetObjectCallback): void;
			/** Creates an object in the object db. Existing objects are not overwritten. */
			setObjectNotExists(id: string, obj: Object, options?: any, callback?: SetObjectCallback): void;
			/** Get all states, channels and devices of this adapter */
			getAdapterObjects(callback: (objects: { [id: string]: Object }) => void);
			/** Extend an object and create it if it might not exist */
			extendObject(id: string, objPart: Partial<Object>, options?: any, callback?: SetObjectCallback): void;
			/** 
			 * Deletes an object from the object db
			 * @param id - The id of the object without namespace
			 */
			delObject(id: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// foreign objects

			/** Reads an object (which might not belong to this adapter) from the object db */
			getForeignObject(id: string, callback: GetObjectCallback): void;
			getForeignObject(id: string, options: any, callback: GetObjectCallback): void;
			/** Get foreign objects by pattern, by specific type and resolve their enums. */
			getForeignObjects(pattern: string, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, options: any, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, enums: EnumList, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, options: any, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, enums: EnumList, options: any, callback: GetObjectsCallback): void;
			/** Creates or overwrites an object (which might not belong to this adapter) in the object db */
			setForeignObject(id: string, obj: Object, options?: any, callback?: SetObjectCallback): void;
			/** Creates an object (which might not belong to this adapter) in the object db. Existing objects are not overwritten. */
			setForeignObjectNotExists(id: string, obj: Object, options?: any, callback?: SetObjectCallback): void;
			/** Extend an object (which might not belong to this adapter) and create it if it might not exist */
			extendForeignObject(id: string, objPart: Partial<Object>, options?: any, callback?: SetObjectCallback): void;
			/**
			 * Finds an object by its ID or name
			 * @param type - common.type of the state
			 */
			findForeignObject(idOrName: string, type: string, callback: FindObjectCallback): void;
			findForeignObject(idOrName: string, type: string, options: any, callback: FindObjectCallback): void;
			/**  
			 * Deletes an object (which might not belong to this adapter) from the object db
			 * @param id - The id of the object including namespace
			 */
			delForeignObject(id: string, options?: any, callback?: GenericCallback): void;


			// ==============================
			// states
			/** Writes a value into the states DB. */
			setState(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateCallback): void;
			/** Writes a value into the states DB only if it has changed. */
			setStateChanged(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateChangedCallback): void;
			/** Writes a value (which might not belong to this adapter) into the states DB. */
			setForeignState(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateCallback): void;
			/** Writes a value (which might not belong to this adapter) into the states DB only if it has changed. */
			setForeignStateChanged(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateChangedCallback): void;

			/** Read a value from the states DB. */
			getState(id: string, callback: GetStateCallback): void;
			getState(id: string, options: any, callback: GetStateCallback): void;
			/** Read a value (which might not belong to this adapter) from the states DB. */
			getForeignState(id: string, callback: GetStateCallback): void;
			getForeignState(id: string, options: any, callback: GetStateCallback): void;
			/** Read all states of this adapter which match the given pattern */
			getStates(pattern: string, callback: GetStatesCallback)
			getStates(pattern: string, options: any, callback: GetStatesCallback)
			/** Read all states (which might not belong to this adapter) which match the given pattern */
			getForeignStates(pattern: string, callback: GetStatesCallback)
			getForeignStates(pattern: string, options: any, callback: GetStatesCallback)

			/** Deletes a state from the states DB, but not the associated object. Consider using @link{deleteState} instead */
			delState(id: string, options?: any, callback?: GenericCallback): void;
			/** Deletes a state from the states DB, but not the associated object */
			delForeignState(id: string, options?: any, callback?: GenericCallback): void;

			getHistory(id: string, options: GetHistoryOptions, callback: GetHistoryCallback): void;

			// ==============================
			// enums

			/** Returns the enum tree, filtered by the optional enum name */
			getEnum(callback: GetEnumCallback): void;
			getEnum(name: string, callback: GetEnumCallback): void;
			getEnum(name: string, options: any, callback: GetEnumCallback): void;
			getEnums(callback: GetEnumsCallback): void;
			getEnums(enumList: EnumList, callback: GetEnumsCallback): void;
			getEnums(enumList: EnumList, options: any, callback: GetEnumsCallback): void;

			addChannelToEnum(enumName: string, addTo: string, parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			deleteChannelFromEnum(enumName: string, parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			addStateToEnum(enumName: string, addTo: string, parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;

			deleteStateFromEnum(enumName: string, parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// subscriptions

			/** Subscribe to changes of objects in this instance */
			subscribeObjects(pattern: string, options?: any);
			/** Subscribe to changes of objects (which might not belong to this adapter) */
			subscribeForeignObjects(pattern: string, options?: any);
			/** Unsubscribe from changes of objects in this instance */
			unsubscribeObjects(pattern: string, options?: any);
			/** Unsubscribe from changes of objects (which might not belong to this adapter) */
			unsubscribeForeignObjects(pattern: string, options?: any);

			/** Subscribe to changes of states in this instance */
			subscribeStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/** Subscribe to changes of states (which might not belong to this adapter) */
			subscribeForeignStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/**
			 * Subscribe from changes of states in this instance
			 * @param pattern - Must match the pattern used to subscribe
			 */
			unsubscribeStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/**
			 * Subscribe from changes of states (which might not belong to this adapter)
			 * @param pattern - Must match the pattern used to subscribe
			 */
			unsubscribeForeignStates(pattern: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// devices and channels

			/** creates an object with type device */
			createDevice(deviceName: string, common?: any, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a device, its channels and states */
			deleteDevice(deviceName: string, options?: any, callback?: GenericCallback): void;
			/** gets the devices of this instance */

			/** creates an object with type channel */
			createChannel(parentDevice: string, channelName: string, roleOrCommon?: string | object, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a channel and its states */
			deleteChannel(channelName: string, options?: any, callback?: GenericCallback): void;
			deleteChannel(parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			/** creates a state and the corresponding object */
			createState(parentDevice: string, parentChannel: string, stateName: string, roleOrCommon?: string | object, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a state */
			deleteState(stateName: string, options?: any, callback?: GenericCallback): void;
			deleteState(parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;
			deleteState(parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;


			// ==============================
			// filesystem

			/**
			 * reads the content of directory from DB for given adapter and path
			 * @param adapter - adapter name. If adapter name is null, default will be the name of the current adapter.
			 * @param path - path to direcory without adapter name. E.g. If you want to read "/vis.0/main/views.json", here must be "/main/views.json" and _adapter must be equal to "vis.0".
			 */
			readDir(adapterName: string, path: string, callback: ReadDirCallback): void;
			readDir(adapterName: string, path: string, options: any, callback: ReadDirCallback): void;
			mkDir(adapterName: string, path: string, callback: GenericCallback): void;
			mkDir(adapterName: string, path: string, options: any, callback: GenericCallback): void;

			readFile(adapterName: string, path: string, callback: ReadFileCallback): void;
			readFile(adapterName: string, path: string, options: any, callback: ReadFileCallback): void;
			writeFile(adapterName: string, path: string, data: Buffer | string, callback: GenericCallback): void;
			writeFile(adapterName: string, path: string, data: Buffer | string, options: any, callback: GenericCallback): void; // options see https://github.com/ioBroker/ioBroker.js-controller/blob/master/lib/objects/objectsInMemServer.js#L599

			delFile(adapterName: string, path: string, callback: GenericCallback): void;
			delFile(adapterName: string, path: string, options: any, callback: GenericCallback): void;
			unlink(adapterName: string, path: string, callback: GenericCallback): void;
			unlink(adapterName: string, path: string, options: any, callback: GenericCallback): void;

			rename(adapterName: string, oldName: string, newName: string, callback: GenericCallback): void;
			rename(adapterName: string, oldName: string, newName: string, options: any, callback: GenericCallback): void;


			// ==============================
			// formatting

			formatValue(value: number | string, format: any);
			formatValue(value: number | string, decimals: number, format: any);
			formatDate(dateObj: string | Date | number, format: string);
			formatDate(dateObj: string | Date | number, isDuration: boolean | string, format: string);
		}

		type ObjectChangeHandler = (id: string, obj: Object) => void;
		type StateChangeHandler = (id: string, obj: State) => void;

		type SetObjectCallback = (err: string, obj: { id: string }) => void;
		type GetObjectCallback = (err: string, obj: Object) => void;
		type GenericCallback = (err?: string) => void;
		type GetEnumCallback = (err: string, enums: { [name: string]: Enum }, requestedEnum: string) => void;
		type GetEnumsCallback = (
			err: string,
			result: {
				[groupName: string]: {
					[name: string]: Enum
				}
			}
		) => void;
		type GetObjectsCallback = (err: string, objects: { [id: string]: Object }) => void;
		type FindObjectCallback = (err: string, id?: string, name?: string) => void;

		type GetStateCallback = (err: string, state: State) => void;
		type GetStatesCallback = (err: string, states: { [id: string]: State }) => void;
		type SetStateCallback = (err: string, id: string) => void;
		type SetStateChangedCallback = (err: string, id: string, notChanged: boolean) => void;
		type DeleteStateCallback = (err: string, id?: string) => void;
		type GetHistoryCallback = (err: string, result: (State & { id?: string })[], step: number, sessionId?: string) => void;


		type ReadDirCallback = (err: string, entries: DirectoryEntry[]) => void;
		type ReadFileCallback = (err: string, file?: Buffer | string, mimeType?: string) => void;
	}
}