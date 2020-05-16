// Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '9zvj4zysc9'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map
  domain: 'sachin-udacity-cloud-developer.auth0.com',            // Auth0 domain
  clientId: 'EMvkwqN3wy3ak4h2pRrTztWnIckVMVZQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
