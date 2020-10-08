"use strict";
const AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient(),
    Response = require('../common/ApiResponses'),
    TABLE_NAME = process.env.tableName;

// Add a new candidate.
module.exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const newCandidate = {
            "pk": body.pk,
            "sk": body.sk,
            "firstName": body.firstName,
            "lastName": body.lastName,
            "email": body.email,
            "phone": body.phone,
            "createdAt": new Date().toString(),
            "updatedAt": new Date().toString(),
        };

        let params = {
            TableName: TABLE_NAME,
            Item: newCandidate
        }

        await docClient.put(params).promise();

        return Response.success({
            message: "Candidate created successfully.",
            data: newCandidate
        });

    } catch (error) {
        console.log(error);
        return error;
    }
};