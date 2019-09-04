import * as React from "react";

import { Tooltip } from "iobroker-react-components";

export type OnSettingsChangedCallback = (newSettings: ioBroker.AdapterConfig) => void;

interface SettingsProps {
	onChange: OnSettingsChangedCallback;
	settings: ioBroker.AdapterConfig;
}

interface LabelProps {
	for: string;
	text: string;
	class?: string[];
	tooltip?: string;
}

/** Helper component for a settings label */
function Label(props: LabelProps) {
	const classNames: string[] = props.class || [];
	return (
		<label htmlFor={props.for} className={classNames.join(" ")}>
			{_(props.text)}
			{props.tooltip != null && <Tooltip text={props.tooltip} />}
		</label>
	);
}

interface CheckboxLabelProps {
	text: string;
	class?: string[];
	tooltip?: string;
}

/** Inner label for a Materializes CSS checkbox (span, no for property) */
function CheckboxLabel(props: CheckboxLabelProps) {
	const classNames: string[] = props.class || [];
	return (
		<span className={classNames.join(" ")}>
			{_(props.text)}
			{props.tooltip != null && <Tooltip text={props.tooltip} />}
		</span>
	);
}

export class Settings extends React.Component<SettingsProps, ioBroker.AdapterConfig> {

	constructor(props: SettingsProps) {
		super(props);
		// settings are our state
		this.state = {
			...props.settings,
		};

		// setup change handlers
		this.handleChange = this.handleChange.bind(this);
	}

	private chkAllowEmptyDevices: HTMLInputElement | null | undefined;

	private parseChangedSetting(target: HTMLInputElement | HTMLSelectElement): ioBroker.AdapterConfig[keyof ioBroker.AdapterConfig] {
		// Checkboxes in MaterializeCSS are messed up, so we attach our own handler
		// However that one gets called before the underlying checkbox is actually updated,
		// so we need to invert the checked value here
		return target.type === "checkbox" ? !(target as any).checked
			: target.type === "number" ? parseInt(target.value, 10)
				: target.value
			;
	}

	// gets called when the form elements are changed by the user
	private handleChange(event: React.FormEvent<HTMLElement>) {
		const target = event.target as (HTMLInputElement | HTMLSelectElement); // TODO: more types
		const value = this.parseChangedSetting(target);

		// store the setting
		this.putSetting(target.id as keyof ioBroker.AdapterConfig, value, () => {
			// and notify the admin UI about changes
			this.props.onChange(this.state);
		});

		return false;
	}

	/**
	 * Reads a setting from the state object and transforms the value into the correct format
	 * @param key The setting key to lookup
	 */
	private getSetting<
		TKey extends keyof ioBroker.AdapterConfig,
		TSetting extends ioBroker.AdapterConfig[TKey]= ioBroker.AdapterConfig[TKey],
		>(key: TKey, defaultValue?: TSetting): TSetting | undefined {
		const ret = this.state[key] as TSetting | undefined;
		return ret != undefined ? ret : defaultValue;
	}
	/**
	 * Saves a setting in the state object and transforms the value into the correct format
	 * @param key The setting key to store at
	 */
	private putSetting<
		TKey extends keyof ioBroker.AdapterConfig,
		TSetting extends ioBroker.AdapterConfig[TKey],
		>(key: TKey, value: TSetting, callback?: () => void): void {
		this.setState({ [key]: value } as unknown as Pick<ioBroker.AdapterConfig, TKey>, callback);
	}

	public componentWillUnmount() {
		if (this.chkAllowEmptyDevices != null) {
			$(this.chkAllowEmptyDevices).off("click", this.handleChange as any);
		}
	}

	public componentDidMount() {
		// update floating labels in materialize design
		M.updateTextFields();
		// Fix materialize checkboxes
		if (this.chkAllowEmptyDevices != null) {
			$(this.chkAllowEmptyDevices).on("click", this.handleChange as any);
		}
	}

	public render() {
		return (
			<>
				<div className="row">
					<div className="col s4 input-field">
						<Label for="hciDevice" text="Select device:" />
						<input className="value" type="number" id="hciDevice" min="0" value={this.getSetting("hciDevice")} onChange={this.handleChange} />
						<span>{_("On linux this can be determined with `hciconfig`:")}</span> <span>hci<b>&lt;X&gt;</b></span>
					</div>
					<div className="col s4 input-field">
						<Label for="rssiThrottle" text="RSSI update interval [ms]:" />
						<input className="value" type="number" id="rssiThrottle" min="0" max="10000" value={this.getSetting("rssiThrottle")} onChange={this.handleChange} />
						<span>{_("Too frequent updates can slow down the admin.")}</span>
					</div>
				</div>
				<div className="row">
					<div className="col s4 input-field">
						<label htmlFor="allowEmptyDevices">
							<input type="checkbox" className="value" id="allowEmptyDevices" defaultChecked={this.getSetting("allowEmptyDevices")}
								ref={me => this.chkAllowEmptyDevices = me}
							/>
							<CheckboxLabel text="Allow creation of devices without advertised data" />
						</label>
					</div>
				</div>
				<div className="row">
					&nbsp;
				</div>
				<div className="row">
					<div className="col s4 input-field">
						<Label for="services" text="Monitored services, * for all services:" />
						<textarea className="value" id="services" style={{ width: "100%", height: "3em" }} value={this.getSetting("services")} onChange={this.handleChange}></textarea><br />
						<span>{_("Service characteristics as HEX codes or UUID, comma separated")}</span>
					</div>
					<div className="col s4 input-field">
						<Label for="plugins" text="Active plugins:" />
						<textarea className="value" id="plugins" style={{ width: "100%", height: "3em" }} value={this.getSetting("plugins")} onChange={this.handleChange}></textarea><br />
						<span>{_("Plugin names, comma separated.")}</span>
					</div>
				</div>
			</>
		);
	}

}
