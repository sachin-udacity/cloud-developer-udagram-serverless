import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { int } from 'aws-sdk/clients/datapipeline'

const XAWS = AWSXRay.captureAWS(AWS);

export class TodosFileAccess {

  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4'}),
    private readonly s3BucketName = process.env.IMAGES_S3_BUCKET,
    private readonly s3UrlExpiration: int = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  getImageUrl(imageId: string) {
    // create image url
    return `https://${this.s3BucketName}.s3.amazonaws.com/${imageId}`
  }

  getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: imageId,
      Expires: this.s3UrlExpiration
    })
  }
}
