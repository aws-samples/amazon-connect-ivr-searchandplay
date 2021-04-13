const amplifyconfig = {
    Auth: {
        identityPoolId: '123',
        region: 'ap-southeast-2',
        userPoolId: '123',
        userPoolWebClientId: '123',
        mandatorySignIn: true,
        oauth: {
          domain: 'callrecording.auth.ap-southeast-2.amazoncognito.com',
          scope: ['phone', 'email', 'profile', 'openid'],
          redirectSignIn : window.location.protocol + '//' + window.location.host,
          redirectSignOut : window.location.protocol + '//' + window.location.host,
          responseType: 'code'
        }
    },
    API: {
        endpoints: [
            {
                name: "connectapi",
                endpoint: "<api_endpoint>",
                region: 'ap-southeast-2'
            }
        ]
    }
}

export default amplifyconfig;
