const axios = require('axios')
const aws = require('aws-sdk')
let response;
const secretManagerClient = new aws.SecretsManager();
const sesClient = new aws.SES()

exports.lambdaHandler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
     
    const zipcode = event.queryStringParameters.zipcode
    const country = event.queryStringParameters.country

    try {

        const result = await secretManagerClient.getSecretValue({
            SecretId: 'openweatherapi'
        }).promise()
    
        const openweatherAPI = JSON.parse(result.SecretString)
        // @ts-ignore
        const ret = await axios(`https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},${country}&appid=${openweatherAPI.openweatherapikey}`);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Weather data from openweathermap',
                data: ret.data
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    // Send email using AWS SES
    const emailParams = {
        Source: 'ysandeepkumar88@gmail.com', 
        Destination: {
          ToAddresses: ['ysandeepkumar88@gmail.com'], 
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `${JSON.stringify(response)}`,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'AWS SES weather data - email',
          },
        },
    };

    await sesClient.sendEmail(emailParams).promise()

    return response
};
