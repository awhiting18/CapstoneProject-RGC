import React from 'react'

/* Enum */
const BACKGROUND = 0
const PLAYER = 1
const COMPUTER = 2
const BALL = 3
export { BACKGROUND, PLAYER, COMPUTER, BALL }
/* style sheet */
const backgroundStyle = {
  height: '50px',
  width: '50px',
  borderStyle: 'solid',
  justifyContent: 'center',
  backgroundColor: 'black',
  borderRadius: '0px',
}
const playerStyle = {
  height: '50px',
  width: '50px',
  borderStyle: 'solid',
  justifyContent: 'center',
  backgroundColor: '#AD0202',
  color: 'white',
}
const computerStyle = {
  height: '50px',
  width: '50px',
  borderStyle: 'solid',
  justifyContent: 'center',
  backgroundColor: '#02ADAD',
  color: 'white',
}

const ballStyle = {
  height: '50px',
  width: '50px',
  display: 'block',
  backgroundColor: 'yellow',
  justifyContent: 'center',
  borderRadius: '100%',
  color: 'white',
  zIndex: '10',
  position: 'relative',
}

/**  function to select style
 * @function getStyle
 */
const getStyle = (val) => {
  if (val === BACKGROUND) {
    return {}
  }
  if (val === PLAYER) {
    return playerStyle
  } else if (val === COMPUTER) {
    return computerStyle
  } else {
    return ballStyle
  }
}

const Box = (props) => (
  <div style={backgroundStyle}>
    <div style={getStyle(props.name)} />
  </div>
)

export default Box
