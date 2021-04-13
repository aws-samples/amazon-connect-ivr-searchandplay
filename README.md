# Call Recording Overview
Wagering IVR provides the capability for users to Search and Play IVR call recordings


# Call Recording Deployment Layers

The Call Recording application can be broken down into 3 distinctive layers which work together to provide a functioning application.

## Identity
Deploys the Identity layer which uses Cognito - [Cognito](./cfn/cognito)<br>
This layer provides the Amazon Cognito configuration to service the application. The configuration enables integration with an deployed ADFS instance.

When Cognito has been deployed the below AWS resource IDs will be requried to for the FrontEnd Deployment.

1. Cognito Domain
2. Cognito Client ID
3. Cognito User Pool ID

## Data
Deploy the back database layer which is based on DynamoDB - [DynamoDB Data Layer](./cfn/ddb)<br>
This layer provides the data layer of the Call Recroding application. 
The AWS resources that are defined within this layer are:

- DynamoDB Lambda function to read from DynamoDB Stream from the Conversational engine DynamoDB table. This function will then write the required attributes to a defined DynamoDB table
- DynamoDB table to host the specific data attributes which the Lambda Stream reader function will write into it.
The Call Recording UI will query the secondary DynamoDB table

## Core
Deploy the UI, API and the Function required for the application - [Repository Root](./)<br>
This layer will provide the remaining AWS components:

- Call Recording REACT UI
- Call Recording APIs
- Call Recording Lambda functions

This layer is deployed using the AWS Amplify Framework

[AWS Amplify Quick Start](https://aws-amplify.github.io/docs/cli-toolchain/quickstart)

[AWS Amplify Getting Started](https://aws-amplify.github.io/docs/js/start)

### Update amplify-config.js
This file needs to be updated with attribute ids from the Cognito Identtity Deployment.

The file is located in ./src/amplify-config.js

```
identityPoolId: 
    This is the Cognito IdentityPoolID
userPoolId: 
    This is the Cognito User Pool ID
userPoolWebClientId: 
    This is the Cognito Web Client ID
domain: 
    This is the Cognito Dommain defined
```

#### Hosting
For the purpose of this application S3 and Cloudfront have been used to host the REACT UI. The REACT UI can be also hosted within a container or on an EC2 instance if required.

#### API
AWS API Gateway is used to expose the required APIs that the REACT UI calls

#### Functions
AWS Lambda is used to query the DynamoDB table




# REACT APP

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
