import { test } from '@japa/runner'

test.group('Users user', () => {
  test('it should create an user', async ({ client) => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: 'teste',
      avatar: 'https://images.com/image/1',
    }
    const response = await client.post('/users').json(userPayload)

    // const { password, avatar, ...expected } = userPayload

    response.assertStatus(201)
  })
})
