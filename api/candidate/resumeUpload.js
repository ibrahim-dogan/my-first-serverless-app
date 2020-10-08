"use strict";
const AWS = require('aws-sdk'),
    mime = require('mime-types'),
    docClient = new AWS.DynamoDB.DocumentClient(),
    s3 = new AWS.S3(),
    Response = require('../common/ApiResponses'),
    TABLE_NAME = process.env.tableName;

exports.handler = async (event) => {
    const {organisationId, jobId, email} = event.pathParameters;

    // Extract file content
    let fileContent = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    // Generate file name from current timestamp
    let fileName = `${Date.now()}`;

    // Determine file extension
    let contentType = event.headers['content-type'] || event.headers['Content-Type'];
    let extension = contentType ? mime.extension(contentType) : '';

    if (false === ['pdf', 'doc', 'docx'].includes(extension)) {
        return Response.error({message: `Unsupported content type ${extension}`})
    }

    let fullFileName = extension ? `${fileName}.${extension}` : fileName;

    let params = {
        TableName: TABLE_NAME,
        Key: {
            "pk": `organisation#${organisationId}`,
            "sk": `apply#${jobId},email#${email}`
        },
        UpdateExpression: "set resumeFile = :r, updatedAt = :u",
        ExpressionAttributeValues: {":r": fullFileName, ":u": new Date().toString()}
    }

    // Upload the file to S3 & update candidate
    try {
        await s3.putObject({
            Bucket: process.env.resumeUploadBucket,
            Key: fullFileName,
            Body: fileContent,
            Metadata: {}
        }).promise();

        await docClient.update(params).promise();

        return Response.success({
            message: "Resume uploaded successfully."
        })

    } catch (err) {
        console.log("Failed to upload file", fullFileName, err);
        throw err;
    }
};

