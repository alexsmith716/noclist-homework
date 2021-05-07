const {expect} = require('chai');
const {describe, it} = require('mocha');
const nock = require('nock');
const sinon = require('sinon');
const { NoclistClass } = require('./noclistclass');
const httpRequest = require('./httpRequest');
const { SERVER_URL, PORT, ENDPOINT_AUTH, ENDPOINT_USERS, ENDPOINT_RETRIES } = require('./config');


describe('NoclistClass', () => {

	const { authenticateRequest } = NoclistClass;

	let stubs = sinon.createSandbox();

	beforeEach(() => {
		nock.cleanAll();
	});

	describe('Static Method authenticateRequest', () => {
		it('should return the sha256 hash of a token and usersPath without slash', () => {
			expect(authenticateRequest('12A63255-1388-AB5E-071C-FA35D27C4098', 'users')).to.equal('782fbde2c6619f69b4280e14c9ff09fa1a82506eb8d6f79e6843f97f0de3d43a');
		});

		it('should return the sha256 hash of a token and usersPath with slash', () => {
			expect(authenticateRequest('12A63255-1388-AB5E-071C-FA35D27C4098', '/users')).to.equal('782fbde2c6619f69b4280e14c9ff09fa1a82506eb8d6f79e6843f97f0de3d43a');
		});
	});

	describe('.httpRequestMethod', () => {
		const getMockedSuccessfulResponse = () => {
			return nock('http://192.168.99.100:8888')
				.get('/mock-retry')
				.reply(200);
		}

		const getMockedFailedResponse = () => {
			return nock('http://192.168.99.100:8888')
			.get('/mock-retry')
			.reply(500, 'server error');
		}

		it('should retry if receives failed response', async () => {
			const client = new NoclistClass();
			const makeRequest_spy = stubs.spy(client, 'httpRequestMethod');
			const mocked_failed_response = getMockedFailedResponse();
			const mocked_success_response = getMockedSuccessfulResponse();
			await client.httpRequestMethod(() => {
				return httpRequest('192.168.99.100', '8888', '/mock-retry');
			});
			expect(mocked_failed_response.isDone()).to.be.true;
			expect(mocked_success_response.isDone()).to.be.true;
			expect(makeRequest_spy.callCount).to.equal(2);
		});

		it('should exit the process after the 3rd try with a failed response', async () => {
			const client = new NoclistClass();
			const makeRequest_spy = stubs.spy(client, 'httpRequestMethod');
			const exit_stub = stubs.stub(process, 'exit');
			const mocked_failed_response = getMockedFailedResponse();
			const mocked_failed_response_2 = getMockedFailedResponse();
			const mocked_failed_response_3 = getMockedFailedResponse();
			await client.httpRequestMethod(() => {
				return httpRequest('192.168.99.100', '8888', '/mock-retry');
			});
			expect(mocked_failed_response.isDone()).to.be.true;
			expect(mocked_failed_response_2.isDone()).to.be.true;
			expect(mocked_failed_response_3.isDone()).to.be.true;
			expect(makeRequest_spy.callCount).to.equal(4);
			expect(exit_stub.calledOnce).to.be.true;
		});
	});

	describe('.requestToken', () => {
		it('should call the proper endpoint and set the auth token', async () => {
			const client = new NoclistClass();
			const fake_auth_token = 'fake_auth_token';
			const mocked_response = nock('http://192.168.99.100:8888')
				.get('/auth')
				.reply(200, 'random string', {
					'badsec-authentication-token': fake_auth_token
				});
			await client.requestToken();
			expect(client.authenticationToken).to.equal(fake_auth_token);
			expect(mocked_response.isDone()).to.be.true;
		});
	});

	describe('requestUsers', () => {
		it('sets the checksum header on request and returns array of users', async () => {
			const client = new NoclistClass();
			client.authenticationToken = '12A63255-1388-AB5E-071C-FA35D27C4098';
			const mocked_response = nock('http://192.168.99.100:8888', {
				reqHeaders: {
					'X-Request-Checksum': '782fbde2c6619f69b4280e14c9ff09fa1a82506eb8d6f79e6843f97f0de3d43a'
				}
			}).get('/users')
			.reply(200, '18207056982152612516\n7692335473348482352')
			const users = await client.requestUsers();
			expect(client.usersList).to.deep.equal(['18207056982152612516', '7692335473348482352']);
		});
	});

});
