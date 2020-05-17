import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { int } from 'aws-sdk/clients/datapipeline'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.TODOS_USERID_INDEX,
    private readonly s3 = new AWS.S3({ signatureVersion: 'v4'}),
    private readonly s3BucketName = process.env.IMAGES_S3_BUCKET,
    private readonly s3UrlExpiration: int = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    console.log('Getting TODOS item for ', userId)

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
    console.log('Get id: ', result)
    return !!result.Item
  }

  async updateImageUrl(userId: string, todoId: string, imageId: string) {
    // create image url
    const imageUrl = `https://${this.s3BucketName}.s3.amazonaws.com/${imageId}`
    console.log('Updating todo item: ', imageUrl)
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

  getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: imageId,
      Expires: this.s3UrlExpiration
    })
  }
  
}
