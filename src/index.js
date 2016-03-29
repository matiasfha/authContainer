import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Immutable from 'immutable'

/**
* Defaults arguments used for the HOC
* @property {function} authSelector	- A function to get the authenticated status of
*	the user from the app state
* @property {string} redirectOnFailure - A string to identify the route used to redirect
*	when no authenticated user
*/
const defaults = {
	/**
	* Get the authenticated status of the user
	*/
	authSelector: (authData: Object): boolean => {
		if (Immutable.Map.isMap(authData)) {
			return authData.get('authenticated')
		}
		return authData.authenticated
	},
	redirectOnFailure: '/login',
}

/**
* The HOC definition
* @param {object} args - An object with the basic definition used in the HOC
* @property {function} authSelector
* @property {string} redirectOnFailure
*/
export const AuthContainer = (args: Object): Function => {
	const { authSelector, redirectOnFailure } = { ...defaults, ...args }

	/**
	* Allow to know if the user is authenticated
	* based on the authSelector defined in the args
	*/
	const isAuthenticated = (state: Object): boolean => authSelector(state)

	/**
	* Check the authenticated state and redirect to some route if
	* is not logged in
	*/
	const checkAuth = (state: Object, router: Object) => {
		if (!isAuthenticated(state)) {
			router.replace({
				pathname: redirectOnFailure,
				query: {},
				state,
			})
		}
	}

	/**
	* Perform the composition of a Component adding a way to check the authenticated status
	* @params {React.Component} ComposedComponent - The base component to be composed
	*/
	const composed = (ComposedComponent: React.Component): React.Component => {
		/**
		* Used with redux.connect inject a state property into the component props
		*/
		function mapStateToProps(state: Object): Object {
			if (Immutable.Map.isMap(state)) {
				return { user: state.get('user') }
			}
			return { user: state.user }
		}

		@connect(mapStateToProps)
		class Composed extends Component {
			static propTypes = {
				user: PropTypes.object,
			}

			static contextTypes = {
				router: PropTypes.object.isRequired,
			}

			componentWillMount() {
				checkAuth(this.props.user, this.context.router)
			}

			componentWillReceiveProps(nextProps) {
				checkAuth(nextProps.user, this.context.router)
			}
			render() {
				if (isAuthenticated(this.props.user)) {
					return <ComposedComponent {...this.props} />
				}
				return <div />
			}
		}
		return Composed
	}

	/**
	* A static property to be used as onEnter prop for <Route/>
	* check the authenticated status in the route transition
	* @param {object} store - The redux store
	* @param {object} nextState -  The next state of the app
	* @param {function} replace -  A reference to the replace function of route
	*/
	composed.onEnter = (store: Object, nextState: Object, replace: Function) => {
		const state = store.getState()
		let user
		if (Immutable.Map.isMap(state)) {
			user = state.get('user')
		} else {
			user = state.user
		}
		const authData = authSelector(user)
		checkAuth(authData, { replace })
	}
	return composed
}
