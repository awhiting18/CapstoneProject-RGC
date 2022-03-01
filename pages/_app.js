import '../styles/globals.css'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Pusher from 'pusher-js'
import config from '../config.json'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    router.push('/pong')
  }

  const pusher = new Pusher(config.key, {
    cluster: 'us2',
    authEndpoint: 'api/pusher/auth',
  })

  const [message, setMessage] = useState('None')
  const channel = pusher.subscribe('private-pong')
  channel.bind('client-controllermovement', (move) => {
    console.log('Movement Sent: ', move)
    setMessage(move)
  })
  return <div className="App">{message}</div>
}

export default MyApp
