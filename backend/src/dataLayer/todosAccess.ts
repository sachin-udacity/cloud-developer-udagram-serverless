import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(): Promise<TodoItem[]> {
    console.log('Getting all TODOS item')

    const result = await this.docClient.scan({
      TableName: this.todosTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(totoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: totoItem
    }).promise()

    return totoItem
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dd, done = :d",
      ExpressionAttributeValues:{
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
}
