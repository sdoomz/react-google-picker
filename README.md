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
              multiselect={true}
              navHidden={true}
              authImmediate={false}
              mimeTypes={['image/png', 'image/jpeg', 'image/jpg']}
              viewId={'DOCS'}>
   <MyCustomButton />
</GooglePicker>
```

Demo 
====
```
npm install
npm start  
open http://localhost:8080 
```

### [Don't forget to add new origins at console.developers.google.com](https://console.developers.google.com)

### Feel free to feel free
