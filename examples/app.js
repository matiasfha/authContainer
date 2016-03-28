import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { routerReducer, syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import { AuthComponent } from 'auth-component'

const baseHistory = browserHistory
import * as reducers from './reducers'
const routingMiddleware = routerMiddleware(baseHistory)
const reducer = combineReducers({ ...reducers, ...{ routing: routerReducer } })

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q">
    <LogMonitor theme="tomorrow" />
  </DockMonitor>
)

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(routingMiddleware),
  DevTools.instrument()
)

const store = createStore(reducer, enhancer)
const history = syncHistoryWithStore(baseHistory, store)


const UserAuthenticated = AuthComponent()

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Route path="/" component={App}>
				<IndexRoute component={Home} />
				<Route path="login" component={Login} />
				<Route path="auth" component={UserAuthenticated(Auth)} />
			</Route>
		</Router>
	</Provider>
)
