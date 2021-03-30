'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _loadScript = require('load-script');

var _loadScript2 = _interopRequireDefault(_loadScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global google */

var GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js';
var pickerNamespace = function pickerNamespace() {
  return window.google.picker;
};
var googleAPI = function googleAPI() {
  return window.gapi;
};

var scriptLoadingStarted = false;

var viewMap = exports.viewMap = {
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
};

var GoogleChooser = function (_React$Component) {
  _inherits(GoogleChooser, _React$Component);

  function GoogleChooser(props) {
    _classCallCheck(this, GoogleChooser);

    var _this = _possibleConstructorReturn(this, (GoogleChooser.__proto__ || Object.getPrototypeOf(GoogleChooser)).call(this, props));

    _this.onApiLoad = _this.onApiLoad.bind(_this);
    _this.onChoose = _this.onChoose.bind(_this);
    _this.buildView = _this.buildView.bind(_this);
    return _this;
  }

  _createClass(GoogleChooser, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.isGoogleReady()) {
        // google api is already exists
        // init immediately
        this.onApiLoad();
      } else if (!scriptLoadingStarted) {
        // load google api and the init
        scriptLoadingStarted = true;
        (0, _loadScript2.default)(GOOGLE_SDK_URL, this.onApiLoad);
      } else {
        // is loading
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.disposePicker();
    }
  }, {
    key: 'isGoogleReady',
    value: function isGoogleReady() {
      return !!googleAPI();
    }
  }, {
    key: 'isGoogleAuthReady',
    value: function isGoogleAuthReady() {
      return !!googleAPI().auth;
    }
  }, {
    key: 'isGooglePickerReady',
    value: function isGooglePickerReady() {
      return !!googleAPI().picker;
    }
  }, {
    key: 'onApiLoad',
    value: function onApiLoad() {
      googleAPI().load('auth');
      googleAPI().load('picker');
    }
  }, {
    key: 'doAuth',
    value: function doAuth(callback) {
      googleAPI().auth.authorize({
        client_id: this.props.clientId,
        scope: this.props.scope,
        immediate: this.props.authImmediate
      }, callback);
    }
  }, {
    key: 'onChoose',
    value: function onChoose() {
      var _this2 = this;

      if (!this.isGoogleReady() || !this.isGoogleAuthReady() || !this.isGooglePickerReady() || this.props.disabled) {
        return null;
      }

      var token = googleAPI().auth.getToken();
      var oauthToken = token && token.access_token;

      if (oauthToken) {
        this.createPicker(oauthToken);
      } else {
        this.doAuth(function (response) {
          if (response.access_token) {
            _this2.createPicker(response.access_token);
          } else {
            _this2.props.onAuthFailed(response);
          }
        });
      }
    }
  }, {
    key: 'buildView',
    value: function buildView(viewId) {
      var namespace = pickerNamespace();
      var className = viewMap[viewId] || 'View';

      return ['View', 'DocsView'].indexOf(className) !== -1 ? new namespace[className](namespace.ViewId[viewId]) : new namespace[className]();
    }
  }, {
    key: 'createPicker',
    value: function createPicker(oauthToken) {
      this.disposePicker();

      var _props = this.props,
          onAuthenticate = _props.onAuthenticate,
          createPicker = _props.createPicker;


      onAuthenticate(oauthToken);

      if (createPicker) {
        return createPicker(google, oauthToken);
      }

      var _props2 = this.props,
          viewId = _props2.viewId,
          mimeTypes = _props2.mimeTypes,
          query = _props2.query;

      var namespace = pickerNamespace();
      var view = this.buildView(viewId);

      if (!view) {
        throw new Error("Can't find view by viewId");
      }

      if (mimeTypes) {
        view.setMimeTypes(mimeTypes.join(','));
      }

      if (query) {
        view.setQuery(query);
      }

      var _props3 = this.props,
          developerKey = _props3.developerKey,
          onChange = _props3.onChange,
          origin = _props3.origin,
          navHidden = _props3.navHidden,
          multiselect = _props3.multiselect,
          customizePicker = _props3.customizePicker;


      var picker = new namespace.PickerBuilder().addView(view).setOAuthToken(oauthToken).setDeveloperKey(developerKey).setCallback(onChange);

      if (origin) {
        picker.setOrigin(origin);
      }

      if (navHidden) {
        picker.enableFeature(namespace.Feature.NAV_HIDDEN);
      }

      if (multiselect) {
        picker.enableFeature(namespace.Feature.MULTISELECT_ENABLED);
      }

      if (customizePicker) {
        customizePicker(picker, { namespace: namespace, view: view, buildView: this.buildView });
      }

      this.picker = picker.build().setVisible(true);
    }
  }, {
    key: 'disposePicker',
    value: function disposePicker() {
      if (this.picker) {
        this.picker.setVisible(true).dispose();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { onClick: this.onChoose },
        this.props.children || _react2.default.createElement(
          'button',
          null,
          'Open google chooser'
        )
      );
    }
  }]);

  return GoogleChooser;
}(_react2.default.Component);

GoogleChooser.propTypes = {
  children: _propTypes2.default.node,
  clientId: _propTypes2.default.string.isRequired,
  developerKey: _propTypes2.default.string,
  scope: _propTypes2.default.array,
  viewId: _propTypes2.default.string,
  query: _propTypes2.default.string,
  authImmediate: _propTypes2.default.bool,
  origin: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  onAuthenticate: _propTypes2.default.func,
  onAuthFailed: _propTypes2.default.func,
  createPicker: _propTypes2.default.func,
  customizePicker: _propTypes2.default.func,
  multiselect: _propTypes2.default.bool,
  navHidden: _propTypes2.default.bool,
  disabled: _propTypes2.default.bool
};
GoogleChooser.defaultProps = {
  onChange: function onChange() {},
  onAuthenticate: function onAuthenticate() {},
  onAuthFailed: function onAuthFailed() {},
  scope: ['https://www.googleapis.com/auth/drive.readonly'],
  viewId: 'DOCS',
  query: '',
  authImmediate: false,
  multiselect: false,
  navHidden: false,
  disabled: false
};
exports.default = GoogleChooser;