"use strict";
const AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient(),
    Response = require('../common/ApiResponses'),
    TABLE_NAME = process.env.tableName;

// Gathers a candidates information.
module.exports.handler = async (event) => {
    const {organisationId, jobId, email} = event.pathParameters;

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": `organisation#${organisationId}`,
            "sk": `apply#${jobId},email#${email}`
        }
    }

    try {
        let result = await docClient.get(params).promise();

        if (result.Item) {
            return Response.success({
                message: "Executed successfully.",
                data: result.Item
            });
        }

        return Response.error({
            message: "Object not found."
        });

    } catch (error) {
        console.log(error);
    }
}
