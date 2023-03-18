import * as dotenv from 'dotenv'
dotenv.config()
import test from 'ava'
import postgres from 'postgres'

// Connect to PostgreSQL
const databaseUrl = process.env.DATABASE_URL
const sql = postgres(databaseUrl)

test('postgresql database connection', async (t) => {
	const rows = await sql`select current_date`
	const date = rows[0].current_date
	t.truthy(date)
})

test('basic query works', async (t) => {
	const rows = await sql`select id, name from channels`
	t.truthy(rows.length)
})
