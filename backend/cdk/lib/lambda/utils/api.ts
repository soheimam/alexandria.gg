import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

export type InvokeModelPayload = {
  url: string,
  language: string,
  difficulty: number,
  name: string,
  user_id: string,
  id: string
}

export interface APIGatewayProxyEventV2 {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: { [key: string]: string };
  cookies?: string[];
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  stageVariables?: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    connectionId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body?: string;
  isBase64Encoded: boolean;
}

export const createApiGatewayResponse = (status: number, body: any) => {
  console.log(`Returning status ${status}`);
  return {
    isBase64Encoded: false,
    statusCode: status,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Or specify your specific origin, like "http://localhost:3000"
      "Access-Control-Allow-Credentials": true, // For cookies, authorization headers, etc.
      "Access-Control-Allow-Headers":
        "Content-Type,Cache-Control,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token", // What headers the client is allowed to send
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS", // What methods are allowed
      // "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      // "ETag": `"${Buffer.from(JSON.stringify(body)).toString('base64')}"`, // Generate ETag based on response body
    },
  };
};

export interface Connection {
  PK: string,
  SK: string,
  connectionId: string,
  userId: string,
}

export interface QueryExpression {
  condition: string;
  values: Record<string, any>;
  filter?: string;
  attributeNames?: Record<string, string>;
}

export const getModelId = (modelId: string) => {
  switch (modelId) {
    case "ad-1":
      return "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
    case "ad-2":
      return "us.anthropic.claude-3-5-haiku-20241022-v1:0"
    case "ad-3":
      return "deepseek-reasoner"
    case "ad-4":
      return "gpt-4o"
    default:
      return "us.anthropic.claude-3-5-haiku-20241022-v1:0"
  }
}

export async function sendMessageToClient(apigwManagementApi: ApiGatewayManagementApiClient, connectionId: string, message: string) {
  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: message,
  });

  try {
    await apigwManagementApi.send(command);
  } catch (error) {
    console.error(`Failed to send message to ${connectionId}:`, error);
  }
}

export interface APIGatewayProxyResult {
  statusCode: number;
  headers?: { [key: string]: string };
  multiValueHeaders?: { [key: string]: string[] };
  body: string;
  isBase64Encoded?: boolean;
}

export interface S3Event {
  Records: S3EventRecord[];
}

export interface S3EventRecord {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: {
    principalId: string;
  };
  requestParameters: {
    sourceIPAddress: string;
  };
  responseElements: {
    "x-amz-request-id": string;
    "x-amz-id-2": string;
  };
  s3: {
    s3SchemaVersion: string;
    configurationId: string;
    bucket: {
      name: string;
      ownerIdentity: {
        principalId: string;
      };
      arn: string;
    };
    object: {
      key: string;
      size: number;
      eTag: string;
      sequencer: string;
    };
  };
}

export interface APIGatewayProxyEvent {
  resource: string;
  path: string;
  httpMethod: string;
  headers: { [key: string]: string };
  multiValueHeaders: { [key: string]: string[] };
  queryStringParameters?: { [key: string]: string };
  multiValueQueryStringParameters?: { [key: string]: string[] };
  pathParameters?: { [key: string]: string };
  stageVariables?: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer?: { [key: string]: any };
    domainName: string;
    domainPrefix: string;
    extendedRequestId: string;
    httpMethod: string;
    identity: {
      accessKey?: string;
      accountId?: string;
      caller?: string;
      cognitoAuthenticationProvider?: string;
      cognitoAuthenticationType?: string;
      cognitoIdentityId?: string;
      cognitoIdentityPoolId?: string;
      principalOrgId?: string;
      sourceIp: string;
      user?: string;
      userAgent?: string;
      userArn?: string;
    };
    path: string;
    stage: string;
    requestId: string;
    requestTime: string;
    requestTimeEpoch: number;
    resourceId: string;
    resourcePath: string;
  };
  body?: string;
  isBase64Encoded: boolean;
}

export interface APIGatewayProxyEventV2 {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: { [key: string]: string };
  cookies?: string[];
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  stageVariables?: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    connectionId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body?: string;
  isBase64Encoded: boolean;
}

export interface APIGatewayProxyEventV2WithJWTAuthorizer {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: { [key: string]: string };
  cookies?: string[];
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer: {
      jwt: {
        claims: { [key: string]: string };
        scopes?: string[];
      };
    };
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body?: string;
  isBase64Encoded: boolean;
}

export interface SQSEvent {
  Records: {
    messageId: string;
    receiptHandle: string;
    body: string;
    attributes: { [key: string]: string };
    messageAttributes: { [key: string]: { stringValue: string; dataType: string } };
    md5OfBody: string;
    eventSource: string;
    eventSourceARN: string;
    awsRegion: string;
  }[];
}

export const getItem = async <T>(pk: string, sk: string, client: DynamoDBDocumentClient) => {
  const command = new GetCommand({
    Key: { pk, sk },
    TableName: process.env.CORE_TABLE_NAME as string,
    ConsistentRead: true,
  });
  try {
    const data = await client.send(command);
    return data.Item as T;
  } catch (error) {
    console.error("Error getting item:", error);
    throw error;
  }
}

export const deleteItem = async <T>(pk: string, sk: string, tableName: string, client: DynamoDBDocumentClient) => {
  const command = new DeleteCommand({
    Key: { pk, sk },
    TableName: tableName,
  });
  await client.send(command);
}

// Query a DynamoDB table
export const query = async <T>(
  tableName: string,
  expression: QueryExpression,
  client: DynamoDBDocumentClient,
  indexName?: string,
  scanIndexForward: boolean = true,
  handlePagination: boolean = false,
  limit: number = 1000,
  consistentRead?: boolean,
): Promise<Array<T>> => {
  const queryInput: {
    TableName: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, any>;
    FilterExpression?: string;
    ExpressionAttributeNames?: Record<string, string>;
    IndexName?: string;
    ScanIndexForward?: boolean;
    ExclusiveStartKey?: Record<string, any>;
    Limit?: number;
    ConsistentRead?: boolean;
  } = {
    TableName: tableName,
    KeyConditionExpression: expression.condition,
    ExpressionAttributeValues: expression.values,
  };

  if (consistentRead !== undefined) {
    queryInput.ConsistentRead = consistentRead;
  }

  // Set a reasonable page size when paginating
  if (handlePagination) {
    queryInput.Limit = Math.min(limit, 100); // Get items in smaller chunks
  } else {
    queryInput.Limit = limit;
  }

  if (expression.filter) {
    queryInput.FilterExpression = expression.filter;
  }
  if (expression.attributeNames) {
    queryInput.ExpressionAttributeNames = expression.attributeNames;
  }
  if (indexName) {
    queryInput.IndexName = indexName;
  }
  if (scanIndexForward) {
    queryInput.ScanIndexForward = scanIndexForward;
  }

  let allItems: Array<T> = [];
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    if (lastEvaluatedKey) {
      queryInput.ExclusiveStartKey = lastEvaluatedKey;
    }

    const data = await client.send(new QueryCommand(queryInput));
    allItems = allItems.concat(data.Items as Array<T>);

    lastEvaluatedKey = data.LastEvaluatedKey;

    // Stop if we've reached or exceeded the limit
    if (allItems.length >= limit) {
      allItems = allItems.slice(0, limit);
      break;
    }

    // Continue if we should paginate and there are more items
  } while (handlePagination && lastEvaluatedKey);

  return allItems;
};

// Add an item to dynamoDB sdk v3
export const createItem = async <T>(
  props: Partial<T>,
  tableName: string,
  client: DynamoDBDocumentClient
) => {
  const params = {
    TableName: tableName,
    Item: {
      ...props,
    },
  };
  await client.send(new PutCommand(params));
  return props;
};

// Update an item in dynamodb sdk v3
export const putItem = async <T>(
  props: Partial<T>,
  tableName: string,
  client: DynamoDBDocumentClient
) => {
  const params = {
    TableName: tableName,
    Item: {
      ...props,
    },
  };
  await client.send(new PutCommand(params));
  return props;
};

export const updateItem = async (
  key: any,  // Ensure this contains the primary key
  updateValues: any,
  tableName: string,
  client: DynamoDBDocumentClient,
  conditionExpression?: string,  // Optional condition expression
  expressionAttributeValuesSub?: { [key: string]: any }, // Optional substitution values for condition expression
  expressionAttributeNamesSub?: { [key: string]: any }  // Optional substitution names for condition expression
) => {
  let updateExpression = "set ";
  let expressionAttributeNames = {} as any;
  let expressionAttributeValues = {} as any;

  // Construct the update expression, attribute names, and values
  for (const [updateKey, value] of Object.entries(updateValues)) {
    updateExpression += `#${updateKey} = :${updateKey}, `;
    expressionAttributeNames[`#${updateKey}`] = updateKey;
    expressionAttributeValues[`:${updateKey}`] = value;
  }

  // Remove trailing comma and space
  updateExpression = updateExpression.slice(0, -2);

  // Define the parameters for the update command
  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: key,
    ReturnValues: "ALL_NEW",
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  // Add condition expression and its substitutions if provided
  if (conditionExpression) {
    params.ConditionExpression = conditionExpression;
    if (expressionAttributeValuesSub) {
      params.ExpressionAttributeValues = { ...expressionAttributeValues, ...expressionAttributeValuesSub };
    }
    if (expressionAttributeNamesSub) {
      params.ExpressionAttributeNames = { ...expressionAttributeNames, ...expressionAttributeNamesSub };
    }
  }

  // Create and send the update command
  const command = new UpdateCommand(params);
  return await client.send(command);
};