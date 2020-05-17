import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const todoItem: UpdateTodoRequest = JSON.parse(event.body)

  const todoUpdate = await updateTodo(
    todoId,
    todoItem,
  );

  console.log('Update todo item ', todoUpdate)

  const item = {
    name: todoUpdate.name,
    dueDate: todoUpdate.dueDate,
    done: todoUpdate.done,
  }  

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        item
    })
  }
}
