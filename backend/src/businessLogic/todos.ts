import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosDBAccess } from '../dataLayer/todosDBAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodosFileAccess } from '../dataLayer/todosFileAccess'

const todosAccess = new TodosDBAccess()
const todosFileAccess = new TodosFileAccess();

export async function getTodosForUser(jwToken: string): Promise<TodoItem[]> {
  const userId: string = parseUserId(jwToken)

  console.log('Getting TODOS item for ', userId)
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwToken: string
): Promise<TodoItem> {
  console.log('Deleting TODO item')
  const todoId = uuid.v4()
  const userId = parseUserId(jwToken)

  console.log('Creating TODO item for ', userId)
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
  console.log('Updating TODO item')

  // get user from token
  const userId: string = parseUserId(jwToken)

  // check if id exists
  console.log(`Verifying TODO item for ${userId} & ${todoId}`)
  const todoUpdate : TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  const isIdValid = await todosAccess.idExists(userId, todoId)
  if (!isIdValid) {
    return todoUpdate;
  } 

  console.log('Updating TODO item for ', userId)
  return await todosAccess.updateTodo(userId, todoId, todoUpdate)
}

export async function deleteTodo(jwToken: string, todoId: string) {
  // get user from token
  const userId = parseUserId(jwToken)

  console.log(`Verifying TODO item for ${userId} & ${todoId}`)
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
  console.log('Processing upload image for user: ', userId)
  
  // check if id exists
  console.log(`Verifying TODO item for ${userId} & ${todoId}`)  
  const isIdValid = await todosAccess.idExists(userId, todoId)
  if (!isIdValid) {
    console.log(`Failed to find todo for ${userId} and ${todoId}`)
    return uploadUrl;
  }
  // update db
  const imageId = uuid.v4()
  const imageUrl = todosFileAccess.getImageUrl(imageId)
  await todosAccess.updateImageUrl(userId, todoId, imageUrl)
  console.log(`Db updated for ${todoId} and user: ${userId}`)

  // get signed url
  uploadUrl = await todosFileAccess.getUploadUrl(imageId)
  console.log(`Upload url generated for ${todoId} and user: ${userId}`)

  return uploadUrl;
}