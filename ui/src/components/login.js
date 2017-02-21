'use strict';

const React = require('react');
const connect = require('react-redux').connect;
const bindActionCreators = require('redux').bindActionCreators;

const validate = require('validate.js');

const routeActions = require('../actions/route');
const userActions = require('../actions/user');
const userHelpers = require('../helpers/user');

const validationRules = require('../../../validate/fields');

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

    showRegistration() {
        this.props.routeActions.routeChange('register');
    }

    showLogin() {
        this.props.routeActions.routeChange('login');
    }

    handleChange(key) {
        return {
            value: this.state[key],
            onChange: (event) => {
                this.setState({ [key]: event.target.value }, this.validate.bind(this));
            },
        };
    }

    validate() {
        this.props.formErrors = validate(this.state, {
            username: validationRules.username,
            password: validationRules.password,
        });
        this.setState({ disableSubmit: !(this.state.username && this.state.password) });
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
                            {...this.handleChange('username')}
                            type="text"
                            placeholder="User"
                        />
                        { this.props.formErrors && this.props.formErrors.username && (<p>{this.props.formErrors.username[0]}</p>) }
                    </div>
                    <label><span>Password:</span></label>
                    <div>
                        <input
                            {...this.handleChange('password')}
                            type="password"
                            placeholder="Password"
                        />
                        { this.props.formErrors && this.props.formErrors.password && (<p>{this.props.formErrors.password[0]}</p>) }
                    </div>

                    { this.props.error && (<p>{this.props.error}</p>) }

                    <button
                        disabled={this.state.disableSubmit || this.props.formErrors}
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
