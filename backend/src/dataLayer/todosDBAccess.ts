import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS);

export class TodosDBAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.TODOS_USERID_INDEX) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName : this.todosTable,
      IndexName : this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(userId: string, todoId: string) {
    return await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        }
      })
      .promise()
  }

  async createTodo(totoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: totoItem
    }).promise()

    return totoItem
  }

  async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dd, done = :d",
      ConditionExpression: "todoId = :id",
      ExpressionAttributeValues:{
          ":id": todoId,
          ":name": todoUpdate.name,
          ":dd":todoUpdate.dueDate,
          ":d":todoUpdate.done
      },
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()

    return todoUpdate;
  }

  async deleteTodo(userId: string, todoId: string) {
    return await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      ConditionExpression: "todoId = :id",
      ExpressionAttributeValues:{
          ":id":todoId
      }
    }).promise()
  }

  async idExists(userId: string, todoId: string) {
    const result = await this.getTodo(userId, todoId)
    console.log(`Item check for : ${userId} & ${todoId} `, result)
    return !!result.Item
  }

  async updateImageUrl(userId: string, todoId: string, imageUrl: string) {
    console.log('Updating todo item image: ', imageUrl)

    // update db
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :url",
      ExpressionAttributeValues:{
          ":url": imageUrl
      }
    }).promise()
  }  
}
