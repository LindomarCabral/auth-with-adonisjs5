import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ForgotPassword from 'App/Validators/ForgotPasswordValidator'
import { randomBytes } from 'crypto'
import { promisify } from 'util'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = await request.validate(ForgotPassword)
    const user = await User.findByOrFail('email', email)

    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')
    await user.related('tokens').updateOrCreate({ userId: user.id }, { token })

    const reserPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`

    await Mail.send((message) => {
      message
        .from('no-replay@roleplay.com')
        .to(email)
        .subject('Roleplay: Recuperação de Senha')
        .htmlView('email/forgotpassword', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl: reserPasswordUrlWithToken,
        })
    })
    return response.noContent()
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    return response.noContent()
  }
}
