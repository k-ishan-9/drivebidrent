import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import AppInitializer from './AppInitializer.jsx'
import './index.css'
import '@splidejs/react-splide/css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer />
      </BrowserRouter>
    </Provider>
)
