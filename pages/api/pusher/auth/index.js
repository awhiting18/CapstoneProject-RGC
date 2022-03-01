import { pusher } from '../../../../lib'

export default async function handler(req, res) {
  const { socket_id, channel_name} = req.body

  const randomID = Math.random().toString(36).slice(2)

  const presenceData = {
    user_id: randomID,
  }

  try {
    const auth = pusher.authenticate(socket_id, channel_name, presenceData)
    res.send(auth)
  } catch (error) {
    console.error(error)
  }
}
