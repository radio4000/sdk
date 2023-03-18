import test from 'ava'
import sdk from '../src/index.js'

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'helloworld',
}

function fakeEmail() {
	return `equal.note9033+supabase-${new Date().getTime()}@fastmail.com`
}

test('can sign up for a new account and email confirmation is required', async (t) => {
	const email = fakeEmail()
	const { data, error } = await sdk.auth.signUp({
		email,
		password: email,
	})
	if (error) {
		console.log(error.message)
	}
	t.is(data.user.email, email, `created new user: ${email}`)
	t.is(data.user.role, 'authenticated')
	t.is(data.user.app_metadata.provider, 'email')
	// console.log('created test user', email)
	const { error: err } = await sdk.auth.signIn({
		email,
		password: email,
	})
	t.is(err.message, 'Email not confirmed', 'email confirmation is required')
})

test('wrong auth credentials can be identified', async (t) => {
	const { error } = await sdk.auth.signIn({
		email: fakeEmail(),
		password: 'notrealpassword',
	})
	t.is(error.message, 'Invalid login credentials')
})

test('can sign in ', async (t) => {
	const { data, error } = await sdk.auth.signIn(validCredentials)
	if (error) console.warn(error.message)
	t.is(data.user.email, validCredentials.email)
	t.is(data.session.user.email, validCredentials.email)
})

test('can read current user', async (t) => {
	const {
		data: { session, user },
	} = await sdk.auth.signIn(validCredentials)
	t.is(user.email, validCredentials.email)

	// This doesn't work in the test environment. If you pass a jwt token, it does.
	// But why does our supabaseclient not know about our user?
	const { data, error } = await sdk.users.readUser()
	// const { data, error } = await sdk.users.readUser(session.access_token)
	if (error) t.fail(error.message)
	t.is(data.email, validCredentials.email)
})
