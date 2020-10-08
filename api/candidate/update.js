"use strict";
const AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient(),
    Response = require('../common/ApiResponses'),
    TABLE_NAME = process.env.tableName;

// Function to update an Item in DB
module.exports.handler = async (event) => {
    const {organisationId, jobId, email} = event.pathParameters;
    const candidate = JSON.parse(event.body);
    candidate.updatedAt = new Date().toString();

    var updatedKeys = Object.keys(candidate);
    var updateExpression = "set " + updatedKeys.map(x => `${x} = :${x}`).join(", ");
    var expressionAttributeValues = {};
    updatedKeys.forEach((key) => {
        expressionAttributeValues[`:${key}`] = candidate[key]
    })
    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": `organisation#${organisationId}`,
            "sk": `apply#${jobId},email#${email}`
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    }

    try {
        await docClient.update(params).promise();
        return Response.success({
            message: "Updated successfully."
        });
    } catch (error) {
        console.log(error);
    }
}
