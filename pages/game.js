import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Pusher from 'pusher-js'
import config from '../config.json'
import React from 'react'
import Box, { BACKGROUND, PLAYER, BALL } from './components/box.js'

export default function Game() {
  /**********Router Variables************/
  const router = useRouter()
  const gameCode = router.query.gameCode

  /**********Pusher Variables************/
  let pusher
  let channel

  /**********Other Variables************/
  const [message, setMessage] = useState('None')

  /**********On Screen Load Functions************/
  useEffect(() => {
    onScreenLoad()
  }, [])
  const onScreenLoad = () => {
    //Creating the pusher to listen in for the redirection signal
    pusher = new Pusher(config.key, {
      cluster: 'us2',
      authEndpoint: 'api/pusher/auth',
    })
    channel = pusher.subscribe('private-pong' + gameCode)
    channel.bind('client-controllermovement', (move) => {
      console.log('message: ', move)
      keyInput(move)
      setMessage(move)
    })
    /* moving the ball */
    setInterval(() => {
      if (!pause) {
        bounceBall()
      }
    }, ballSpeed)
    /* moving the opponent */
    setInterval(() => {
      if (!pause) {
        moveOpponent()
      }
    }, opponentSpeed)

    document.title = 'ping-pong'
  }

  /* size */
  const ROW_SIZE = 10
  const COL_SIZE = 20

  /* paddle */
  const PADDLE_BOARD_SIZE = 3
  const PADDLE_EDGE_SPACE = 1

  /* buttons */
  const PLAYER_UP = 1 // up
  const PLAYER_DOWN = -1 // down
  const PAUSE = 0 // pause

  const inner = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'justify',
  }

  const outer = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'justify',
    marginTop: '9em',
    marginLeft: '25em',
    Text: '100px',
    padding: '10px',
  }
  const dividerStyle = {
    marginLeft: '50px',
    fontSize: '50px',
    color: 'white',
  }

  const score = {
    marginLeft: '100px',
    fontSize: '50px',
    color: 'white',
  }

  const style = {
    width: '250px',
    heigth: '250px',
    display: 'grid',
    gridTemplate: `repeat(${ROW_SIZE}, 1fr) / repeat(${COL_SIZE}, 1fr)`,
  }

  const InitialState = () => {
    return {
      /* board */
      player: paddle.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE),
      opponent: paddle.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1)),
      ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
      /* ball */
      ballSpeed: 100,
      deltaY: -COL_SIZE,
      deltaX: -1, // -1 means the ball is moving towards player 1 means towards opponent
      pause: true,
      /* for dumb Ai */
      opponentSpeed: 150,
      opponentDir: false,
      /* Score */
      playerScore: 0,
      opponentScore: 0,
    }
  }

  const paddle = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos)
  /***********Game State Variables*************/

  /* board */
  const [player, setPlayer] = useState(
    paddle.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE)
  )
  const [opponent, setopponent] = useState(
    paddle.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1))
  )
  const [ball, setBall] = useState(
    Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE
  )
  /* ball */
  const [ballSpeed, setBallSpeed] = useState(100)
  const [deltaX, setDeltaX] = useState(
    -1 // -1 means the ball is moving towards player 1 means towards opponent
  )
  const [deltaY, setDeltaY] = useState(-COL_SIZE)
  const [pause, setPause] = useState(true)

  /* for dumb Ai */
  const [opponentSpeed, setOpponentSpeed] = useState(150)
  const [opponentDir, setOpponentDir] = useState(false)
  /* Score */
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)

  /**********************GAME FUNCTIONS***********************/

  const resetGame = () => {
    setBall(Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE)
  }

  const moveBoard = (playerBoard, isUp) => {
    const playerEdge = isUp
      ? playerBoard[0]
      : playerBoard[PADDLE_BOARD_SIZE - 1]

    if (!touchingEdge(playerEdge)) {
      const deltaY = isUp ? -COL_SIZE : COL_SIZE
      /* if ball touches the edge */
      const newDir = (deltaY !== COL_SIZE) ^ isUp ? -deltaY : deltaY

      if (!touchingEdge(ball)) {
        switch (ball) {
          case playerEdge + deltaY - 1:
            setDeltaX(-1)
            setDeltaY(newDir)
            break
          case playerEdge:
            setDeltaY(newDir)
            break
          case playerEdge + deltaY + 1:
            setDeltaX(1)
            setDeltaY(newDir)
            break
        }
      }
      return playerBoard.map((x) => x + deltaY)
    }
    return false
  }

  const touchingEdge = (pos) =>
    (0 <= pos && pos < COL_SIZE) ||
    (COL_SIZE * (ROW_SIZE - 1) <= pos && pos < COL_SIZE * ROW_SIZE)

  const touchingPaddle = (pos) => {
    return (
      player.indexOf(pos) !== -1 ||
      opponent.indexOf(pos) !== -1 ||
      state[deltaX === -1 ? 'player' : 'opponent'].indexOf(pos + deltaX) !== -1
    )
  }

  const isScore = (pos) =>
    (deltaX === -1 && pos % COL_SIZE === 0) ||
    (deltaX === 1 && (pos + 1) % COL_SIZE === 0)

  const moveOpponent = () => {
    const movedPlayer = moveBoard(opponent, opponentDir)
    movedPlayer ? setopponent(movedPlayer) : setOpponentDir(!opponentDir)
  }

  const touchingPaddleEdge = (pos) =>
    player[0] === pos ||
    player[PADDLE_BOARD_SIZE - 1] === pos ||
    opponent[0] === pos ||
    opponent[PADDLE_BOARD_SIZE - 1] === pos

  const bounceBall = () => {
    const newState = ball + deltaY + deltaX
    if (touchingEdge(newState)) {
      setDeltaY(-deltaY)
    }

    if (touchingPaddleEdge(newState)) {
      setDeltaY(-deltaY)
    }

    if (touchingPaddle(newState)) {
      setDeltaX(-deltaX)
    }

    /* updating board */
    setBall(newState)

    /* checking if loss or won */
    if (isScore(newState)) {
      if (deltaX !== -1) {
        /* player won */

        setPlayerScore(playerScore + 1)
        setBall(newState)
      } else {
        /* opponent won */

        setPlayerScore(opponentScore + 1)
        setBall(newState)
      }
      setPause(true)
      resetGame()
    }
  }

  const keyInput = (keyCode) => {
    console.log(keyCode)
    switch (keyCode) {
      case PLAYER_UP:
      case PLAYER_DOWN:
        const movedPlayer = moveBoard(player, keyCode === PLAYER_UP)
        if (movedPlayer) {
          setPlayer(movedPlayer)
          setPause(false)
        }
        break
      case PAUSE:
        setPause(true)
        break
    }
  }

  const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
    let val = BACKGROUND
    if (player.indexOf(pos) !== -1 || opponent.indexOf(pos) !== -1) {
      val = PLAYER
    } else if (ball === pos) {
      val = BALL
    }
    return <Box key={pos} k={pos} name={val} />
  })
  const divider = [...Array(ROW_SIZE / 2 + 2)].map((_) => <div>{'|'}</div>)
  return (
    <div style={outer}>
      <h1>
        {' '}
        {'[space]'} {pause ? 'PLAY/pause' : 'play/PAUSE'}{' '}
      </h1>
      <div style={inner}>
        <div style={style}>{board}</div>
        <div style={score}>{playerScore}</div>
        <div style={dividerStyle}> {divider} </div>
        <div style={dividerStyle}>{opponentScore}</div>
      </div>
      <h3> {'press up and down to move'} </h3>
      <div className="App">{message}</div>
    </div>
  )
}
