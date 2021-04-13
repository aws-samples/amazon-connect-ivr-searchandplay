'use strict';
const targetTable = 'connectRecordings';
const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({params: {TableName: targetTable}});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
	//logger.info("Testing Logger");
	console.log('Event received');
	console.log('Destination table: ', targetTable);
  event.Records.forEach((eventRecord) => {
    console.log('Stream record: ', JSON.stringify(eventRecord, null, 2));

    if (eventRecord.eventName !== 'INSERT') {
    	console.log('Not an INSERT operation. Skipping record');
    	//continue;
    }

		const record = eventRecord.dynamodb.NewImage;
  	//const insertedRecord = record;
  	switch(true){

  		// Initial session recording
  		case (record.eventName.S == "session" && record.eventType.S == "start"):
  			console.log("Event Type: New session");
  			//console.log('Stream record: ', JSON.stringify(record, null, 2));
	    	var newRecord = {
	    	   Item: {
						sessionId: {S: record.sessionId.S},
						startDateTime: {S: record.eventTime.S},
						callflowName: {S: record.callflowName.S},
						connectId: {S: record.connectId.S},
						recordingPath: {S: record.recordingPath.S},
						cli: {S: record.cli.S},
						did: {S: record.did.S},
						ctiIn: {S: record.ctiIn.S},
						ctiId: {S: record.ctiId.S},
						dummykey: {S: "123"}
					}
	    	};
  			console.log("Saving record ", JSON.stringify(newRecord, null, 2));
  			// Call DynamoDB to add the item to the table
			DDB.putItem(newRecord, function(err, data) {
			  if (err) {
			    console.log("Error", err);
			  } else {
			    console.log("Success", data);
			  }
			});
			//	DDB.putItem(newRecord);
	    	break;

	    // Auth complete. have account details
  		case (record.eventName.S == "auth" && record.eventType.S == "end"):
  			console.log("Event Type: AuthEnd");
  			console.log("sessionId : ", record.sessionId);

  			var params = {
			    TableName: targetTable,
			    KeyConditionExpression: "sessionId = :id",
    			ExpressionAttributeValues: {
    				':id': record.sessionId.S
    			}
			};

		 docClient.query(params, function(err, data) {
			    if (err)
			        console.log(JSON.stringify(err, null, 2));
			    else {
			        console.log(JSON.stringify(data, null, 2));
			        record.startDateTime = data.Items[0].startDateTime;
			        console.log("myStartDateTime : ", data.Items[0]);
			        console.log("myStartDateTime : ", data.Items[0].startDateTime);

			        var updateParams = {
				    UpdateExpression: "SET accountNumber = :n, accountJurisdiction = :j",
					ExpressionAttributeValues: {
					 ":n": { S: record.accountNumber.S },
					 ":j": { S: record.accountJurisdiction.S }
					},
					Key: { sessionId : { S: record.sessionId.S },
					 startDateTime : { S: record.startDateTime}},
					ReturnValues: "NONE",
					TableName: targetTable
				    };

					console.log("Updating record ", JSON.stringify(updateParams, null, 2));
			    	//DDB.updateItem(params);
			    	DDB.updateItem(updateParams, function(err, data) {
					  if (err) {
					    console.log("Error", err);
					  } else {
					    console.log("Success", data);
					  }
					});
			    	}
				});
	    	break;

	    // End of CTI Flow. have purecloudid
  		case (record.eventName.S == "cti" && record.eventType.S == "end"):
  			console.log("Event Type: CTI Flow");
  			console.log("sessionId : ", record.sessionId.S);

  			var params = {
			    TableName: targetTable,
			    KeyConditionExpression: "sessionId = :id",
    			ExpressionAttributeValues: {
    				':id': record.sessionId.S
    			}
			};

		 docClient.query(params, function(err, data) {
			    if (err)
			        console.log(JSON.stringify(err, null, 2));
			    else {
			        console.log(JSON.stringify(data, null, 2));
			        record.startDateTime = data.Items[0].startDateTime;
			        console.log("myStartDateTime : ", data.Items[0]);
			        console.log("myStartDateTime : ", data.Items[0].startDateTime);

			        var updateParams = {
				    UpdateExpression: "SET purecloudId = :p",
					ExpressionAttributeValues: {
					 ":p": { S: record.purecloudId.S}
					},
					Key: { sessionId : { S: record.sessionId.S },
					 startDateTime : { S: record.startDateTime}},
					ReturnValues: "NONE",
					TableName: targetTable
				    };

					console.log("Updating record ", JSON.stringify(updateParams, null, 2));
			    	//DDB.updateItem(params);
			    	DDB.updateItem(updateParams, function(err, data) {
					  if (err) {
					    console.log("Error", err);
					  } else {
					    console.log("Success", data);
					  }
					});
			    	}
				});
	    	break;

	    // Session end. Have endReason
  		case (record.eventName.S == "conversationRequest" && record.eventType.S == "end"):
  			console.log("Event Type: Session End");
  			console.log("sessionId : ", record.sessionId.S);

  			var params = {
			    TableName: targetTable,
			    KeyConditionExpression: "sessionId = :id",
    			ExpressionAttributeValues: {
    				':id': record.sessionId.S
    			}
			};

		 docClient.query(params, function(err, data) {
			    if (err)
			        console.log(JSON.stringify(err, null, 2));
			    else {
			        console.log(JSON.stringify(data, null, 2));
			        record.startDateTime = data.Items[0].startDateTime;
			        console.log("myStartDateTime : ", data.Items[0]);
			        console.log("myStartDateTime : ", data.Items[0].startDateTime);

			        var updateParams = {
				    UpdateExpression: "SET endReason = :r",
					ExpressionAttributeValues: {
					 ":r": { S: record.endReason.S}
					},
					Key: { sessionId : { S: record.sessionId.S },
					 startDateTime : { S: record.startDateTime}},
					ReturnValues: "NONE",
					TableName: targetTable
				    };

					console.log("Updating record ", JSON.stringify(updateParams, null, 2));
			    	//DDB.updateItem(params);
			    	DDB.updateItem(updateParams, function(err, data) {
					  if (err) {
					    console.log("Error", err);
					  } else {
					    console.log("Success", data);
					  }
					});
			    	}
				});
	    	break;


	    default:
	    	console.log('Inserted record didnt match an logic conditions. Skipping record');
	    	//continue;
	  } // switch
  });
  callback(null, `Successfully processed ${event.Records.length} records.`);
};
