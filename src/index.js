import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Immutable from 'immutable'

const defaults = {
	authSelector: (authData: Object): boolean => {
		if (Immutable.Map.isMap(authData)) {
			return authData.get('authenticated')
		}
		return authData.authenticated
	},
	redirectOnFailure: '/login',
}

export const AuthContainer = (args: Object): Function => {
	const { authSelector, redirectOnFailure } = { ...defaults, ...args }

	const isAuthenticated = (state: Object): boolean => authSelector(state)

	const checkAuth = (state: Object, router: Object) => {
		if (!isAuthenticated(state)) {
			router.replace({
				pathname: redirectOnFailure,
				query: {},
				state,
			})
		}
	}

	const composed = (ComposedComponent: React.Component): React.Component => {
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

	composed.onEnter = (store: Object, nextState: Object, replace: Object) => {
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
