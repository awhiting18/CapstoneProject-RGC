import Pusher from 'pusher'
import config from "../config.json"

export const pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret,
  cluster: config.cluster,
  useTLS: true,
})
