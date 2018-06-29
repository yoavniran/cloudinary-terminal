const timg = require("terminal-image"),
	ascify = require("image-to-ascii"),
	got = require("got");

const ascifyImage = (file, options, cb) => {
	options = options || {};
	ascify(file, {
		...options,
	}, (err, converted) => {

		if (err){
			if (!options.dontShowError){
				console.log(err);
			}
		}
		else{
			console.log(converted);
		}

		if (cb) {
			cb();
		}
	});
};

const showImageForUrl = (url, options) => {

	console.log("About to retrieve image from: ", url);

	if (options.ascify) {
		ascifyImage(url);
	}
	else {
		got(url, {encoding: null})
			.then((response) => {

				timg.buffer(response.body)
					.then((img) => {
						console.log(img);
					});
			});
	}
};

module.exports = {
	showImageForUrl,
	ascifyImage,
};