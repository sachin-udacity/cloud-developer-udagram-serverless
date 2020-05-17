import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { int } from 'aws-sdk/clients/datapipeline'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3 = new AWS.S3({ signatureVersion: 'v4'}),
    private readonly s3BucketName = process.env.IMAGES_S3_BUCKET,
    private readonly s3UrlExpiration: int = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getAllTodos(): Promise<TodoItem[]> {
    console.log('Getting all TODOS item')

    const result = await this.docClient.scan({
      TableName: this.todosTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(todoId: string) {
    return await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
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

  async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
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

  async deleteTodo(todoId: string) {
    return await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId
      },
      ConditionExpression: "todoId = :id",
      ExpressionAttributeValues:{
          ":id":todoId
      }
    }).promise()
  }

  async idExists(todoId: string) {
    const result = await this.getTodo(todoId)
    console.log('Get id: ', result)
    return !!result.Item
  }

  async updateImageUrl(todoId: string, imageId: string) {
    // create image url
    const imageUrl = `https://${this.s3BucketName}.s3.amazonaws.com/${imageId}`
    console.log('Updating todo item: ', imageUrl)
    // update db
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :url",
      ExpressionAttributeValues:{
          ":url": imageUrl
      }
    }).promise()
  }

  getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: imageId,
      Expires: this.s3UrlExpiration
    })
  }
  
}
