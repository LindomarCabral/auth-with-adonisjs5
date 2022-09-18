import Database from '@ioc:Adonis/Lucid/Database'
import { Group, test } from '@japa/runner'

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
    console.log(response.body().user)

    response.assertStatus(201)
    response.assertBodyContains({ user: expected })
    //assert.notEqual(response.body().user.password, userPayload.password)
    assert.notExists(response.body().user.password, 'Password defined')
  })

  // test('it should create an user 2', async ({ client, assert }) => {
  //   const userPayload = {
  //     email: 'teste@teste.com',
  //     username: 'teste',
  //     password: 'teste',
  //     avatar: 'https://images.com/image/1',
  //   }
  //   const response = await client.post('/users').json(userPayload)

  //   const { password, avatar, ...expected } = userPayload

  //   response.assertStatus(201)
  //   response.assertBodyContains({ user: expected })
  //   assert.notExists(response.body().user.password, 'Password defined')
  // })
})
