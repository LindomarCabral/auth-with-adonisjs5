import Database from '@ioc:Adonis/Lucid/Database'
import { assert } from '@japa/preset-adonis'
import { Group, test, TestContext } from '@japa/runner'
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
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.include(response.body().message, 'email')
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 409)
  })

  test('it should return 409 when username is already in use', async ({ client, assert }) => {
    const { username } = await UserFactory.create()
    const userPayload = {
      email: 'teste@teste.com',
      username,
      password: 'teste',
    }
    const response = await client.post('/users').json(userPayload)
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.include(response.body().message, 'username')
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 409)
  })

  test('it should return 422 when require data is not provided', async ({ client, assert }) => {
    const response = await client.post('/users').json({})
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid email', async ({ client, assert }) => {
    const response = await client.post('/users').json({
      email: 'teste@',
      password: 'teste',
      username: 'teste',
    })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid password', async ({ client, assert }) => {
    const response = await client.post('/users').json({
      email: 'teste@test.com',
      password: 'tes',
      username: 'teste',
    })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })
})
