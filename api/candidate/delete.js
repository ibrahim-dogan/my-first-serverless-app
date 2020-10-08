"use strict";
const AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient(),
    Response = require('../common/ApiResponses'),
    TABLE_NAME = process.env.tableName;


// Function to Delete an item
module.exports.handler = async (event) => {
    const {organisationId, jobId, email} = event.pathParameters;

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": `organisation#${organisationId}`,
            "sk": `apply#${jobId},email#${email}`
        }
    }

    await docClient.delete(params).promise();

    return Response.success({
        message: "Deleted successfully."
    });

}