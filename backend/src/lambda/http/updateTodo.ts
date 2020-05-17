import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const todoItem: UpdateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization;
  const authorizationParams = authorization.split(' ')
  const jwToken = authorizationParams[1]
  const todoUpdate = await updateTodo(
    jwToken,
    todoId,
    todoItem
  );

  console.log('Update todo item ', todoUpdate)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
