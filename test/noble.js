function tryCatchUnsupportedHardware(err) {
	if (
		/compatible USB Bluetooth/.test(err.message)
		|| /LIBUSB_ERROR_NOT_SUPPORTED/.test(err.message)
	) {
		return true;
	}
	return false;
}

process.env.NOBLE_HCI_DEVICE_ID = "0";
try {
	const noble = require("@abandonware/noble");
} catch (e) {
	if (!tryCatchUnsupportedHardware(e)) process.exit(1);
}
process.exit(0);
