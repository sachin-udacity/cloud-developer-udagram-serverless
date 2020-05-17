import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodosAccess()

export async function getTodosForUser(jwToken: string): Promise<TodoItem[]> {
  const userId: string = parseUserId(jwToken)
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwToken)
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
  jwToken: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest, 
): Promise<TodoUpdate> {
  // get user from token
  const userId: string = parseUserId(jwToken)
  console.log('Used id: ', userId)
  // check if id exists
  const todoUpdate : TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  const isIdValid = await todosAccess.idExists(userId, todoId)
  if (!isIdValid) {
    return todoUpdate;
  } 

  return await todosAccess.updateTodo(userId, todoId, todoUpdate)
}

export async function deleteTodo(jwToken: string, todoId: string) {
  // get user from token
  const userId = parseUserId(jwToken)
  const isIdValid = await todosAccess.idExists(userId, todoId)
  if (!isIdValid) {
    return;
  } 

  await todosAccess.deleteTodo(userId, todoId)
}

export async function uploadImage(jwToken: string, todoId: string) {
  let uploadUrl = null;
    // get user from token
    const userId = parseUserId(jwToken)
    console.log('Used id: ', userId)
  // check if id exists
  const isIdValid = await todosAccess.idExists(userId, todoId)
  if (!isIdValid) {
    return uploadUrl;
  }
  // update db
  const imageId = uuid.v4()
  await todosAccess.updateImageUrl(userId, todoId, imageId)
  // get signed url
  uploadUrl = await todosAccess.getUploadUrl(imageId)

  return uploadUrl;
}