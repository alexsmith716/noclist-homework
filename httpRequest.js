const http = require('http');

// https://nodejs.org/api/http.html#http_http_request_url_options_callback

module.exports = async function httpRequest(hostname, port, path, headers) {

	return new Promise((resolve, reject) => {

		http.request({ hostname: hostname, port: port, path: path, headers: headers }, (res) => {

			const { statusCode } = res;
			// const statusCode = 404;

			let error;

			// any response code other than 200 should fail
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
			}

			if (error) {
				res.resume();
				reject(error);
			}

			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				resolve({
					body: data,
					headers: res.headers,
				});
			});

		}).on('error', (error) => {
			reject(error.message);
		}).end()
	});
};
