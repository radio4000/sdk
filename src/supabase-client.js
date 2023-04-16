function createClient() {
	let setClient

	const client = new Promise((resolve) => {
		setClient = resolve
	})

	return [client, setClient]
}

const [client, setClient] = createClient()

export {client, setClient}
