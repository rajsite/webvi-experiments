# Wrapping a WebVI as a Native iOS or Android Application

You can use third party tools wrap a WebVI in a thin application shell so that users can install it on their mobile device home screen. This example includes instructions for doing this with the [Capacitor](https://capacitorjs.com/) project.

This approach is useful if you want the app to feel "native" (access to device capabilities and installed via an app store). Progressive Web Apps offer an alternative approach that's simpler to develop but slightly less native.

# Prerequisites
Capacitor works by emitting a project that you can build with the platform's native app development toolchain. This means you'll need to install that toolchain on your development computer and may need to refer to developer training materials from iOS or Android to understand the build workflow and to troubleshoot problems.

Here are some of the components needed for app development:
**iOS**: A Mac with the Xcode development environment or an account with a third party service that builds in the cloud. Publishing to the App Store requires a paid Apple Developer account. Apple also offers [ways to distribute apps to a limited set of users](https://help.apple.com/xcode/mac/current/#/devac02c5ab8).
**Android**: A computer with Android Studio and the Android SDK. Publishing to the Google Play Store requires a Google Developer Account.

# Web VI Best Practices
## Connecting to data
You should consider what services your WebVI will communicate with to display data. Options include:
1. Sources available from the public internet (but secured with an API key)
   1. Tags or Messages on SystemLink Cloud
   1. Web Services on a public server
1. Sources available on NI Web Server from your Local Area Network (LAN)
    1. Tags or Messages on SystemLink Server
    1. Web Services on NI Web Server

The app bundle that Capacitor creates includes all of the files generated when you build a WebVI. Capacitor hosts these files on a web server contained within the app. This means that the WebVI will only have access to network resources that are accessible from the mobile device where the app is running.

If your data is available on your LAN you may experience CORS errors when accessing it from the Capacitor application. See the [CORS Errors documentation](https://ionicframework.com/docs/troubleshooting/cors) from Capacitor for suggestions to resolve these.

For more details on this topic, see [Communicating Data with a Web Application](https://www.ni.com/documentation/en/labview-web-module/latest/manual/communicate-data-web-application/).

## Use flexible layout for the WebVI panel
Since the WebVI panel may be presented on screens of different sizes, you should strongly consider setting the WebVI panel to use Flexible Layout. This will automatically adjust the size and position of objects on the panel in response to the size of the screen on which it's displayed.

# Steps
1. Install software
1. Create a WebVI
1. Build the WebVI and locate the build output
1. Create a new Capacitor project
1. Initialize the NPM project
1. Copy the WebVI build output to the `www` directory
1. Generate iOS and Android applications
1. Build iOS and Android applications
1. Publish

1. Update 
1. Call native APIs using JSLI

using their APIs
Investigate cloud service from ioniq
Cordova serve from server. Maybe call APIs
electron
rajsite? ni? self hosted?
need additional experience. this is an example
disable web security in browser within app. https://ionicframework.com/docs/troubleshooting/cors