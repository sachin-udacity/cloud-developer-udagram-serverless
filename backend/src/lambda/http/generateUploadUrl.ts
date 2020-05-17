import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { uploadImage } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId 
    const authorization = event.headers.Authorization;
    const authorizationParams = authorization.split(' ')
    const jwToken = authorizationParams[1]
    const uploadUrl = await uploadImage(jwToken, todoId);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
}
