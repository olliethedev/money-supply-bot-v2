import S3 from 'aws-sdk/clients/s3'
import fetch from 'node-fetch';

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'us-east-1'
})

export const uploadToBucket = async (file: any, fileName: string) => {
    const params ={
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: fileName,
        ContentEncoding: 'base64',
        ACL: 'public-read',
        ContentType:'image/jpeg',
        Body: file,
    }
    const response = await s3.upload(params).promise();
    return response.Location;
}

export const uploadFile = async (file: any, fileName: string) => {
    const url = await getUploadUrl(file, fileName)
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'ContentEncoding': 'base64',
            "Content-type": "image/jpeg",
            "Access-Control-Allow-Origin": "*"
        },
        body: file,
    })
    console.log({response});
    if(response.status !== 200) {
        throw new Error('Could not upload file')
    }
    return response.json()
}

const getUploadUrl = async (file: any, fileName: string) => {
    const params ={
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Expires: 10000,
        'ContentEncoding': 'base64',
        ACL: 'public-read',
        ContentType:'image/jpeg',
    }
    const url = await s3.getSignedUrlPromise('putObject', params)
    console.log({url});
    return url;
}