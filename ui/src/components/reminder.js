'use strict';


const React = require('react');
const connect = require('react-redux').connect;
const bindActionCreators = require('redux').bindActionCreators;
const DateTimePicker = require('react-widgets').DateTimePicker;
const InputGroup = require('react-bootstrap').InputGroup;
const FormControl = require('react-bootstrap').FormControl;
const Button = require('react-bootstrap').Button;
const Location = require('./location');

const config = require('../../config');
const reminderActions = require('../actions/reminder');
const reminderHelpers = require('../helpers/reminder');

const validationRules = require('../../../core/validate/fields');
const validate = require('validate.js');


// TODO add base class for forms with validation logic
class Reminder extends React.Component {
    constructor(props) {
        super(props);

        const reminder = this.props.reminders[this.props.reminderId];

        this.locationList = config.locationList;

        this.state = {
            url: reminder && reminder.url || '',
            _id: reminder && reminder._id || '',
            description: reminder && reminder.description || '',
            dueDate:  new Date(reminder && reminder.dueDate || Date.now() + 15 * 60 * 1000),
            location: reminder && reminder.location || config.defaultLocation,
        };
    }

    onSubmit() {
        (this.state._id ? reminderHelpers.update(this.state) : reminderHelpers.add(this.state))
            .then((reminder) => this.props.reminderActions.reminderSuccess(reminder));
    }

    handleChange(key) {
        return {
            value: this.state[key],
            onChange: (event) => {
                this.setState({
                    [key]: event.target.value,
                    [`${key}Touched`]: true,
                }, this.validate.bind(this));
            },
        };
    }

    validate() {
        this.setState({
            formErrors: validate(this.state, {
                url: validationRules.url,
                description: validationRules.description,
            })
        });
    }

    getError(key) {
        const error = this.state[`${key}Touched`] && this.state.formErrors && this.state.formErrors[key] && (
                <p className="input-error">* {this.state.formErrors[key][0]}</p>);
        return error || (<p className="input-error invisible">Empty</p>);
    }

    getValidityClass(key) {
        if (!this.state[`${key}Touched`]) return 'pristine';
        if (this.state.formErrors && this.state.formErrors[key] && this.state.formErrors[key][0]) return 'invalid';
        return 'valid';
    }

    render() {
        return (
            <div className="content">
                <InputGroup>
                    <InputGroup.Addon className={this.getValidityClass('url')}>URL</InputGroup.Addon>
                    <FormControl type="text" placeholder="http://..." {...this.handleChange('url')} />
                </InputGroup>
                { this.getError('url') }

                <InputGroup>
                    <InputGroup.Addon className={this.getValidityClass('description')}>Description</InputGroup.Addon>
                    <FormControl type="text" placeholder="" {...this.handleChange('description')} />
                </InputGroup>
                { this.getError('description') }

                <InputGroup>
                    <InputGroup.Addon>Location</InputGroup.Addon>
                    <Location action={(id) => this.setState({ location: id })} location={this.state.location}/>
                </InputGroup>

                <InputGroup>
                    <InputGroup.Addon>Due</InputGroup.Addon>
                    <DateTimePicker
                        defaultValue={new Date()}
                        min={new Date()}
                        {...this.handleChange('dueDate')}
                    />
                </InputGroup>

                <Button onClick={this.onSubmit.bind(this)}>
                    { this.state._id ? 'Edit' : 'Add' } reminder
                </Button>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    error: state.route.error,
    reminders: state.reminder.reminders,
});

const mapDispatchToProps = (dispatch) => ({
    reminderActions: bindActionCreators(reminderActions, dispatch),
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Reminder);