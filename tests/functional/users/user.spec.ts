import Database from '@ioc:Adonis/Lucid/Database'
import { assert } from '@japa/preset-adonis'
import { test, TestContext } from '@japa/runner'
import { UserFactory } from 'Database/factories'
import Hash from '@ioc:Adonis/Core/Hash'

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

  test('it should update an user', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const email = 'test@test.com'
    const avatar = 'http://github.com/giuliana-bezerra.png'
    const response = await client
      .put(`/users/${user.id}`)
      .json({ email, avatar, password: user.password })
      .loginAs(user)
    response.assertStatus(200)
    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.email, email)
    assert.equal(response.body().user.avatar, avatar)
    assert.equal(response.body().user.id, user.id)
  })

  test('it shoul update the password of the user', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const password = 'test'
    const response = await client
      .put(`/users/${user.id}`)
      .json({ email: user.email, avatar: user.avatar, password })
      .loginAs(user)

    response.assertStatus(200)
    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.id, user.id)

    // o metodo abaixo atualiza o objeto a partir da atualização que foi enviada
    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('it should return 422 when required data is not provide', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client.put(`/users/${user.id}`).json({}).loginAs(user)

    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid email', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client
      .put(`/users/${user.id}`)
      .json({ password: user.password, avatar: user.avatar, email: 'test@' })
      .loginAs(user)
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })
  test('it should return 422 when providing an invalid password', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client
      .put(`/users/${user.id}`)
      .json({ email: user.email, avatar: user.avatar, password: 'tes' })
      .loginAs(user)
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })
  test('it should return 422 when providing an invalid avatar', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client
      .put(`/users/${user.id}`)
      .json({ email: user.email, password: user.password, avatar: 'test' })
      .loginAs(user)
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })
})
