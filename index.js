const path = require("path"),
	parseArgs = require("command-line-args"),
	colors = require("colors/safe"),
	prompt = require("prompt"),
	configHelper = require("./config"),
	cld = require("./cld"),
	image = require("./image");

const C_ARGS = [
	{name: "config", alias: "c", type: Boolean, description: "Use to show configuration prompts"},
	{name: "publicId", alias: "p", type: Boolean, description: "Show image for public id"},
	{name: "ascify", alias: "a", type: Boolean, description: "Show images as ascii art"},
	{name: "tags", alias: "#", type: String, description: "Show images for tags"},
	{
		name: "transformation",
		alias: "t",
		type: String,
		description: "Show images using this custom transformation"
	},
	{
		name: "namedTransformation",
		alias: "n",
		type: String,
		description: "Show images with this named transformation"
	},
	{name: "help", alias: "?", type: Boolean, description: "Show this help screen"},
];

const showAsciiLogo = (cb) => {
	image.ascifyImage(path.resolve("cld-logo.png"), {
		size: {
			height: 20,
			width: 25,
		},
		dontShowError: true,
	}, cb)
};

const printHelp = () => {
	showAsciiLogo(() => {

		console.info("\n\nCLOUDINARY IMAGES TERMINAL\n");
		console.info(`You can use the following arguments: \n`);

		C_ARGS.forEach((arg) =>
			console.info(`  ${(arg.name + ":").padEnd(8)} --${arg.name} or -${arg.alias.padEnd(3)} \t- ${arg.description}`));

		console.info(`\nExample: yarn start -p "public_id" -t "w_200,h_200" -a`);
	});
};

const getImageOptions = (args) => ({
	named: args.namedTransformation || null,
	custom: !args.namedTransformation && args.transformation || null,
	raw: args._unknown && args._unknown[1],
});

const getImagesUrls = (args) => {
	const imgOptions = getImageOptions(args);

	let promise;

	if (args._unknown || args.publicId) {
		const publicId = args._unknown[0] || args.publicId;

		promise = Promise.resolve([
			cld.getImageUrl(publicId, imgOptions)
		]);
	}
	else if (args.tags) {
		promise = cld.getUrlsForTag(args.tags, imgOptions);
	}

	return promise;
};

const showUrls = (urls, args, start = 0, end = urls.length) => {
	end = Math.min(urls.length, end);

	for (let i = start; i < end; i++) {
		const url = urls[i];
		image.showImageForUrl(url, {ascify: args.ascify});
	}
};

const handleNumberPromptAnswer = (urls, args, answer) => {
	const numericAnswer = Number(answer);
	let isValid = true;

	if (!Number.isNaN(numericAnswer)) {
		showUrls(urls, args, (numericAnswer), numericAnswer + 1);
	}
	else {
		const rangeParts = answer.split("-");

		if (rangeParts.length === 2) {
			const numericStart = Number(rangeParts[0]),
				numericEnd = Number(rangeParts[1]);

			if (!Number.isNaN(numericStart) && !Number.isNaN(numericEnd)) {
				showUrls(urls, args, numericStart, (numericEnd+1));
			}
			else {
				isValid = false;
			}
		}
	}

	return isValid;
};

const showUrlsPrompt = (urls, args) => {
	prompt.message = "";
	prompt.start();

	prompt.get({
		properties: {
			answer: {
				description: colors.cyan(`There are ${urls.length} urls to show.\n
Enter 'l' to show the urls list.\n
Enter 'a' to show all.\n
Enter a number or a range (ex: 1-6) to show one or several (0 based)\n
Enter anything else to quit`),
				required: false,
			}
		}
	}, handleUrlsPromptAnswer.bind(null, urls, args));
};

const handleUrlsPromptAnswer = (urls, args, err, results) => {
	if (!err) {
		let showPrompt = true;

		switch (results.answer) {
			case "l":
				console.info();
				urls.forEach((url, i) => {
					console.info(`${i}) ${url}`);
				});
				break;
			case "a":
				showUrls(urls, args);
				showPrompt = false;
				break;
			default:
				showPrompt = results.answer ?
					!handleNumberPromptAnswer(urls, args, results.answer) :
					false;
		}

		if (showPrompt) {
			setTimeout(() => showUrlsPrompt(urls, args), 1);
		}
		else {
			prompt.stop();
		}
	}
	else {
		err.message === "canceled" ?
			console.log(colors.gray("\nbye")) :
			console.error("ERR!", err);
	}
};

const showImages = (config, args) => {
	configHelper.save(config);
	cld.config(config);

	getImagesUrls(args)
		.then((urls) => {
			if (urls.length > 1) {
				showUrlsPrompt(urls, args);
			}
			else {
				showUrls(urls, args);
			}
		})
		.catch((ex) => {
			console.error(ex);
		});
};

const start = () => {
	const args = parseArgs(C_ARGS, {partial: true});

	if (args.help) {
		printHelp();
	}
	else {
		const config = configHelper.load(),
			reconfig = args.config || !configHelper.isValid(config);

		if (reconfig) {
			configHelper.promptForConfig(config, (updatedConfig) => {
				if (updatedConfig) {
					showImages(updatedConfig, args);
				}
				else {
					process.exit(1);
				}
			});
		}
		else {
			showImages(config, args);
		}
	}
};

start();

