require("dotenv").config();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET
        });
        const body = JSON.parse(event.body);
        const base64String = body.image;
        const buffer = Buffer.from(base64String, 'base64');

        const imageKey = `images/${uuidv4()}.jpg`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: imageKey,
            Body: buffer,
            ContentType: 'image/jpeg'
        };

        const s3Response = await s3.upload(uploadParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ imageUrl: s3Response.Location })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred' })
        };
    }
};
