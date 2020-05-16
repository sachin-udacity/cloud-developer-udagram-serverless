import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { parseUserId } from '../auth/utils'

const todosAccess = new TodosAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todosAccess.getAllTodos()
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  // TODO:
  // const userId = parseUserId(jwtToken)
  console.log(jwtToken)
  const userId = '123-345'

  return await todosAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}
