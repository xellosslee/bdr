module.exports = {
	apps: [
		{
			namespace: 'bdr',
			name: 'bdr-dev',
			script: 'server.js',
			cwd: './',
			autorestart: false,
			watch: ['server.js', 'models', 'mysql.js', 'crypto.js', 'craft_note.js'],
		},
		{
			namespace: 'bdr',
			name: 'bdr-prod',
			script: 'server.js',
			cwd: './',
			max_restarts: 5,
			env: {
				NODE_ENV: 'prod',
			},
			instances: 0,
			exec_mode: 'cluster',
			wait_ready: true,
			listen_timeout: 50000,
			kill_timeout: 5000,
		},
	],
}
