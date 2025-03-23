import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { InvokeModelPayload, SQSEvent } from "../utils/api";


const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const tableName = process.env.CORE_TABLE_NAME as string;
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const _event = JSON.parse(record.body) as InvokeModelPayload
      const { url, language, difficulty, name, user_id, id } = _event

      // Start the state machine
      const stateMachineInput = {
        "video_url": url,
        "language": language,
        "difficulty": difficulty,
        "name": name,
        "user_id": user_id,
        "id": id
      }
      const startStateMachineCommand = new StartExecutionCommand({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        input: JSON.stringify(stateMachineInput)
      });
      const startStateMachineResult = await sfnClient.send(startStateMachineCommand);
      console.log(`State machine started with result: ${JSON.stringify(startStateMachineResult)}`);
    } catch (error) {
      console.error(`Error processing message: ${error}`);
    } finally {
      console.log(`Message processed successfully`);
    }
  }
};

