import React, { Component } from 'react';
import loadScript from 'load-script';

const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js';

let scriptLoadingStarted = false;

export default class GoogleChooser extends React.Component {

  static propTypes = {
    children: React.PropTypes.node,
    clientId: React.PropTypes.string.isRequired,
    developerKey: React.PropTypes.string.isRequired,
    scope: React.PropTypes.array,
    viewId: React.PropTypes.string,
    authImmediate: React.PropTypes.bool,
    origin: React.PropTypes.string,
    onChange: React.PropTypes.func,
    multiselect: React.PropTypes.bool,
    navHidden: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    mimeTypes: React.PropTypes.array
  };

  static defaultProps = {
    onChange: () => {},
    scope:['https://www.googleapis.com/auth/drive.readonly'],
    viewId: 'DOCS',
    authImmediate: false,
    multiselect: false,
    navHidden: false,
    disabled: false
  };

  constructor(props) {
    super(props);

    this.onApiLoad = this.onApiLoad.bind(this);
    this.onChoose = this.onChoose.bind(this);
  }

  componentDidMount() {
    if(this.isGoogleReady()) {
      // google api is already exists
      // init immediately
      this.onApiLoad();
    } else if (!scriptLoadingStarted) {
      // load google api and the init
      scriptLoadingStarted = true;
      loadScript(GOOGLE_SDK_URL, this.onApiLoad)
    } else {
      // is loading
    }
  }

  isGoogleReady() {
    return !!window.gapi;
  }

  isGoogleAuthReady() {
    return !!window.gapi.auth;
  }

  isGooglePickerReady() {
    return !!window.google.picker;
  }

  onApiLoad() {
    window.gapi.load('auth');
    window.gapi.load('picker');
  }

  doAuth(callback) {
    window.gapi.auth.authorize({
        client_id: this.props.clientId,
        scope: this.props.scope,
        immediate: this.props.authImmediate
      },
      callback
    );
  }

  onChoose() {
    if (!this.isGoogleReady() || !this.isGoogleAuthReady() || !this.isGooglePickerReady() || this.props.disabled) {
      return null;
    }

    const token = window.gapi.auth.getToken();
    const oauthToken = token && token.access_token;

    if (oauthToken) {
      this.createPicker(oauthToken);
    } else {
      this.doAuth(({ access_token }) => this.createPicker(access_token));
    }
  }

  createPicker(oauthToken) {
    const view = window.google.picker.ViewId[this.props.viewId];

    if (!view) {
      throw new Error('Can\'t find view by viewId');
    }

    if (this.props.mimeTypes) {
        view.setMimeTypes(this.props.mimeTypes.join(','))
    }

    const picker = new window.google.picker.PickerBuilder()
                             .addView(view)
                             .setOAuthToken(oauthToken)
                             .setDeveloperKey(this.props.developerKey)
                             .setCallback(this.props.onChange);

    if (this.props.origin) {
      picker.setOrigin(this.props.origin);
    }

    if (this.props.navHidden) {
      picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN)
    }

    if (this.props.multiselect) {
      picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
    }

    picker.build()
          .setVisible(true);
  }

  render() {
    return (
      <div onClick={this.onChoose}>
        {
          this.props.children ?
            this.props.children :
            <button>Open google chooser</button>
        }
      </div>
    );
  }
}
