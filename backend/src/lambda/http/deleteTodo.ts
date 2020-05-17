import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization;
    const authorizationParams = authorization.split(' ')
    const jwToken = authorizationParams[1]
    await deleteTodo(jwToken, todoId);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
}
