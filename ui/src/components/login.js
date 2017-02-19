'use strict';

const React = require('react');
const connect = require('react-redux').connect;
const bindActionCreators = require('redux').bindActionCreators;

const routeActions = require('../actions/route');
const userActions = require('../actions/user');
const userHelpers = require('../helpers/user');

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.username || '',
            password: this.props.password || '',
            disableSubmit: true,
        };

        this.getAction = () => (this.isRegister && userHelpers.create) || (this.isLogin && userHelpers.login);
        this.getActionSuccess = () => (this.isRegister && 'registerSuccess') || (this.isLogin && 'loginSuccess');
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        this.getAction()(this.state)
            .then((data) => this.props.userActions[this.getActionSuccess()](data))
            .catch((error) => {
                console.log('error', error);
                this.props.routeActions.actionFailure(error)
            });

        return false;
    }

    validate() {
        this.setState({ disableSubmit: !(this.state.username && this.state.password) });
    }

    showRegistration() {
        this.props.routeActions.routeChange('register');
    }

    showLogin() {
        this.props.routeActions.routeChange('login');
    }

    watchField(key) {
        return {
            value: this.state[key],
            onChange: (event) => {
                this.setState({ [key]: event.target.value }, this.validate);
            },
        };
    }

    render() {
        this.isRegister = this.props.route === 'register';
        this.isLogin = this.props.route === 'login';

        return (
            <div className="form">
                <p>Login</p>
                <form onSubmit={(e) => this.onSubmit(e)}>
                    <label><span>username:</span></label>
                    <div>
                        <input
                            {...this.watchField('username')}
                            type="text"
                            placeholder="userActions"
                        />
                    </div>
                    <label><span>Password:</span></label>
                    <div>
                        <input
                            {...this.watchField('password')}
                            type="password"
                            placeholder="Password"
                        />
                    </div>

                    { this.props.error && (<p>{this.props.error}</p>) }

                    <button
                        disabled={this.state.disableSubmit}
                        type="submit"
                        className="">
                        OK
                    </button>
                </form>
                { this.isLogin && (<a href="#" onClick={this.showRegistration.bind(this)}>Create new account</a>)}
                { this.isRegister && (<a href="#" onClick={this.showLogin.bind(this)}>I have an account</a>)}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    error: state.route.error,
    route: state.route.current,
});

const mapDispatchToProps = (dispatch) => ({
    routeActions: bindActionCreators(routeActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Login);
