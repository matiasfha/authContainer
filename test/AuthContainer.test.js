/* global expect */
import React from 'react'
import { Route, Router } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { renderIntoDocument } from 'react-addons-test-utils'
import createMemoryHistory from 'react-router/lib/createMemoryHistory'
import { routerReducer, syncHistoryWithStore, routerMiddleware } from 'react-router-redux'

import { AuthContainer } from '../src'

const LOGGED_IN = 'LOGGED_IN'
const LOGGED_OUT = 'LOGGED_OUT'

const userReducer = (state = {}, action) => {
	switch (action.type) {
	case LOGGED_IN: return { ...action.payload, authenticated: true }
	case LOGGED_OUT: return { authenticated: false }
	default: return state
	}
}

const rootReducer = combineReducers({
	routing: routerReducer,
	user: userReducer,
})

const userSelector = state => state.authenticated

const UserAuthenticated = AuthContainer({
	authSelector: userSelector,
})

const App = ({ children }) => <div>{children}</div>
App.propTypes = {
	children: React.PropTypes.node,
}

const UnProtectedComponent = () => <div />

const defaultRoutes = (
	<Route path="/" component={App} >
		<Route path="login" component={UnProtectedComponent} />
		<Route path="auth" component={UserAuthenticated(UnProtectedComponent)} />
	</Route>
)

const userLoggedIn = (firstName = 'Test', lastName = 'User') => {
	return {
		type: LOGGED_IN,
		payload: {
			email: 'test@test.cl',
			firstName,
			lastName,
		},
	}
}

const setupTest = (routes = defaultRoutes) => {
	const baseHistory = createMemoryHistory()
	const middleware = routerMiddleware(baseHistory)
	const initialState = {
		user: {
			authenticated: false,
		},
	}
	const store = createStore(rootReducer, initialState, applyMiddleware(middleware))
	const history = syncHistoryWithStore(baseHistory, store)

	const tree = renderIntoDocument(
		<Provider store={store}>
			<Router history={history}>
				{routes}
			</Router>
		</Provider>
	)
	return { history, store, tree }
}

describe('AuthContainer', () => {
	it('redirects no authorized', () => {
		const { history, store } = setupTest()
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/')
		history.push('/auth')
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/login')
	})

	it('allows authenticated user', () => {
		const { history, store } = setupTest()
		store.dispatch(userLoggedIn())
		history.push('/auth')
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/auth')
		store.dispatch({ type: LOGGED_OUT })
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/login')
	})

	it('provides onEnter static function', () => {
		const connect = (fn) => (nextState, replaceState) => fn(store, nextState, replaceState)

		const routesOnEnter = (
			<Route path="/" component={App}>
				<Route path="login" component={UnProtectedComponent} />
				<Route path="onEnter" component={UnProtectedComponent} onEnter={connect(UserAuthenticated.onEnter)} />
			</Route>
		)
		const { history, store: createdStore } = setupTest(routesOnEnter)
		const store = createdStore
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/')
		history.push('/onEnter')
		expect(store.getState().routing.locationBeforeTransitions.pathname).to.equal('/login')
	})
})
