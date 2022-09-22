import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Sessions', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should authenticate an user', async ({ client, assert }) => {
    const response = await client.post('/sessions').json({})
    response.assertStatus(201)
  })
})
