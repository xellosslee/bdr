import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 7700,
		host: true,
		strictPort: true,
		// fs: {
		// 	allow: [searchForWorkspaceRoot(process.cwd()), '/static/items/'],
		// },
	},
})
