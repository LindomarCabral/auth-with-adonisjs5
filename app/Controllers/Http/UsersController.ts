import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUser)

    if (!userPayload.email || !userPayload.username || !userPayload.password)
      throw new BadRequest('provide require data', 422)

    const userByEmail = await User.findBy('email', userPayload.email)
    const userByUsername = await User.findBy('username', userPayload.username)

    if (userByEmail) throw new BadRequest('email already ins use', 409)
    if (userByUsername) throw new BadRequest('username already ins use', 409)

    const user = await User.create(userPayload)
    return response.created({ user })
  }

  public async update({ request, response }: HttpContextContract) {
    const { email, avatar, password } = await request.validate(UpdateUser)
    const id = request.param('id')
    const user = await User.findOrFail(id)

    user.email = email
    user.password = password
    if (avatar) user.avatar = avatar

    await user.save()

    return response.ok({ user })
  }
}
