const fs = require("fs-extra"),
	colors = require("colors/safe"),
	prompt = require("prompt");

const fileName = "./.appconfig";

let loadedConfig = null;

const CONF_KEYS = ["cloud", "key", "secret"];

const load = () => {
	try {
		if (fs.existsSync(fileName)) {
			loadedConfig = fs.readJsonSync(fileName);
		}
	}
	catch (ex) {
		console.error("failed to read config file", ex);
	}

	return loadedConfig;
};

const isValid = (config) =>
	config && !CONF_KEYS.find((name)=>!config[name]);

const save = (config) => {
	fs.outputJSONSync(fileName, config);
};

const mergeConfig = (config, overrides) =>
	CONF_KEYS.reduce((res, name)=>{
		res[name] = overrides[name] || config[name];
		return res;
	}, {});

const promptForConfig = (config, cb) => {
	prompt.message = "";
	prompt.start({});

	config = config || {};

	prompt.get({
		properties: {
			cloud: {
				description:
					colors.cyan(`Your cloud name ${config.cloud ? `(${config.cloud})` : ""}`),
				message: colors.red("cloud name is required"),
				required: !config.key,
			},
			key: {
				description:
					colors.cyan(`Your cloud's api key ${config.key ? `(${config.key})` : ""}`),
				message: colors.red("key is required"),
				required: !config.key,
			},
			secret: {
				description:
					colors.cyan(`Your cloud's api secret ${config.secret ? `(${config.secret})` : ""}`),
				message: colors.red("secret is required"),
				required: !config.secret,
			},
		},
	}, (err, results) => {
		prompt.stop();

		if (err) {
			err.message === "canceled" ?
				console.log(colors.gray("\nbye")) :
				console.error("ERR!", err);
			cb();
		}
		else {
			cb(mergeConfig(config, results));
		}
	});
};

module.exports = {
	promptForConfig,
	isValid,
	load,
	save,
};