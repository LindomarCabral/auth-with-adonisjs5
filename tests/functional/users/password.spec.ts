import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { assert } from '@japa/preset-adonis'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('Passwords', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should send and email with forgot password instructions', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const mailer = Mail.fake()

    await client.post('/forgot-password').json({ email: user.email, resetPasswordUrl: 'url' })

    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }))
    assert.isTrue(mailer.exists({ from: { address: 'no-replay@roleplay.com' } }))
    assert.isTrue(mailer.exists({ subject: 'Roleplay: Recuperação de Senha' }))
    assert.isTrue(mailer.exists((mail) => mail.html!.includes(user.username)))
    Mail.restore()
  })

  test('it should create a reset password token', async ({ assert, client }) => {
    const user = await UserFactory.create()

    await client.post('/forgot-password').json({ email: user.email, resetPasswordUrl: 'url' })

    const tokens = await user.related('tokens').query()
    assert.isNotEmpty(tokens)
  })

  test('it should return 422 when required data is not provided or data is invalid', async ({
    assert,
    client,
  }) => {
    const response = await client.post('/forgot-password').json({})

    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
  })

  test('it should be able to reset password', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const { token } = await user.related('tokens').create({ token: 'token' })

    const response = await client.post('/reset-password').json({ token, password: '123456' })

    response.assertStatus(204)
  })
})
