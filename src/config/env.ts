const rawEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {}

const requiredVars = [
	'VITE_API_URL',
	'VITE_WS_URL',
	'VITE_UPLOAD_URL',
]

export function assertRequiredEnv(): void {
	const missing = requiredVars.filter((key) => !rawEnv[key] || String(rawEnv[key]).trim() === '')
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
	}
}

export const config = {
	apiBaseUrl: String(rawEnv.VITE_API_URL || ''),
	wsUrl: String(rawEnv.VITE_WS_URL || ''),
	uploadBaseUrl: String(rawEnv.VITE_UPLOAD_URL || ''),
}

export type AppConfig = typeof config


