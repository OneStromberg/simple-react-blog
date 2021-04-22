import React from 'react'
import initAuth from '../utils/initAuth'

initAuth()

function HorobotApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default HorobotApp