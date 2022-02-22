import Pusher from 'pusher-js'
import axios from 'axios'
import { useState, useEffect } from 'react'

export default function Chat({ username }) {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_key, {
    cluster: 'us2',
    authEndpoint: 'api/pusher/auth',
    auth: { params: { username } },
  })

  const [chats, setChats] = useState([])
  const [message, setMessage] = useState('')
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)
  const [onlineUsers, setUsersOnline] = useState([])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      const channel = pusher.subscribe('presence-channel')

      // when user subscribes to channel

      channel.bind('pusher:subscription_succeeded', (members) => {
        setOnlineUsersCount(members.count)
      })

      // when a new member joins the chat
      channel.bind('pusher:member_added', (member) => {
        setOnlineUsersCount(channel.members.count)

        setOnlineUsersCount((prevState) => [
          ...prevState,
          { username: member.info.username },
        ])
      })

      channel.bind('chat-update', (data) => {
        const { message, username } = data

        setChats((prevState) => [...prevState, { username, message }])
      })
    }
    return () => {
      pusher.unsubscribe('presence-channel')
      mounted = false
    }
  }, [])

  const handleSubmit = async () => {
    await axios.post('/api/pusher', {
      message,
      username,
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="text-purple-500">
        There are {onlineUsersCount} users online!
      </div>
      {chats.map((chat, id) => {
        return (
          <div key={id}>
            {chat.message}{' '}
            <span className="text-purple-500">from {chat.username}</span>
          </div>
        )
      })}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="enter a message"
          className="borderr-2 rounded-md border-gray-500 py-2 px-2"
        />
      </form>
    </div>
  )
}
