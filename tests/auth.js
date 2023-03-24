import test from 'ava'
import sdk from '../src/index.js'

// If it's a fresh database, uncomment these lines.
// Then run the file, confirm the mail, comment out again.
// Otherwise the "valid" credentials won't be.
// sdk.auth.signUp(validCredentials)

function fakeEmail() {
	return `equal.note8933+${new Date().getTime()}@fastmail.com`
}

const invalidCredentials = {
	email: fakeEmail(),
	password: 'pass123',
}

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'pass123',
}

test.serial('can catch wrong auth credentials', async (t) => {
	const {error} = await sdk.auth.signIn(invalidCredentials)
	t.is(error.message, 'Invalid login credentials')
})

test.serial('can sign up for a new account and email confirmation is required', async (t) => {
	const {data, error} = await sdk.auth.signUp(invalidCredentials)
	if (error) t.fail(error.message)
	t.is(data.user.email, invalidCredentials.email)
	t.falsy(data.user.email_confirmed_at)
	t.is(data.user.role, 'authenticated')
	t.is(data.user.app_metadata.provider, 'email')
})

test.serial('but can not sign in', async (t) => {
	const {error: err} = await sdk.auth.signIn(invalidCredentials)
	t.is(err.message, 'Email not confirmed', 'email confirmation is required')
})

// test.serial('can not delete unconfirmed user user', async (t) => {
// 	await sdk.auth.signIn(invalidCredentials)
// 	const {data: user, error} = await sdk.users.readUser()
// 	console.log('deleting', user.email, error)
// 	const {data: data2, error: err} = await sdk.users.deleteUser()
// 	console.log(err)
// 	t.truthy(err)
// })

test.serial('can sign in', async (t) => {
	const {data, error} = await sdk.auth.signIn(validCredentials)
	if (error) {
		t.fail(error.message)
		return
	}
	t.is(data.user.email, validCredentials.email)
	t.is(data.session.user.email, validCredentials.email)
})

test.serial('can read current user', async (t) => {
	const {
		data: {user},
		error,
	} = await sdk.auth.signIn(validCredentials)
	if (error) {
		t.fail(error.message)
		return
	}
	t.is(user.email, validCredentials.email)

	// This doesn't work in the test environment. If you pass a jwt token, it does.
	// But why does our supabaseclient not know about our user?
	const {data, error: error2} = await sdk.users.readUser()
	// const { data, error } = await sdk.users.readUser(session.access_token)
	if (error2) t.fail(error2.message)
	t.is(data.email, validCredentials.email)
})

// test.serial('can delete our confirmed user', async (t) => {
// 	await sdk.auth.signIn(validCredentials)
// 	const {data: user, error} = await sdk.users.readUser()
// 	console.log('deleting', user.email, error)
// 	console.log(err)
// 	t.truthy(err)
// })
