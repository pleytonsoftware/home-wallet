import axios, { type CreateAxiosDefaults } from 'axios'

import { environmentManager } from '@tanstack/react-query'

const baseConfigClient = () => {
	const isServer = environmentManager.isServer()
	const config: CreateAxiosDefaults = {
		baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
		withCredentials: !isServer,
	}

	return config
}
const configServerClient = async () => {
	const config = baseConfigClient()

	const { cookies } = await import('next/headers')
	const cookieStore = await cookies()
	const cookie = cookieStore.toString()

	config.headers = {
		Cookie: cookie,
	}

	return config
}

export const getAxiosClient = () => {
	return axios.create(baseConfigClient())
}

export const getAxiosServerClient = async () => {
	const config = await configServerClient()
	return axios.create(config)
}
