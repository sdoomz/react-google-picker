React google picker
===================
Simple react wrapper for [Google Picker API](https://developers.google.com/picker/docs/)

Installation
============
```
npm install react-google-picker
```

Usage
=====
```
<GooglePicker clientId={'your-client-id'}
              developerKey={'your-developer-key'}
              scope={['https://www.googleapis.com/auth/drive.readonly']}
              onChange={data => console.log('on change:', data)}
              onAuthFailed={data => console.log('on auth failed:', data)}
              multiselect={true}
              navHidden={true}
              authImmediate={false}
              mimeTypes={['image/png', 'image/jpeg', 'image/jpg']}
              query={'a query string like .txt or fileName'}
              viewId={'DOCS'}>
   <MyCustomButton />
</GooglePicker>
```

## Authentication token

You might want to get the Oauth token in order to use it later, for example
in order to [download the selected file](https://developers.google.com/drive/v3/web/manage-downloads).
You can do so by using `onAuthenticate`:

```
<GooglePicker clientId={'your-client-id'}
              developerKey={'your-developer-key'}
              scope={['https://www.googleapis.com/auth/drive.readonly']}
              onChange={data => console.log('on change:', data)}
              onAuthenticate={token => console.log('oauth token:', token)}
              onAuthFailed={data => console.log('on auth failed:', data)}
              multiselect={true}
              navHidden={true}
              authImmediate={false}
              mimeTypes={['image/png', 'image/jpeg', 'image/jpg']}
              viewId={'DOCS'}>
   <MyCustomButton />
</GooglePicker>
```

## Custom build method
You can override the default build function by passing your custom function which receives two arguments:
- `google`: a reference to the window.google object.
- `access_token`: which you will need to pass to `setOAuthToken` method.
```
<GooglePicker clientId={CLIENT_ID}
              developerKey={DEVELOPER_KEY}
              scope={SCOPE}
              onChange={data => console.log('on change:', data)}
              onAuthFailed={data => console.log('on auth failed:', data)}
              multiselect={true}
              navHidden={true}
              authImmediate={false}
              viewId={'FOLDERS'}
              createPicker={ (google, oauthToken) => {
                const googleViewId = google.picker.ViewId.FOLDERS;
                const docsView = new google.picker.DocsView(googleViewId)
                    .setIncludeFolders(true)
                    .setMimeTypes('application/vnd.google-apps.folder')
                    .setSelectFolderEnabled(true);

                const picker = new window.google.picker.PickerBuilder()
                    .addView(docsView)
                    .setOAuthToken(oauthToken)
                    .setDeveloperKey(DEVELOPER_KEY)
                    .setCallback(()=>{
                      console.log('Custom picker is ready!');
                    });

                picker.build().setVisible(true);
            }}
        >
            <span>Click</span>
            <div className="google"></div>
        </GooglePicker>
```
This example creates a picker which shows folders and you can select folders.

### Customize the pre-built picker
You can also simply further customize the picker that was built with the props you specified.
```
<GooglePicker clientId={CLIENT_ID}
              developerKey={DEVELOPER_KEY}
              scope={SCOPE}
              onChange={data => console.log('on change:', data)}
              onAuthFailed={data => console.log('on auth failed:', data)}
              authImmediate={false}
              viewId={'FOLDERS'}
              customizePicker={ (picker, namespace) => {
                // `picker` = the instance of `PickerBuilder` with all props opions applied
                // `namespace` = reference to `window.google.picker` namespace

                // Add additonal features
                picker.enableFeature(namespace.Feature.SIMPLE_UPLOAD_ENABLED)
                picker.enableFeature(namespace.Feature.SUPPORT_TEAM_DRIVES)
            }}
        >
            <span>Click</span>
            <div className="google"></div>
        </GooglePicker>
```
This example creates a picker which has uploading and team drives enabled.


Demo
====
```
npm install
npm start
open http://localhost:8080
```

### [Don't forget to add new origins at console.developers.google.com](https://console.developers.google.com)

### Feel free to feel free
