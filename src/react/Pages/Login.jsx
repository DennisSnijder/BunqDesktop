import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import Grid from "material-ui/Grid";
import Input from "material-ui/Input";
import Button from "material-ui/Button";
import Avatar from "material-ui/Avatar";
import Card, { CardHeader, CardContent } from "material-ui/Card";
import AttachmentImage from "../Components/AttachmentImage";
import { userLogin } from "../Actions/user";
import { usersUpdate } from "../Actions/users";
import { Typography } from "material-ui";
import {
    registrationClearApiKey,
    registrationSetApiKey,
    registrationSetDeviceName
} from "../Actions/registration";

const styles = {
    loginButton: {
        width: "100%",
        marginTop: 20
    },
    clearButton: {
        width: "100%",
        marginTop: 20
    },
    apiInput: {
        width: "100%",
        marginTop: 20
    },
    smallAvatar: {
        width: 50,
        height: 50
    }
};

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            users: [],
            apiKey: "",
            apiKeyValid: false,
            deviceName: "My Device",
            deviceNameValid: true,
            attemptingLogin: false
        };
    }

    componentDidMount() {
        if (this.props.apiKey !== false) {
            this.setState({ apiKey: this.props.apiKey });
        }
        if (this.props.deviceName !== false) {
            this.setState({ deviceName: this.props.deviceName });
        }
        this.validateInputs(this.props.apiKey, this.props.deviceName);
    }

    setRegistration = () => {
        if (this.state.apiKey.length !== 64) {
            this.props.openSnackbar(
                "The API key you entered does not look valid"
            );
            return;
        }

        if (this.state.deviceName.length <= 5) {
            this.props.openSnackbar(
                "The device name has to be atleast 6 characters."
            );
            return;
        } else if (this.state.deviceName.length > 32) {
            this.props.openSnackbar(
                "The device name can't be longer than 32 characters."
            );
            return;
        }

        if (this.state.deviceNameValid && this.state.apiKeyValid) {
            this.props.setDeviceName(this.state.deviceName);
            this.props.setApiKey(this.state.apiKey);
        }
    };

    clearApiKey = () => {
        this.props.clearApiKey();
        this.setState({ apiKey: "", apiKeyValid: false });
    };

    handleKeyChange = event => {
        this.setState(
            {
                apiKey: event.target.value
            },
            _ => this.validateInputs(this.state.apiKey, this.state.deviceName)
        );
    };
    handleNameChange = event => {
        this.setState(
            {
                deviceName: event.target.value
            },
            _ => this.validateInputs(this.state.apiKey, this.state.deviceName)
        );
    };

    validateInputs = (apiKey, deviceName) => {
        this.setState({
            apiKeyValid: apiKey !== false && apiKey.length === 64,
            deviceNameValid:
                deviceName !== false &&
                deviceName.length >= 6 &&
                deviceName.length <= 32
        });
    };

    selectAccount = (type) => {
        return () => {
            this.props.loginUser(type, true);
        };
    };

    render() {
        const userItems = Object.keys(this.props.users).map(userKey => {
            const user = this.props.users[userKey];
            const imageUUID = user.avatar.image[0].attachment_public_uuid;

            return (
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardHeader
                            avatar={
                                <Avatar>
                                    <AttachmentImage
                                        style={styles.smallAvatar}
                                        BunqJSClient={this.props.BunqJSClient}
                                        imageUUID={imageUUID}
                                    />
                                </Avatar>
                            }
                            title={user.display_name}
                        />
                        <CardContent>
                            <Button
                                disabled={this.props.userLoading}
                                onClick={this.selectAccount(userKey)}
                                raised
                                color={"primary"}
                                style={styles.loginButton}
                            >
                                Login
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            );
        });

        let clearBtn = null;
        if (this.props.apiKey !== false) {
            clearBtn = (
                <Button
                    raised
                    color={"accent"}
                    style={styles.clearButton}
                    onClick={this.clearApiKey}
                    disabled={this.props.userLoading}
                >
                    Clear API key
                </Button>
            );
        }

        return (
            <Grid container spacing={16} justify={"center"}>
                <Helmet>
                    <title>{`BunqWeb - Login`}</title>
                </Helmet>

                <Grid item xs={12} sm={8} md={6}>
                    <Card>
                        <CardContent>
                            <Typography type="headline" component="h2">
                                Enter your API Key
                            </Typography>
                            <p>
                                In the Bunq app go to your Profile > Security >
                                API Keys and generate a new key
                            </p>
                            <Input
                                style={styles.apiInput}
                                error={!this.state.apiKeyValid}
                                label="API Key"
                                hint="Your personal API key"
                                onChange={this.handleKeyChange}
                                value={this.state.apiKey}
                            />
                            <Input
                                style={styles.apiInput}
                                error={!this.state.deviceNameValid}
                                label="Device Name"
                                hint="Device name so you can recognize it later"
                                onChange={this.handleNameChange}
                                value={this.state.deviceName}
                                disabled={
                                    // unchanged api key
                                    this.state.apiKey === this.props.apiKey
                                }
                            />
                            <Button
                                raised
                                disabled={
                                    // unchanged api key
                                    this.state.apiKey === this.props.apiKey ||
                                    // invalid inputs
                                    this.state.apiKeyValid === false ||
                                    this.state.deviceNameValid === false ||
                                    // user info is already being loaded
                                    this.props.userLoading === true
                                }
                                color={"primary"}
                                style={styles.loginButton}
                                onClick={this.setRegistration}
                            >
                                Set API Key
                            </Button>
                            {clearBtn}
                        </CardContent>
                    </Card>
                </Grid>

                {userItems}
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        apiKey: state.registration.api_key,
        deviceName: state.registration.device_name,
        users: state.users.users,
        user: state.user.user,
        userLoading: state.user.loading
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { BunqJSClient } = ownProps;
    return {
        clearApiKey: () => dispatch(registrationClearApiKey(BunqJSClient)),
        setApiKey: api_key => dispatch(registrationSetApiKey(api_key)),
        setDeviceName: device_name =>
            dispatch(registrationSetDeviceName(device_name)),

        // selects an account from the BunqJSClient user list based on type
        loginUser: (type, updated = false) =>
            dispatch(userLogin(BunqJSClient, type, updated)),

        // get latest user list from BunqJSClient
        usersUpdate: (updated = false) =>
            dispatch(usersUpdate(BunqJSClient, updated))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
