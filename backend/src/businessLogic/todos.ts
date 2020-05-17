import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodosAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todosAccess.getAllTodos()
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  console.log('Used id: ', userId)

  return await todosAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    attachmentUrl: '',
    done: false
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest, 
): Promise<TodoUpdate> {
  // check if id exists
  const todoUpdate : TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  const isIdValid = await todosAccess.idExists(todoId)
  if (!isIdValid) {
    return todoUpdate;
  } 

  return await todosAccess.updateTodo(todoId, todoUpdate)
}

export async function deleteTodo(todoId: string) {
  await todosAccess.deleteTodo(todoId)
}

export async function uploadImage(todoId: string) {
  let uploadUrl = null;
  // check if id exists
  const isIdValid = await todosAccess.idExists(todoId)
  if (!isIdValid) {
    return uploadUrl;
  }
  // update db
  const imageId = uuid.v4()
  await todosAccess.updateImageUrl(todoId, imageId)
  // get signed url
  uploadUrl = await todosAccess.getUploadUrl(imageId)

  return uploadUrl;
}