"use strict";
const AWS = require('aws-sdk'),
    uuid = require('uuid'),
    docClient = new AWS.DynamoDB.DocumentClient();

/** TABLE_NAME **/
const TABLE_NAME = "Candidates";

// Add a new candidate.
module.exports.create = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const newCandidate = {
            "pk": uuid.v1(),
            "organisationId": body.organisationId,
            "jobId": body.jobId,
            "firstName": body.firstName,
            "lastName": body.lastName,
            "email": body.email,
            "phone": body.phone,
            "createdAt": Date.now(),
            "updatedAt": Date.now(),
        };

        let params = {
            TableName: TABLE_NAME,
            Item: newCandidate
        }

        await docClient.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Candidate created successfully.",
                data: newCandidate
            }),
        };
    } catch (error) {
        console.log(error);
        return error;
    }
};

// Gathers a candidates information.
module.exports.read = async (event) => {
    const {pk} = event.pathParameters;

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": pk,
        }
    }

    try {
        let result = await docClient.get(params).promise();

        return {
            body: JSON.stringify({
                statusCode: result.Item ? 200 : 404,
                message: result.Item ? "Executed successfully." : "Object not found.",
                data: result.Item
            })
        }
    } catch (error) {
        console.log(error);
    }
}

// Function to update an Item in DB
module.exports.update = async (event) => {
    const {pk} = event.pathParameters;
    const body = JSON.parse(event.body);

    const candidate = {
        // "organisationId": body.organisationId,
        // "jobId": body.jobId,
        "firstName": body.firstName,
        "lastName": body.lastName,
        "email": body.email,
        "phone": body.phone,
        "updatedAt": Date.now(),
    };

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": pk,
        },
        UpdateExpression: "set firstName = :f, lastName = :l, email = :e, phone = :p, updatedAt = :u",
        ExpressionAttributeValues: {
            ":f": candidate.firstName,
            ":l": candidate.lastName,
            ":e": candidate.email,
            ":p": candidate.phone,
            ":u": candidate.updatedAt,
        }
    }

    try {
        await docClient.update(params).promise();
        return {
            body: JSON.stringify({
                message: "Updated successfully.",
            })
        }
    } catch (error) {
        console.log(error);
    }
}

// Function to Delete an item
module.exports.delete = async (event) => {
    const {pk} = event.pathParameters;

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": pk,
        }
    }

    await docClient.delete(params).promise();

    return {
        body: JSON.stringify({
            message: "Deleted successfully.",
        })
    }

}