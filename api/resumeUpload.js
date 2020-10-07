const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const mime = require('mime-types')
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.tableName;

exports.handler = async (event) => {
    const {organisationId, jobId, email} = event.pathParameters;

    // Extract file content
    let fileContent = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    // Generate file name from current timestamp
    let fileName = `${Date.now()}`;

    // Determine file extension
    let contentType = event.headers['content-type'] || event.headers['Content-Type'];
    let extension = contentType ? mime.extension(contentType) : '';

    let fullFileName = extension ? `${fileName}.${extension}` : fileName;

    ///////

    const candidate = {};
    candidate.updatedAt = new Date().toString();
    candidate.resumeFile = fullFileName;

    var updatedKeys = Object.keys(candidate);
    var updateExpression = "set "+ updatedKeys.map(x => `${x} = :${x}`).join(", ");
    var expressionAttributeValues = {};
    updatedKeys.forEach((key)=>{
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

    ///////

    // Upload the file to S3
    try {
        let data = await s3.putObject({
            Bucket: process.env.fileUploadBucket,
            Key: fullFileName,
            Body: fileContent,
            Metadata: {}
        }).promise();

        console.log("Successfully uploaded file", fullFileName);
        await docClient.update(params).promise();
        return {
            body: JSON.stringify({
                message: "Successfully uploaded",
            })
        };

    } catch (err) {
        console.log("Failed to upload file", fullFileName, err);
        throw err;
    }
};



/////


