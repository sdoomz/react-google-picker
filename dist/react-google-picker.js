'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _loadScript = require('load-script');

var _loadScript2 = _interopRequireDefault(_loadScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js';

var scriptLoadingStarted = false;

var GoogleChooser = function (_React$Component) {
  _inherits(GoogleChooser, _React$Component);

  function GoogleChooser(props) {
    _classCallCheck(this, GoogleChooser);

    var _this = _possibleConstructorReturn(this, (GoogleChooser.__proto__ || Object.getPrototypeOf(GoogleChooser)).call(this, props));

    _this.onApiLoad = _this.onApiLoad.bind(_this);
    _this.onChoose = _this.onChoose.bind(_this);
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
    key: 'isGoogleReady',
    value: function isGoogleReady() {
      return !!window.gapi;
    }
  }, {
    key: 'isGoogleAuthReady',
    value: function isGoogleAuthReady() {
      return !!window.gapi.auth;
    }
  }, {
    key: 'isGooglePickerReady',
    value: function isGooglePickerReady() {
      return !!window.google.picker;
    }
  }, {
    key: 'onApiLoad',
    value: function onApiLoad() {
      window.gapi.load('auth');
      window.gapi.load('picker');
    }
  }, {
    key: 'doAuth',
    value: function doAuth(callback) {
      window.gapi.auth.authorize({
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

      var token = window.gapi.auth.getToken();
      var oauthToken = token && token.access_token;

      if (oauthToken) {
        this.createPicker(oauthToken);
      } else {
        this.doAuth(function (_ref) {
          var access_token = _ref.access_token;
          return _this2.createPicker(access_token);
        });
      }
    }
  }, {
    key: 'createPicker',
    value: function createPicker(oauthToken) {

      this.props.onAuthenticate(oauthToken);

      if (this.props.createPicker) {
        return this.props.createPicker(google, oauthToken);
      }

      var googleViewId = google.picker.ViewId[this.props.viewId];
      var view = new window.google.picker.View(googleViewId);

      if (this.props.mimeTypes) {
        view.setMimeTypes(this.props.mimeTypes.join(','));
      }

      if (!view) {
        throw new Error('Can\'t find view by viewId');
      }

      var picker = new window.google.picker.PickerBuilder().addView(view).setOAuthToken(oauthToken).setDeveloperKey(this.props.developerKey).setCallback(this.props.onChange);

      if (this.props.origin) {
        picker.setOrigin(this.props.origin);
      }

      if (this.props.navHidden) {
        picker.enableFeature(window.google.picker.Feature.NAV_HIDDEN);
      }

      if (this.props.multiselect) {
        picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
      }

      picker.build().setVisible(true);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { onClick: this.onChoose },
        this.props.children ? this.props.children : _react2.default.createElement(
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
  children: _react2.default.PropTypes.node,
  clientId: _react2.default.PropTypes.string.isRequired,
  developerKey: _react2.default.PropTypes.string.isRequired,
  scope: _react2.default.PropTypes.array,
  viewId: _react2.default.PropTypes.string,
  authImmediate: _react2.default.PropTypes.bool,
  origin: _react2.default.PropTypes.string,
  onChange: _react2.default.PropTypes.func,
  onAuthenticate: _react2.default.PropTypes.func,
  createPicker: _react2.default.PropTypes.func,
  multiselect: _react2.default.PropTypes.bool,
  navHidden: _react2.default.PropTypes.bool,
  disabled: _react2.default.PropTypes.bool
};
GoogleChooser.defaultProps = {
  onChange: function onChange() {},
  onAuthenticate: function onAuthenticate() {},
  scope: ['https://www.googleapis.com/auth/drive.readonly'],
  viewId: 'DOCS',
  authImmediate: false,
  multiselect: false,
  navHidden: false,
  disabled: false
};
exports.default = GoogleChooser;