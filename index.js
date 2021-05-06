const { NoclistClass } = require('./noclistclass');


(async function() {

	const noclist = new NoclistClass();

	await noclist.requestToken();

	await noclist.requestUsers();

	noclist.printUsersList();

})();

process.on('uncaughtException', err => {
	console.log(`Uncaught Exception: ${err.message}`)
	process.exit(1)
});

process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled rejection at ', promise, `reason: ${err.message}`)
	process.exit(1)
});

process.on('beforeExit', code => {
	setTimeout(() => {
		console.log(`Process will exit with code: ${code}`)
		process.exit(code)
	}, 100)
});

process.on('exit', code => {
	console.log(`Process exited with code: ${code}`)
});
