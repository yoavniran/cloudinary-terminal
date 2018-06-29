const cloudinary = require("cloudinary");

const config = (params) =>
	cloudinary.config({
		cloud_name: params.cloud,
		api_key: params.key,
		api_secret: params.secret,
	});

/**
 *  options - named, custom, raw
 */
const getImageUrl = (id, options) =>
	cloudinary.url(id, {
		transformation: options.named || null,
		raw_transformation: options.custom || options.raw || null
	});

const getUrlsForTag = (tag, options) =>
	cloudinary.api.resources_by_tag(tag)
		.then((response) => {
			return response.resources.map((res) =>
				getImageUrl(res.public_id, options));
		})
		.catch((ex) => {
			console.error(`Failed to retrieve resources for tag - ${tag}`, ex);
		});


module.exports = {
	config,
	getImageUrl,
	getUrlsForTag,
};

