import { test, expect } from 'vitest'
import {sdk} from './_sdk-test.js'

// If it's a fresh database, uncomment these lines.
// Then run the file, confirm the mail, comment out again.
// Otherwise the "valid" credentials won't be.
// sdk.auth.signUp(validCredentials)

function fakeEmail() {
	return `equal.note8933+${new Date().getTime()}@fastmail.com`
}

const invalidCredentials = {
	email: fakeEmail(),
	password: 'pass123'
}

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'pass123'
}

test.skip('can catch wrong auth credentials', async () => {
	const {error} = await sdk.auth.signIn(invalidCredentials)
	expect(error.message).toBe('Invalid login credentials')
})

test.skip('can sign up for a new account and email confirmation is required', async () => {
	const {data, error} = await sdk.auth.signUp(invalidCredentials)
	if (error) throw new Error(error.message)
	expect(data.user.email).toBe(invalidCredentials.email)
	expect(data.user.email_confirmed_at).toBeFalsy()
	expect(data.user.role).toBe('authenticated')
	expect(data.user.app_metadata.provider).toBe('email')
})

test.skip('but can not sign in', async () => {
	const {error: err} = await sdk.auth.signIn(invalidCredentials)
	expect(err.message).toBe('Email not confirmed')
})

// test.serial('can not delete unconfirmed user user', async (t) => {
// 	await sdk.auth.signIn(invalidCredentials)
// 	const {data: user, error} = await sdk.users.readUser()
// 	console.log('deleting', user.email, error)
// 	const {data: data2, error: err} = await sdk.users.deleteUser()
// 	console.log(err)
// 	t.truthy(err)
// })

test.skip('can sign in', async () => {
	const {data, error} = await sdk.auth.signIn(validCredentials)
	if (error) {
		throw new Error(error.message)
	}
	expect(data.user.email).toBe(validCredentials.email)
	expect(data.session.user.email).toBe(validCredentials.email)
})

test.skip('can read current user', async () => {
	const {
		data: {user},
		error
	} = await sdk.auth.signIn(validCredentials)
	if (error) {
		throw new Error(error.message)
	}
	expect(user.email).toBe(validCredentials.email)

	// This doesn't work in the test environment. If you pass a jwt token, it does.
	// But why does our supabaseclient not know about our user?
	const {data, error: error2} = await sdk.users.readUser()
	// const { data, error } = await sdk.users.readUser(session.access_token)
	if (error2) throw new Error(error2.message)
	expect(data.email).toBe(validCredentials.email)
})

// test.serial('can delete our confirmed user', async (t) => {
// 	await sdk.auth.signIn(validCredentials)
// 	const {data: user, error} = await sdk.users.readUser()
// 	console.log('deleting', user.email, error)
// 	console.log(err)
// 	t.truthy(err)
// })
