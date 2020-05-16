import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { createTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization;
  const authorizationParams = authorization.split(' ')
  const jwToken = authorizationParams[1]

  const newTodoItem = await createTodo(
    newTodo,
    jwToken
  );

  console.log('New todo item ', newTodoItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        newTodoItem
    })
  }
}
