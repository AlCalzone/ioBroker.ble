import * as React from "react";
import * as ReactDOM from "react-dom";

import { Tabs } from "iobroker-react-components";

import { OnSettingsChangedCallback, Settings } from "./pages/settings";

// const namespace = `ble.${instance}`;

// layout components
interface RootProps {
	settings: ioBroker.AdapterConfig;
	onSettingsChanged: OnSettingsChangedCallback;
}
// interface RootState {
// }

// TODO: Remove `any`
export class Root extends React.Component<RootProps /*, RootState*/ > {

	constructor(props: RootProps) {
		super(props);
		this.state = {};
	}

	// public componentDidMount() { }

	public render() {
		return (
			<Tabs labels={["Settings"]}>
				<Settings settings={this.props.settings} onChange={this.props.onSettingsChanged} />
				<></>
			</Tabs>
		);
	}

}

let curSettings: ioBroker.AdapterConfig;
let originalSettings: ioBroker.AdapterConfig;

/**
 * Checks if any setting was changed
 */
function hasChanges(): boolean {
	if (Object.keys(originalSettings).length !== Object.keys(curSettings).length) return true;
	for (const key of Object.keys(originalSettings) as (keyof ioBroker.AdapterConfig)[]) {
		if (originalSettings[key] !== curSettings[key]) return true;
	}
	return false;
}

// the function loadSettings has to exist ...
(window as any).load = (settings, onChange) => {

	originalSettings = settings;

	const settingsChanged: OnSettingsChangedCallback = (newSettings) => {
		curSettings = newSettings;
		onChange(hasChanges());
	};

	ReactDOM.render(
		<Root settings={settings} onSettingsChanged={settingsChanged} />,
		document.getElementById("adapter-container") || document.getElementsByClassName("adapter-container")[0],
	);

	// Signal to admin, that no changes yet
	onChange(false);
};

// ... and the function save has to exist.
// you have to make sure the callback is called with the settings object as first param!
(window as any).save = (callback) => {
	// save the settings
	callback(curSettings);
	originalSettings = curSettings;
};
