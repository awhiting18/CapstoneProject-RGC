import { pusher } from '../../../lib'

export default async function handler(req, res) {
  const { message, username } = req.body

  //Channel must be prefixed with prescence but the event can be called anything
  //Todo: change the event name
  await pusher.trigger('presence-channel', 'chat-update', {
    message,
    username,
  })

  res.json({ status: 200 })
}
