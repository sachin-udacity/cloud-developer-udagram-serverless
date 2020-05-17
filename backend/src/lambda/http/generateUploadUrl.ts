import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { uploadImage } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId 
    const uploadUrl = await uploadImage(todoId);
    
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
