const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    // Configure AWS SDK with your credentials
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCKEY,
        secretAccessKey: process.env.AWSS
    });

    try {
        // Parse the request body to get the Base64 encoded image
        const body = JSON.parse(event.body);
        const base64Image = body.image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Image, 'base64');

        // Define the key for the image to be saved in the S3 bucket
        const imageKey = `images/${uuidv4()}.png`;

        // Set up parameters for S3 upload
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: imageKey,
            Body: buffer,
            ContentType: 'image/png',
            ContentEncoding: 'base64' // necessary for decoding the Base64 image
        };

        // Upload the image to S3
        const s3Response = await s3.upload(uploadParams).promise();

        // Respond with the URL of the uploaded image
        return {
            statusCode: 200,
            body: JSON.stringify({ imageUrl: s3Response.Location })
        };
    } catch (error) {
        console.error('Error in downloadPitch function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred during the process' })
        };
    }
};

