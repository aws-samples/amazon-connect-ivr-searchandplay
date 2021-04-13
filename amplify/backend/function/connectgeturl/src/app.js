var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION });
process.env.TZ = 'Australia/Sydney';
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'connectrecordings', localtime: new Date().toString()});
const cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'})


var documentClient = new AWS.DynamoDB.DocumentClient();

var s3 = new AWS.S3({
    signatureVersion: 'v4',
});
const parse = require('url').parse;


// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.get('/url', async (req, res, next) => {

  console.log("Session Id :", req.query.id);

  // Audit Logging
  var foundUser = "Anonymous User";
  const authProvider = req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider;
  if (!isEmpty(authProvider)) {
    const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/

    const [,, userPoolId, userSub] = authProvider.match(IDP_REGEX);

    var filter = `sub="${userSub}"`
    var userparams = {
          "Filter": filter,
          "UserPoolId": userPoolId
    };

    let listData = await cognito.listUsers(userparams).promise();
    foundUser = listData.Users[0].Username;
    console.log("user found :", listData.Users[0]);
  }

  var params = {
    TableName: 'connectRecordings',
    KeyConditionExpression: "sessionId = :id",
    ExpressionAttributeValues: {
      ':id': req.query.id
    }
  };
  const data = await documentClient.query(params).promise();
  const recordingPath = data.Items[0].recordingPath;
  const accountNumber = data.Items[0].accountNumber;
  console.log("Recording Path :", recordingPath);

  const uri = parse(recordingPath);
  const key = uri.pathname.slice(1);
  const bucket =  uri.hostname.split('.')[0];
  console.log("Bucket :", bucket);
  console.log("Object :", key);
  const url = s3.getSignedUrl('getObject', {
		Bucket: bucket,
		Key: key,
		Expires: 900
	});
  console.log(url);
  log.info("Audit Event :", foundUser, "played or downloaded Call Recording for Account Number :",
            accountNumber, " Call Recording location : ", recordingPath );
  res.json(url);
});

app.get('/url/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = app
