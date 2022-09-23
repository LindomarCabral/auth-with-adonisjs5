import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('Sessions', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should authenticate an user', async ({ client, assert }) => {
    const plainPassword = 'test'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client.post('/sessions').json({ email, password: plainPassword })
    response.assertStatus(201)
    assert.isDefined(response.body().user, 'User undefined')
    assert.equal(response.body().user.id, id)
  })
})
