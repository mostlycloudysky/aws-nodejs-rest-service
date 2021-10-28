const axios = require('axios')
const aws = require('aws-sdk')
let response;
const secretManagerClient = new aws.SecretsManager();

exports.lambdaHandler = async (event, context) => {
    try {

        const result = await secretManagerClient.getSecretValue({
            SecretId: 'openweatherapi'
        }).promise()
    
        const openweatherAPI = JSON.parse(result.SecretString)
        // @ts-ignore
        const ret = await axios(`https://api.openweathermap.org/data/2.5/weather?zip=94040,us&appid=${openweatherAPI.openweatherapikey}`);
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

    return response
};
