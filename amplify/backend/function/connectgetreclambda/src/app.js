var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION });
process.env.TZ = 'Australia/Sydney';
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'connectrecordings', localtime: new Date().toString()});
const cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'})

var targetTable = "connectRecordings";
var documentClient = new AWS.DynamoDB.DocumentClient();

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.get('/recordings', async (req, res, next) => {

  var telephoneNumber = req.query.pn;
  var dateRangeStart = req.query.d1;
  var dateRangeEnd = req.query.d2;
  var accountNumber = req.query.acct;
  var sessionId = req.query.session;
  var recent = req.query.recent;
  var data = null;
  var params = null;

  console.log("Request :", req);
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




  switch(true){



  // Search with Telephone Number only
  case (!isEmpty(telephoneNumber) && isEmpty(dateRangeStart)  && isEmpty(dateRangeEnd)):
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  console.log("Search by Telephone Number only :", telephoneNumber );
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Telephone Number :",
            telephoneNumber );
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "telephoneNumber-index",
    KeyConditionExpression: "cli = :tn",
    ExpressionAttributeValues: {
      ':tn': telephoneNumber
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  // Search with Telephone Number within the date range
  case (!isEmpty(telephoneNumber) && !isEmpty(dateRangeStart)  && !isEmpty(dateRangeEnd)):
  console.log("Search by Telephone Number within the date range :", telephoneNumber, dateRangeStart, dateRangeEnd);
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Telephone Number :",
            telephoneNumber , " and Date Range: from ", dateRangeStart, " to ", dateRangeEnd );
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "telephoneNumber-index",
    KeyConditionExpression: "cli = :tn and startDateTime between :d1 and :d2",
    ExpressionAttributeValues: {
      ':tn': telephoneNumber,
      ':d1': dateRangeStart,
      ':d2': dateRangeEnd
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  // Search with Account Number only
  case (!isEmpty(accountNumber) && isEmpty(dateRangeStart)  && isEmpty(dateRangeEnd)):
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Account Number :",
            accountNumber );
  console.log("Search by Account Number only :", accountNumber );
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "accountNumber-index",
    KeyConditionExpression: "accountNumber = :acct",
    ExpressionAttributeValues: {
      ':acct': accountNumber
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

   // Search with Account Number within the date range
  case (!isEmpty(accountNumber) && !isEmpty(dateRangeStart)  && !isEmpty(dateRangeEnd)):
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Account Number :",
            accountNumber , " and Date Range: from ", dateRangeStart, " to ", dateRangeEnd );
  console.log("Search by Account Number within the date range :", accountNumber, dateRangeStart, dateRangeEnd);
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "accountNumber-index",
    KeyConditionExpression: "accountNumber = :acct and startDateTime between :d1 and :d2",
    ExpressionAttributeValues: {
      ':acct': accountNumber,
      ':d1': dateRangeStart,
      ':d2': dateRangeEnd
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  // Search with Session Id only
  case (!isEmpty(sessionId) && isEmpty(dateRangeStart)  && isEmpty(dateRangeEnd)):
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Session Id :",
            sessionId );
  console.log("Search by Session Id only :", sessionId );
  params = {
    TableName: targetTable,
    Limit : 50,
    KeyConditionExpression: "sessionId = :sid",
    ExpressionAttributeValues: {
      ':sid': sessionId
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

   // Search with Session Id within the date range
  case (!isEmpty(sessionId) && !isEmpty(dateRangeStart)  && !isEmpty(dateRangeEnd)):
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  log.info("Audit Event :", foundUser, "performed Call Recoding Search by using Session Id :",
            sessionId , " and Date Range: from ", dateRangeStart, " to ", dateRangeEnd );
  console.log("Search by Session Id within the date range :", sessionId, dateRangeStart, dateRangeEnd);
  params = {
    TableName: targetTable,
    Limit : 50,
    KeyConditionExpression: "sessionId = :sid and startDateTime between :d1 and :d2",
    ExpressionAttributeValues: {
      ':sid': sessionId,
      ':d1': dateRangeStart,
      ':d2': dateRangeEnd
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  // Blanket Search within date range
  case (recent = "1" && !isEmpty(dateRangeStart)  && !isEmpty(dateRangeEnd)):
  log.info("Audit Event :", foundUser, "performed Call Recoding Blanket Search by Date Range: from ",
            dateRangeStart, " to ", dateRangeEnd );
  console.log("Blanket Search within date range:",  dateRangeStart, dateRangeEnd );
  dateRangeStart = dateRangeStart += "T00:00:00.000Z";
  dateRangeEnd = dateRangeEnd += "T23:59:59.999Z";
  console.log("search range ", dateRangeStart, dateRangeEnd);
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "key-startDateTime-index",
    KeyConditionExpression: "dummykey = :dummykey and startDateTime between :d1 and :d2",
    ExpressionAttributeValues: {
      ':dummykey': "123",
      ':d1': dateRangeStart,
      ':d2': dateRangeEnd
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  default:
  // Balnket Search
  log.info("Audit Event :", foundUser, "performed Call Recoding Blanket Search that returns most recent 50 calls" );
	console.log('Balnket Search');
  console.log("Blanket Search :",  dateRangeStart, dateRangeEnd );
  var today = new Date();
  var datetime = new Date();
  datetime.setDate(today.getDate()+5);
  console.log("search range ", datetime.toISOString());
  params = {
    TableName: targetTable,
    Limit : 50,
    IndexName: "key-startDateTime-index",
    KeyConditionExpression: "dummykey = :dummykey and startDateTime < :d1",
    ExpressionAttributeValues: {
      ':dummykey': "123",
      ':d1': datetime.toISOString()
    },
    ScanIndexForward: false
  };
  data = await documentClient.query(params).promise();
  break;

  }


  res.json(data.Items);

});

app.listen(3000, function () {
  console.log("App started");
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = app;
