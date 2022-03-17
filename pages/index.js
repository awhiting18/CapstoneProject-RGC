import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import QRCode from '../assets/Controller_QRCode.svg'
import config from '../config.json'
import Pusher from 'pusher-js'

function Home({ Component, pageProps }) {
  /**********SETTING UP STATE***********/
  const [channelCode, setChannelCode] = useState(createChannelCode(5))
  const [message, setMessage] = useState('None')
  const router = useRouter()

  /*************FUNCTIONS***************/
  function createChannelCode(length) {
    let result = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  //This function will redirect the page to the game screen
  const redirect = () => {
    router.push({ pathname: '/game', query: { gameCode: channelCode } })
  }

  /********************Pusher Variables******************/
  let pusher
  let channel

  /**********On Screen Load Functions************/
  const onScreenLoad = () => {
    //Creating the pusher to listen in for the redirection signal
    pusher = new Pusher(config.key, {
      cluster: 'us2',
      authEndpoint: 'api/pusher/auth',
    })
    channel = pusher.subscribe('private-pong' + channelCode)
    channel.bind('client-controllerconnect', (message) => {
      if (message == 'Connected') {
        redirect()
      }
    })
  }

  useEffect(() => {
    onScreenLoad()
  }, [])

  /**********Display************/
  return (
    <div className="App">
      <div>
        <img source={QRCode} className="QRCode" height={'400'} width={'400'} />
      </div>
      <div>
        <text>Game Code: {channelCode}</text>
      </div>
    </div>
  )
}

export default Home
