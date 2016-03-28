[![Coverage Status](https://coveralls.io/repos/github/msdark/authContainer/badge.svg?branch=master)](https://coveralls.io/github/msdark/authContainer?branch=master)

[![Build Status](https://travis-ci.org/msdark/authContainer.svg?branch=master)](https://travis-ci.org/msdark/authContainer)

# authContainer
React High Order Component to add authentication to Redux app

The authentication is a very common pattern in every app.

This is a High Order Component [Read](https://gist.github.com/sebmarkbage/ef0bf1f338a7182b6775) and [this](http://jamesknelson.com/structuring-react-applications-higher-order-components/) and [this](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.3y2p5580n) to add authentication features to whatever React Component you need

## Example
    import { AuthContainer } from './containers/Auth'
		const AuthComponent = AuthContainer()
		ReactDOM.render(
		  <Provider store={store}>
				<Router history={history}>
					<Route path="/" component={App}>
						<IndexRedirect to="/login" />
					</Route>
					<Route path="/login" component={Login} />
					<Route path="/trips" component={AuthComponent(PrivateView)} />
				</Router>
		  </Provider>,
		  document.getElementById('root')
		)

The HOC add a `checkAuth` method based on the props. As default will review `this.props.user.authenticated` to get the authentication status, you can pass your own way to get the status using

    const AuthComponent = AuthContainer({
			authSelector: (authData) => { return true},
		})

Also the HOC will redirect to `/login` as default if the user is not authenticated, you can change that using:

	const AuthComponent = AuthContainer({
		redirectOnFailure: '/whatever',
	})


### TODO
- Add an example app
- Add test suite
