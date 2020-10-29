declare let systemDictionary: Record<string, Record<string, string>>;

declare let load: (
	settings: ioBroker.AdapterConfig,
	onChange: (hasChanges: boolean) => void,
) => void;
declare let save: (
	callback: (settings: ioBroker.AdapterConfig) => void,
) => void;
declare const instance: number;
/** Translates text */
declare function _(text: string): string;
declare const socket: ioBrokerSocket;
declare function sendTo(
	instance: any | null,
	command: string,
	message: any,
	callback: (result: SendToResult) => void,
): void;

interface SendToResult {
	error?: string | Error;
	result?: any;
}

interface ioBrokerSocket {
	emit(command: "subscribeObjects", pattern: string): void;

	on(event: "objectChange", handler: ioBroker.ObjectChangeHandler): void;
	// TODO: other events
}
