/* global google */

import React from 'react'
import PropTypes from 'prop-types'
import loadScript from 'load-script'

const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js'

let scriptLoadingStarted = false

export default class GoogleChooser extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    clientId: PropTypes.string.isRequired,
    developerKey: PropTypes.string,
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
  }

  static defaultProps = {
    onChange: () => {},
    onAuthenticate: () => {},
    onAuthFailed: () => {},
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    viewId: 'DOCS',
    authImmediate: false,
    multiselect: false,
    navHidden: false,
    disabled: false
  };

  constructor (props) {
    super(props)

    this.onApiLoad = this.onApiLoad.bind(this)
    this.onChoose = this.onChoose.bind(this)
  }

  componentDidMount () {
    if (this.isGoogleReady()) {
      // google api is already exists
      // init immediately
      this.onApiLoad()
    } else if (!scriptLoadingStarted) {
      // load google api and the init
      scriptLoadingStarted = true
      loadScript(GOOGLE_SDK_URL, this.onApiLoad)
    } else {
      // is loading
    }
  }

  api () {
    return window.gapi
  }

  isGoogleReady () {
    return !!this.api()
  }

  isGoogleAuthReady () {
    return !!this.api().auth
  }

  isGooglePickerReady () {
    return !!this.api().picker
  }

  onApiLoad () {
    this.api().load('auth')
    this.api().load('picker')
  }

  doAuth (callback) {
    this.api().auth.authorize({
      client_id: this.props.clientId,
      scope: this.props.scope,
      immediate: this.props.authImmediate
    },
    callback
    )
  }

  onChoose () {
    if (!this.isGoogleReady() || !this.isGoogleAuthReady() || !this.isGooglePickerReady() || this.props.disabled) {
      return null
    }

    const token = this.api().auth.getToken()
    const oauthToken = token && token.access_token

    if (oauthToken) {
      this.createPicker(oauthToken)
    } else {
      this.doAuth(response => {
        if (response.access_token) {
          this.createPicker(response.access_token)
        } else {
          this.props.onAuthFailed(response)
        }
      })
    }
  }

  createPicker (oauthToken) {
    this.props.onAuthenticate(oauthToken)

    if (this.props.createPicker) {
      return this.props.createPicker(google, oauthToken)
    }

    const { viewId, mimeTypes, query } = this.props
    const context = window.google.picker
    const view = new context.View(context.ViewId[viewId])

    if (!view) {
      throw new Error("Can't find view by viewId")
    }

    if (mimeTypes) {
      view.setMimeTypes(mimeTypes.join(','))
    }

    if (query) {
      view.setQuery(query)
    }

    const { developerKey, onChange, origin, navHidden, multiselect } = this.props

    const picker = new context.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(developerKey)
      .setCallback(onChange)

    if (origin) {
      picker.setOrigin(origin)
    }

    if (navHidden) {
      picker.enableFeature(context.Feature.NAV_HIDDEN)
    }

    if (multiselect) {
      picker.enableFeature(context.Feature.MULTISELECT_ENABLED)
    }

    picker.build()
      .setVisible(true)
  }

  render () {
    return (
      <div onClick={this.onChoose}>
        {
          this.props.children
            ? this.props.children
            : <button>Open google chooser</button>
        }
      </div>
    )
  }
}
