import type { HttpContext } from '@adonisjs/core/http'
import { artifacts } from '#infrastructure/config/artifacts'
import { GetHomeData } from '#application/queries/get_home_data'

export default class PagesController {
  async home({ view }: HttpContext) {
    const homeData = await new GetHomeData().handle()
    return view.render('pages/home', homeData)
  }

  async artifact({ view }: HttpContext) {
    return view.render('pages/artifact', {
      artifacts,
      names: Object.keys(artifacts),
    })
  }
}
