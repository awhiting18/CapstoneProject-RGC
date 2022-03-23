import React from 'react'
import Box, { BACKGROUND, PLAYER, BALL } from './components/box.js'
import Pusher from 'pusher-js'
import config from '../config.json'
import { withRouter } from 'next/router'

/* size */
const ROW_SIZE = 10
const COL_SIZE = 20

/* paddle */
const PADDLE_BOARD_SIZE = 3
const PADDLE_EDGE_SPACE = 1

/* buttons */
const PLAYER_UP = 1 // up arrow
const PLAYER_DOWN = -1 // down arrow
const PAUSE = 0 // space

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
  marginLeft: '440px',
  fontSize: '50px',
  textAlign: 'right',
  color: 'white',
}

const style = {
  width: '0px',
  heigth: '500px',
  display: 'grid',
  gridTemplate: `repeat(${ROW_SIZE}, 0fr) / repeat(${COL_SIZE}, 0fr)`,
}

const InitialState = () => {
  const paddle = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos)
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

export default withRouter(
  class GameVersion2 extends React.Component {
    constructor(props) {
      super(props)
      this.state = InitialState()
      let pusher
      let channel
      let gameCode
    }

    resetGame = () =>
      this.setState({
        ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
      })

    moveBoard = (playerBoard, isUp) => {
      const playerEdge = isUp
        ? playerBoard[0]
        : playerBoard[PADDLE_BOARD_SIZE - 1]

      if (!this.touchingEdge(playerEdge)) {
        const deltaY = isUp ? -COL_SIZE : COL_SIZE
        /* if ball touches the edge */
        const newDir =
          (this.state.deltaY !== COL_SIZE) ^ isUp
            ? -this.state.deltaY
            : this.state.deltaY

        if (!this.touchingEdge(this.state.ball)) {
          switch (this.state.ball) {
            case playerEdge + deltaY - 1:
              this.setState({
                deltaY: newDir,
                deltaX: -1,
              })
              break
            case playerEdge:
              this.setState({
                deltaY: newDir,
              })
              break
            case playerEdge + deltaY + 1:
              this.setState({
                deltaY: newDir,
                deltaX: 1,
              })
              break
          }
        }
        return playerBoard.map((x) => x + deltaY)
      }
      return false
    }

    componentDidMount() {
      this.pusher = new Pusher(config.key, {
        cluster: 'us2',
        authEndpoint: 'api/pusher/auth',
      })
      this.gameCode = this.props.router.query.gameCode
      this.channel = this.pusher.subscribe('private-pong' + this.gameCode)
      this.channel.bind('client-controllermovement', (move) => {
        console.log('Movement Sent: ', move)
        this.handleInput(move)
      })
      /* moving the ball */
      setInterval(() => {
        if (!this.state.pause) {
          this.bounceBall()
        }
      }, this.state.ballSpeed)
      /* moving the opponent */
      setInterval(() => {
        if (!this.state.pause) {
          this.moveOpponent()
        }
      }, this.state.opponentSpeed)

      document.title = 'ping-pong'
      console.log(this.channel)
    }

    touchingEdge = (pos) =>
      (0 <= pos && pos < COL_SIZE) ||
      (COL_SIZE * (ROW_SIZE - 1) <= pos && pos < COL_SIZE * ROW_SIZE)

    touchingPaddle = (pos) => {
      return (
        this.state.player.indexOf(pos) !== -1 ||
        this.state.opponent.indexOf(pos) !== -1 ||
        this.state[this.state.deltaX === -1 ? 'player' : 'opponent'].indexOf(
          pos + this.state.deltaX
        ) !== -1
      )
    }

    isScore = (pos) =>
      (this.state.deltaX === -1 && pos % COL_SIZE === 0) ||
      (this.state.deltaX === 1 && (pos + 1) % COL_SIZE === 0)

    moveOpponent = () => {
      const movedPlayer = this.moveBoard(
        this.state.opponent,
        this.state.opponentDir
      )
      movedPlayer
        ? this.setState({ opponent: movedPlayer })
        : this.setState({ opponentDir: !this.state.opponentDir })
    }

    touchingPaddleEdge = (pos) =>
      this.state.player[0] === pos ||
      this.state.player[PADDLE_BOARD_SIZE - 1] === pos ||
      this.state.opponent[0] === pos ||
      this.state.opponent[PADDLE_BOARD_SIZE - 1] === pos

    bounceBall = () => {
      const newState = this.state.ball + this.state.deltaY + this.state.deltaX
      if (this.touchingEdge(newState)) {
        this.setState({ deltaY: -this.state.deltaY })
      }

      if (this.touchingPaddleEdge(newState)) {
        this.setState({ deltaY: -this.state.deltaY })
      }

      if (this.touchingPaddle(newState)) {
        this.setState({ deltaX: -this.state.deltaX })
      }

      /* updating board */
      this.setState({ ball: newState })

      /* checking if loss or won */
      if (this.isScore(newState)) {
        if (this.state.deltaX !== -1) {
          /* player won */
          this.setState({
            playerScore: this.state.playerScore + 1,
            ball: newState,
          })
        } else {
          /* opponent won */
          this.setState({
            opponentScore: this.state.opponentScore + 1,
            ball: newState,
          })
        }
        this.setState({ pause: true })
        this.resetGame()
      }
    }

    handleInput = (keyCode) => {
      console.log('keycode ', keyCode)
      switch (keyCode) {
        case PLAYER_UP:
          console.log('Player UP')
        case PLAYER_DOWN:
          const movedPlayer = this.moveBoard(
            this.state.player,
            keyCode === PLAYER_UP
          )
          if (movedPlayer) {
            this.setState({ player: movedPlayer, pause: false })
          }
          console.log('Player DOWN')
          break
        case PAUSE:
          this.setState({ pause: true })
          console.log('Pause')
          break
      }
    }

    render() {
      const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
        let val = BACKGROUND
        if (
          this.state.player.indexOf(pos) !== -1 ||
          this.state.opponent.indexOf(pos) !== -1
        ) {
          val = PLAYER
        } else if (this.state.ball === pos) {
          val = BALL
        }
        return <Box key={pos} k={pos} name={val} />
      })

      const divider = [...Array(ROW_SIZE / 2 + 2)].map((_) => <div>{'|'}</div>)
      return (
        <div style={outer}>
          <h1>
            {' '}
            {'[space]'} {this.state.pause ? 'PLAY/pause' : 'play/PAUSE'}{' '}
          </h1>
          <div style={inner}>
            <div style={style}>{board}</div>
            <div style={score}>{this.state.playerScore}</div>
            <div style={dividerStyle}> {divider} </div>
            <div style={dividerStyle}>{this.state.opponentScore}</div>
          </div>
          <h3> {'press up and down to move'} </h3>
        </div>
      )
    }
  }
)
