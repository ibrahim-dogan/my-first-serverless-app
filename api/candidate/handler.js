"use strict";
const AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient();

/** TABLE_NAME **/
const TABLE_NAME = process.env.tableName;
const Response = require('../common/ApiResponses')

// Add a new candidate.
module.exports.create = async (event) => {
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

// Gathers a candidates information.
module.exports.read = async (event) => {
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

        if (result.Item){
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

// Function to update an Item in DB
module.exports.update = async (event) => {
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

// Function to Delete an item
module.exports.delete = async (event) => {
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