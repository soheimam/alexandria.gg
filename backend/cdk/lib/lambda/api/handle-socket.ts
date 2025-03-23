import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Context } from "vm";
import { APIGatewayProxyEventV2, APIGatewayProxyResult, Connection, InvokeModelPayload, putItem } from "../utils/api";

const TABLE_NAME = process.env.CORE_TABLE_NAME as string;
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

const sqsClient = new SQSClient({
  region: 'us-east-1',
})

interface IncomingMessage {
  url: string,
  language: string,
  difficulty: number,
  name: string,
  user_id: string,
  id: string,
}

const handleConnectSetup = async (connectionId: string, userId: string) => {
  console.log(`Connection established: ${connectionId}`);
  try {
    await putItem<Connection>({
      PK: `USER`,
      SK: `CONNECTION#${userId}`,
      connectionId,
      userId,
    }, TABLE_NAME, docClient)
    console.log('Connection setup complete');
  } catch (error) {
    console.error('Error connecting to WebSocket', error);
  }

  return { statusCode: 200, body: 'Connected' };
}

export const handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const connectionId = event.requestContext.connectionId as string;

  try {
    if (event.requestContext.routeKey === '$connect') {
      const userId = event.queryStringParameters?.userId as string;
      if (!userId) {
        console.error('No userId provided');
        return { statusCode: 400, body: 'No userId provided' };
      }
      await handleConnectSetup(connectionId, userId);
      return { statusCode: 200, body: 'Connected' };
    }

    if (event.requestContext.routeKey === '$disconnect') {
      // Handle disconnection
      console.log(`Disconnected: ${connectionId}`);
      return { statusCode: 200, body: 'Disconnected' };
    }

    if (event.requestContext.routeKey === 'sendMessage') {
      const body = JSON.parse(event.body || '{}') as IncomingMessage;

      const payload: InvokeModelPayload = {
        url: body.url,
        language: body.language,
        difficulty: body.difficulty,
        name: body.name,
        user_id: body.user_id,
        id: body.id
      }

      const send = await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(payload)
      }));
      console.log(`Sent message to SQS: ${send.MessageId}`);
      return { statusCode: 200, body: JSON.stringify({ messageId: send.MessageId }) };
    }

    return { statusCode: 400, body: 'Unknown route' };
  } catch (error) {
    return { statusCode: 500, body: 'Failed to process WebSocket event' };
  }
};

