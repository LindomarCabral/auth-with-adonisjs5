import Database from '@ioc:Adonis/Lucid/Database'
import { Group, test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('Users user', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should create an user', async ({ client, assert }) => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: 'teste',
      avatar: 'https://images.com/image/1',
    }
    const response = await client.post('/users').json(userPayload)
    const { password, avatar, ...expected } = userPayload
    response.assertStatus(201)
    response.assertBodyContains({ user: expected })
    //assert.notEqual(response.body().user.password, userPayload.password)
    assert.notExists(response.body().user.password, 'Password defined')
  })

  test('it should return 409 when email is already in use', async ({ client, assert }) => {
    const { email } = await UserFactory.create()
    const userPayload = {
      email,
      username: 'teste',
      password: 'teste',
    }
    const response = await client.post('/users').json(userPayload)
    console.log(response.body())

    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.include(response.body().message, 'email')
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 409)
  })
})
