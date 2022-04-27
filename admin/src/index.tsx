import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { SettingsApp } from "iobroker-react/app";
import {
	useGlobals,
	useI18n,
	useIoBrokerState,
	useSettings,
} from "iobroker-react/hooks";
import type { Translations } from "iobroker-react/i18n";
import React from "react";
import ReactDOM from "react-dom";

const useStyles = makeStyles((_theme: Theme) =>
	createStyles({
		root: {
			// display: "flex",
			// flexGrow: 1,
			// flexFlow: "column nowrap",
			// gap: theme.spacing(8),
		},
	}),
);

const SettingsPageContent: React.FC = React.memo(() => {
	// settings is the current settings object, including the changes made in the UI
	// originalSettings is the original settings object, as it was loaded from ioBroker
	// setSettings is used to update the current settings object
	const { settings, setSettings } = useSettings<ioBroker.AdapterConfig>();
	const { translate: _ } = useI18n();

	const { namespace } = useGlobals();
	const [allowNewDevices, , setAllowNewDevices] = useIoBrokerState({
		id: `${namespace}.options.allowNewDevices`,
		defaultValue: false,
	});

	const classes = useStyles();

	// Updates the settings when the checkbox changes. The changes are not saved yet.
	const handleChange = <T extends keyof ioBroker.AdapterConfig>(
		option: T,
		value: ioBroker.AdapterConfig[T],
	) => {
		setSettings((s) => ({
			...s,
			[option]: value,
		}));
	};

	return (
		<div className={classes.root}>
			<Grid container spacing={8}>
				<Grid item xs={4}>
					<TextField
						label={_("Select device:")}
						inputProps={{
							type: "number",
							min: 0,
						}}
						fullWidth={true}
						InputLabelProps={{
							// Avoid overlapping the text if it was filled out
							shrink: settings.hciDevice != undefined,
						}}
						value={settings.hciDevice}
						onChange={(event) =>
							handleChange(
								"hciDevice",
								parseInt(event.target.value),
							)
						}
					/>
					<Typography variant="body2">
						{_("On linux this can be determined with `hciconfig`:")}
						&nbsp;hci<b>&lt;X&gt;</b>
					</Typography>
				</Grid>

				<Grid item xs={4}>
					<TextField
						label={_("RSSI update interval [ms]:")}
						inputProps={{
							type: "number",
							min: 0,
							max: 10000,
						}}
						fullWidth={true}
						InputLabelProps={{
							// Avoid overlapping the text if it was filled out
							shrink: settings.rssiThrottle != undefined,
						}}
						value={settings.rssiThrottle}
						onChange={(event) =>
							handleChange(
								"rssiThrottle",
								parseInt(event.target.value),
							)
						}
					/>
					<Typography variant="body2">
						{_("Too frequent updates can slow down the admin.")}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<TextField
						label={_("Monitored services, * for all services:")}
						multiline={true}
						minRows={3}
						variant="outlined"
						fullWidth={true}
						value={settings.services}
						onChange={(event) =>
							handleChange("services", event.target.value)
						}
					/>
					<Typography variant="body2">
						{_(
							"Service characteristics as HEX codes or UUID, comma separated.",
						)}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<TextField
						label={_("Active plugins:")}
						multiline={true}
						minRows={3}
						variant="outlined"
						fullWidth={true}
						value={settings.plugins}
						onChange={(event) =>
							handleChange("plugins", event.target.value)
						}
					/>
					<Typography variant="body2">
						{_("Plugin names, comma separated.")}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<FormControlLabel
						label={_(
							"Allow creation of devices without advertised data",
						)}
						control={
							<Checkbox
								checked={settings.allowEmptyDevices}
								onChange={(event, checked) =>
									handleChange("allowEmptyDevices", checked)
								}
							/>
						}
					/>
				</Grid>

				<Grid item xs={6}>
					<FormControlLabel
						label={_("Accept new devices")}
						control={
							<Checkbox
								checked={allowNewDevices}
								onChange={(event, checked) =>
									setAllowNewDevices(checked)
								}
							/>
						}
					/>
					<Typography variant="body2">
						{_(
							"This will be automatically disabled after 5 minutes.",
						)}
					</Typography>
				</Grid>
			</Grid>
		</div>
	);
});

// Load your translations
const translations: Translations = {
	en: require("./i18n/en.json"),
	de: require("./i18n/de.json"),
	ru: require("./i18n/ru.json"),
	pt: require("./i18n/pt.json"),
	nl: require("./i18n/nl.json"),
	fr: require("./i18n/fr.json"),
	it: require("./i18n/it.json"),
	es: require("./i18n/es.json"),
	pl: require("./i18n/pl.json"),
	"zh-cn": require("./i18n/zh-cn.json"),
};

const Root: React.FC = () => {
	return (
		<SettingsApp name="ble" translations={translations}>
			<SettingsPageContent />
		</SettingsApp>
	);
};

ReactDOM.render(<Root />, document.getElementById("root"));
