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
  justifyContent: 'center',
}

const outer = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginTop: '1em',
  marginLeft: '0em',
  Text: '100px',
  padding: '10px',
}
const dividerStyle = {
  marginLeft: '5em',
  marginRight: '5em',
  fontSize: '50px',
  color: 'black',
}

const bar = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}

const plaScore = {
  width: '100px',
  fontSize: '50px',
  color: 'black',
  textAlign: 'left',
}

const oppScore = {
  width: '100px',
  fontSize: '50px',
  color: 'black',
  textAlign: 'right',
}

const style = {
  heigth: '500px',
  display: 'grid',
  gridTemplate: `repeat(${ROW_SIZE}, 0fr) / repeat(${COL_SIZE}, 0fr)`,
}

/**
 *   This function creates the initial game state for pong.
 * @returns returns the initial state for the game board
 * @function InitialState
 *
 */
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

/* Timeout */
let timeoutKey = 0

/**
 *   This function is the game itself. The other functions and return values make up the pong game.
 */
export default withRouter(
  class GameVersion2 extends React.Component {
    /**
     * @constructor: This function sets the state for the game.
     * @param {*} props : any props that have been passed in.
     */
    constructor(props) {
      super(props)
      this.state = InitialState()
      let pusher
      let channel
      let gameCode
    }

    /**
     *   this function disconnects from the current game
     * @param timeout : this is a boolean variable that tells us whether or not the disconnect
     * call from from the timeout or from the user.
     * @function disconnect
     * */
    disconnect = (timeout) => {
      //If the disconnect was from a timeout, we send a message to the controller to  logout
      if (timeout) {
        this.channel.trigger('client-disconnect', 'Disconnect')
      }
      this.pusher.unsubscribe('private-pong' + this.gameCode)
      this.props.router.push('./')
    }

    /**
     *    this function resets the game ball position.
     * @function resetGame
     */
    resetGame = () =>
      this.setState({
        ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
      })

    /**
     *  this function moves the board and changes the state of the board.
     * @param playerBoard:
     * @param isUp:
     * @function moveBoard
     */
    moveBoard = (playerBoard, isUp) => {
      const playerEdge = isUp
        ? playerBoard[0]
        : playerBoard[PADDLE_BOARD_SIZE - 1]

      /* Timeout */
      clearTimeout(timeoutKey)
      timeoutKey = setTimeout(() => this.disconnect(true), 45000)

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

    /**
     * this function is called when the game is loaded onto the screen.
     * It sets up the inital values for the pusher channel and instance.
     * @function componentDidMount
     */
    componentDidMount() {
      //We first try to grab the pusher instance if it is already in memory.
      this.pusher = Pusher.instances[0]
      this.gameCode = this.props.router.query.gameCode

      //Now we can use the pusher in memory to grab the channel that was previously subscribed to on the index page
      this.channel =
        this.pusher.channels.channels['private-pong' + this.gameCode]

      //We check for channel being undefined and if it is, then we reconnect to the correct channel
      if (this.channel == undefined) {
        this.channel = this.pusher.subscribe('private-pong' + this.gameCode)
      }

      //Function bindings
      this.channel.bind('client-controllermovement', (move) => {
        this.handleInput(move)
      })
      this.channel.bind('client-disconnect', () => this.disconnect(false))

      /** This function moves the ball*/
      setInterval(() => {
        if (!this.state.pause) {
          this.bounceBall()
        }
      }, this.state.ballSpeed)
      /** This function moves the opponent*/
      setInterval(() => {
        if (!this.state.pause) {
          this.moveOpponent()
        }
      }, this.state.opponentSpeed)

      document.title = 'ping-pong'
      console.log(this.channel)

      timeoutKey = setTimeout(() => this.disconnect(true), 45000)
    }

    /**
     * This function is the edge collision detection for the game.
     * @param {*} pos : the position of the ball
     * @returns whether or not the ball is touching an edge.
     * @function touchingEdge
     */
    touchingEdge = (pos) =>
      (0 <= pos && pos < COL_SIZE) ||
      (COL_SIZE * (ROW_SIZE - 1) <= pos && pos < COL_SIZE * ROW_SIZE)

    /**
     *   This function is the paddle collision detection for the game.
     * @param {*} pos : the position of the ball
     * @returns whether or not the ball is touching a paddle.
     * @function touchingPaddle
     */
    touchingPaddle = (pos) => {
      return (
        this.state.player.indexOf(pos) !== -1 ||
        this.state.opponent.indexOf(pos) !== -1 ||
        this.state[this.state.deltaX === -1 ? 'player' : 'opponent'].indexOf(
          pos + this.state.deltaX
        ) !== -1
      )
    }

    /**
     *   This function tells whether or not a point has been scored
     * @param {*} pos : the position of the ball
     * @returns whether or not the ball has been scored.
     * @function isScore
     */
    isScore = (pos) =>
      (this.state.deltaX === -1 && pos % COL_SIZE === 0) ||
      (this.state.deltaX === 1 && (pos + 1) % COL_SIZE === 0)

    /**
     *   This function moves the opponent.
     * @function moveOpponent
     */
    moveOpponent = () => {
      const movedPlayer = this.moveBoard(
        this.state.opponent,
        this.state.opponentDir
      )
      movedPlayer
        ? this.setState({ opponent: movedPlayer })
        : this.setState({ opponentDir: !this.state.opponentDir })
    }

    /**
     *   This function tells whether or not the ball is touching the paddle edge
     * @param {*} pos : the position of the ball
     * @returns whether or not the ball is touching the paddle edge.
     * @function touchingPaddleEdge
     */
    touchingPaddleEdge = (pos) =>
      this.state.player[0] === pos ||
      this.state.player[PADDLE_BOARD_SIZE - 1] === pos ||
      this.state.opponent[0] === pos ||
      this.state.opponent[PADDLE_BOARD_SIZE - 1] === pos

    /**
     *   This function bounces the ball
     * @function bounceBall
     */
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

    /**
     *   This function handles the input coming in from the pusher channel.
     * @param {*} keyCode : the direction of the movement or the command to pause the game.
     * @function handleInput
     */
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

    /**
     *   This function renders the game onto the screen
     * @returns The game state
     * @function render
     */
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

      /*const divider = [...Array(ROW_SIZE / 2 + 2)].map((_) => <div>{'|'}</div>)*/
      return (
        <div>
          <div style={bar}>
            <div style={plaScore}>{this.state.playerScore}</div>
            <div style={dividerStyle}>
              <pre>{'  Player   :   Computer'}</pre>
            </div>
            <div style={oppScore}>{this.state.opponentScore}</div>
          </div>
          <div style={outer}>
            <div style={inner}>
              <div style={style}>{board}</div>
            </div>
            <h1 style={bar}> {this.state.pause ? 'PAUSED' : 'PLAYING'} </h1>
          </div>
        </div>
      )
    }
  }
)
