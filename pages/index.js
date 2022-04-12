import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import config from '../config.json'
import Pusher from 'pusher-js'
import { useQRCode } from 'next-qrcode'

/**
 * Description: The Home page for the game project.
 * @author Travis Wisecup
 * @author Jean Paulsen
 * @author AJ Whiting
 * Note: Use with Remote Game Control Controller project
 */
function Home({ Component, pageProps }) {
  /**********SETTING UP STATE***********/
  const [channelCode, setChannelCode] = useState(createChannelCode(5))
  const [message, setMessage] = useState('None')
  const router = useRouter()
  const { Canvas } = useQRCode()

  /*************FUNCTIONS***************/

  /**
   * @description: This function creates a randamized alphanumeric string
   * that is specified by the parameter length.
   *
   * @param {int} length : the length of the random string to be returned
   * @returns a randomized alphanumeric string of the desired length
   * @function createChannelCode
   */
  function createChannelCode(length) {
    let result = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  /**
   * This function will redirect the page to the game screen
   * @function redirect
   * */
  const redirect = () => {
    router.push({ pathname: '/game', query: { gameCode: channelCode } })
  }

  /********************Pusher Variables******************/
  let pusher
  let channel

  /**********On Screen Load Functions************/
  /**
   * @description: This function is called when the screen loads. It connects
   * to the pusher instance as well as sets up the pusher channel. Finally, it binds
   * functions that are needed to redirect the page when the controller connects.
   * @function onScreenLoad
   */
  const onScreenLoad = () => {
    //We first try to grab the pusher instance if it is already in memory.
    //This way we do not get extra connections.
    pusher = Pusher.instances[0]

    //If the pusher instance doesn't exist we make one.
    if (pusher == undefined) {
      pusher = new Pusher(config.key, {
        cluster: 'us2',
        authEndpoint: 'api/pusher/auth',
      })
    }
    //Now we connect to the channel and set up the function bindings.
    channel = pusher.subscribe('private-pong' + channelCode)
    channel.bind('client-controllerconnect', (message) => {
      if (message == 'Connected') {
        channel.trigger('client-controllerconnectresponse', 'Recieved')
        redirect()
      } else {
        channel.trigger('client-controllerconnectresponse', 'Error')
      }
    })
  }

  useEffect(() => {
    onScreenLoad()
  }, [])

  /**********Display************/
  /**
   * Description: The return function for what to render on the screen
   */
  return (
    <div className="z-0 flex min-h-screen flex-col items-center justify-center bg-black py-2">
      <video autoPlay muted loop id="myVideo">
        <source src="/PongRecording2.mp4" type="video/mp4" />
      </video>

      <div className="z-10 flex flex-col items-center justify-center rounded-md bg-white py-8 px-8">
        <div>
          <text className="font-bold">SCAN TO PLAY!</text>
        </div>
        <div>
          <Canvas
            text={'https://objective-golick-b7cb36.netlify.app/'}
            options={{
              type: 'image/jpeg',
              quality: 0.3,
              level: 'M',
              margin: 3,
              scale: 4,
              width: 200,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            }}
          />
        </div>
        <div>
          <text className="font-bold">GAME CODE: {channelCode}</text>
        </div>
      </div>
    </div>
  )
}

export default Home
