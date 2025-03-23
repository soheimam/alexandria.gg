# Sends a message back to the frontend over websocket

import json
import os

import boto3


def handler(event, _):
    connection_id = event['target']
    payload = event['payload']

    client = boto3.client('apigatewaymanagementapi',
                          endpoint_url=f"https://{os.environ['WEBSOCKET_API_ID']}.execute-api.{os.environ['AWS_REGION']}.amazonaws.com/{os.environ['STAGE']}")

    try:
        client.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(payload)
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Message sent successfully')
        }
    except client.exceptions.GoneException:
        # Connection is no longer available
        return {
            'statusCode': 410,
            'body': json.dumps('Connection no longer available')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error sending message: {str(e)}')
        }
