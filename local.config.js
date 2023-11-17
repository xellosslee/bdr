module.exports = {
	apps: [
		{
			namespace: 'bdr',
			name: 'bdr-server',
			script: 'server.js',
			cwd: './',
			autorestart: false,
			watch: ['server.js', 'models', 'mysql.js'],
		},
	],
}
