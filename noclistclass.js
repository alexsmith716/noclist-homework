const path = require('path');
const crypto = require('crypto');
const httpRequest = require('./httpRequest');
const { SERVER_URL, PORT, ENDPOINT_AUTH, ENDPOINT_USERS, ENDPOINT_RETRIES } = require('./config');

//	'class' keyword in ES6 supports prototype-based inheritance, constructors, super calls, instance, and static methods

//	const response = {
//		body: '18207056982152612516\n' +
//			'7692335473348482352\n' +
//			'6944230214351225668\n' +
//			'4322836435026298260',
//		headers: {
//			date: 'Wed, 05 May 2021 17:15:27 GMT',
//			'content-length': '1307',
//			'content-type': 'text/plain; charset=utf-8',
//			connection: 'close'
//		}
//	}

//	const response = {
//		body: 'B29607BE4B3A4325773076AB7945BD51',
//		headers: {
//			'badsec-authentication-token': 'D073584B-0AE2-9A4E-CD4B-3415A6585B1A',
//			date: 'Wed, 05 May 2021 17:57:35 GMT',
//			'content-length': '32',
//			'content-type': 'text/plain; charset=utf-8',
//			connection: 'close'
//		}
//	}

class NoclistClass {

	// initialize the new object's properties
	constructor() {
		this.usersList = null;
		this.authenticationToken = null;
		//	console.log('>>>>>>>>>>> NoclistClass instance created <<<<<<<<<<<');
	}

	static authenticateRequest(token, usersPath) {
		return crypto.createHash('sha256').update(path.join(token, usersPath)).digest(`hex`);
	}

	// instance methods
	async httpRequestMethod(request, retry = 0) {
		if (retry > ENDPOINT_RETRIES) {
			// 3rd endpoint fail - exit node
			return process.exit(1);
		}
		try {
			const response = await request();
			return response;
		} catch (error) {
			console.error("HTTP Request Failure #" + (retry + 1) + ": " + error.message);
			return this.httpRequestMethod(request, retry + 1);
		}
	}

	async requestUsers(retry = 0) {
		if (retry > ENDPOINT_RETRIES) {
			return process.exit(1);
		}
		const response = await this.httpRequestMethod(() => {
			return httpRequest(SERVER_URL, PORT, ENDPOINT_USERS, {'X-Request-Checksum': this.constructor.authenticateRequest(this.authenticationToken, ENDPOINT_USERS)});
		});
		if ('body' in response && response.body !== null) {
			this.usersList = response.body.split('\n');
		} else {
			console.error("Request Users Failure #" + (retry + 1));
			return this.requestUsers(retry + 1);
		}
	}

	printUsersList() {
		console.log('BADSEC VIP users:');
		console.log(JSON.stringify(this.usersList));
	}

	async requestToken(retry = 0) {
		if (retry > ENDPOINT_RETRIES) {
			return process.exit(1);
		}
		const response = await this.httpRequestMethod(() => {
			return httpRequest(SERVER_URL, PORT, ENDPOINT_AUTH);
		});
		if ('headers' in response && response.headers['badsec-authentication-token'] !== null && response.headers['badsec-authentication-token'] !== '') {
			this.authenticationToken = response.headers['badsec-authentication-token'];
		} else {
			console.error("Request Token Failure #" + (retry + 1));
			return this.requestToken(retry + 1);
		}
	}
};

module.exports = {
	NoclistClass
};
