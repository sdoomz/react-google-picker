import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import GooglePicker from '../';

const CLIENT_ID = '206339496672-eie1j7vvr0plioslt41l2qsddmdjloqj.apps.googleusercontent.com';
const DEVELOPER_KEY = 'AIzaSyChPXI8ByCl68kcpy0zwjrfjEc_8mtwH_w';
const SCOPE = ['https://www.googleapis.com/auth/drive.readonly'];

function App() {
  return (
    <div className="container">
      <GooglePicker clientId={CLIENT_ID}
                    developerKey={DEVELOPER_KEY}
                    scope={SCOPE}
                    onChange={data => console.log('on change:', data)}
                    multiselect={true}
                    navHidden={true}
                    authImmediate={false}
                    mimeTypes={['image/png', 'image/jpeg', 'image/jpg']}
                    viewId={'DOCS'}>
        <span>Click me!</span>
        <div className="google"></div>
      </GooglePicker>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));