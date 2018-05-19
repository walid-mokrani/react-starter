import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('./App.js', () => {
    ReactDOM.render(<App />, document.getElementById('root'))
  })
}
