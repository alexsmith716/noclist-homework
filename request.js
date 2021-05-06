const http = require('http');
const { URL, PORT } = require('./config');
const agent = new http.Agent();

// https://nodejs.org/api/http.html#http_class_http_agent

module.exports = async function request(path, headers) {

	return new Promise((resolve, reject) => {

		http.get({ host: URL, port: PORT, agent: agent, path: path, headers: headers }, (res) => {

			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on(`end`, () => {
				const statusCode = parseInt(res.statusCode);

				if (statusCode === 200) {
					resolve({
						body: data,
						headers: res.headers,
					});
				} else {
					reject(new Error("Server returned status code: " + statusCode));
				}
			});

		}).on(`error`, (err) => {
			reject(err.message);
		});

	});
};
