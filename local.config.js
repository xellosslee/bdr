module.exports = {
	apps: [
		{
			namespace: 'bdr',
			name: 'bdr-server',
			script: 'server.mjs',
			cwd: './',
			autorestart: false,
			watch: ['server.mjs', 'models', 'mysql.mjs'],
		},
	],
}
