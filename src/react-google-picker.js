/* global google */

import React from 'react'
import PropTypes from 'prop-types'
import loadScript from 'load-script'

const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js'
const pickerNamespace = () => window.google.picker
const googleAPI = () => window.gapi

let scriptLoadingStarted = false

export const viewMap = {
  DOCS: 'DocsView',
  DOCS_IMAGES: 'DocsView',
  DOCUMENTS: 'DocsView',
  PRESENTATIONS: 'DocsView',
  SPREADSHEETS: 'DocsView',
  FORMS: 'DocsView',
  DOCS_IMAGES_AND_VIDEOS: 'DocsView',
  DOCS_VIDEOS: 'DocsView',
  FOLDERS: 'DocsView',
  PDFS: 'DocsView',
  IMAGE_SEARCH: 'ImageSearchView',
  MAPS: 'MapsView',
  PHOTOS: 'PhotosView',
  PHOTO_ALBUMS: 'PhotoAlbumsView',
  VIDEO_SEARCH: 'VideoSearchView',
  WEBCAM: 'WebCamView',
  // no view ID for `DocsUploadView`
  DocsUploadView: 'DocsUploadView'
}

export default class GoogleChooser extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    clientId: PropTypes.string.isRequired,
    developerKey: PropTypes.string,
    scope: PropTypes.array,
    viewId: PropTypes.string,
    query: PropTypes.string,
    authImmediate: PropTypes.bool,
    origin: PropTypes.string,
    onChange: PropTypes.func,
    onAuthenticate: PropTypes.func,
    onAuthFailed: PropTypes.func,
    createPicker: PropTypes.func,
    customizePicker: PropTypes.func,
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
    query: '',
    authImmediate: false,
    multiselect: false,
    navHidden: false,
    disabled: false
  }

  constructor (props) {
    super(props)

    this.onApiLoad = this.onApiLoad.bind(this)
    this.onChoose = this.onChoose.bind(this)
    this.buildView = this.buildView.bind(this)
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

  componentWillUnmount () {
    this.disposePicker()
  }

  isGoogleReady () {
    return !!googleAPI()
  }

  isGoogleAuthReady () {
    return !!googleAPI().auth
  }

  isGooglePickerReady () {
    return !!googleAPI().picker
  }

  onApiLoad () {
    googleAPI().load('auth')
    googleAPI().load('picker')
  }

  doAuth (callback) {
    googleAPI().auth.authorize({
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

    const token = googleAPI().auth.getToken()
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

  buildView (viewId) {
    const namespace = pickerNamespace()
    const className = viewMap[viewId] || 'View'

    return [ 'View', 'DocsView' ].indexOf(className) !== -1
      ? new namespace[className](namespace.ViewId[viewId])
      : new namespace[className]()
  }

  createPicker (oauthToken) {
    this.disposePicker()

    const { onAuthenticate, createPicker } = this.props

    onAuthenticate(oauthToken)

    if (createPicker) {
      return createPicker(google, oauthToken)
    }

    const { viewId, mimeTypes, query } = this.props
    const namespace = pickerNamespace()
    const view = this.buildView(viewId)

    if (!view) {
      throw new Error("Can't find view by viewId")
    }

    if (mimeTypes) {
      view.setMimeTypes(mimeTypes.join(','))
    }

    if (query) {
      view.setQuery(query)
    }

    const { developerKey, onChange, origin, navHidden, multiselect, customizePicker } = this.props

    const picker = new namespace.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(developerKey)
      .setCallback(onChange)

    if (origin) {
      picker.setOrigin(origin)
    }

    if (navHidden) {
      picker.enableFeature(namespace.Feature.NAV_HIDDEN)
    }

    if (multiselect) {
      picker.enableFeature(namespace.Feature.MULTISELECT_ENABLED)
    }

    if (customizePicker) {
      customizePicker(picker, { namespace, view, buildView: this.buildView })
    }

    this.picker = picker.build().setVisible(true)
  }

  disposePicker () {
    if (this.picker) {
      this.picker.setVisible(true).dispose()
    }
  }

  render () {
    return (
      <div onClick={this.onChoose}>
        {this.props.children || <button>Open google chooser</button>}
      </div>
    )
  }
}
