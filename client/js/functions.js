// config.js
const $_ENV = {};
function loadEnv() {
	return new Promise((resolve, reject) => {
		fetch(".env").then((res) => res.text()).then((text) => {
			// By lines
			var lines = text.split(/\r\n|\n/);
			for (var i = 0; i < lines.length; i++) {
				var splitted = lines[i].split('=');
				const [key, value] = splitted;
				// Create an array to store multiple key-value pairs
				if(typeof value !== 'undefined') {
					$_ENV[key] = value.replace(/['"]+/g, '');
				}
			}
			resolve();
		}).catch((e) => reject(e));
	});
}