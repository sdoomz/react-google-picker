import React from 'react';
import PropTypes from 'prop-types';
import loadScript from 'load-script';

const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js';

let scriptLoadingStarted = false;

export default class GoogleChooser extends React.Component {

    static propTypes = {
        children: PropTypes.node,
        clientId: PropTypes.string.isRequired,
        developerKey: PropTypes.string,
        oauthToken: PropTypes.string,
        scope: PropTypes.array,
        viewId: PropTypes.string,
        authImmediate: PropTypes.bool,
        origin: PropTypes.string,
        onChange: PropTypes.func,
        onAuthenticate: PropTypes.func,
        onAuthFailed: PropTypes.func,
        createPicker: PropTypes.func,
        multiselect: PropTypes.bool,
        navHidden: PropTypes.bool,
        disabled: PropTypes.bool
  };

  static defaultProps = {
    onChange: () => {},
    onAuthenticate: () => {},
    onAuthFailed: () => {},
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

    let oauthToken = this.props.oauthToken

    if (!oauthToken) {
      const token = window.gapi.auth.getToken();
      oauthToken = token && token.access_token;
    }

    if (oauthToken) {
      this.createPicker(oauthToken);
    } else {
      this.doAuth(response => {
        if (response.access_token) {
          this.createPicker(response.access_token)
        } else {
          this.props.onAuthFailed(response);
        }
      });
    }
  }

  createPicker(oauthToken) {

    this.props.onAuthenticate(oauthToken);

    if(this.props.createPicker){
      return this.props.createPicker(google, oauthToken)
    }

    const googleViewId = google.picker.ViewId[this.props.viewId];
    const view = new window.google.picker.View(googleViewId);

    if (this.props.mimeTypes) {
      view.setMimeTypes(this.props.mimeTypes.join(','))
    }
    if (this.props.query) {
      view.setQuery(this.props.query)
    }

    if (!view) {
      throw new Error('Can\'t find view by viewId');
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
