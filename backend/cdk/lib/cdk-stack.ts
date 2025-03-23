import * as cdk from 'aws-cdk-lib';
import { aws_apigatewayv2, Duration } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod, HttpNoneAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration, WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { DockerImageCode, DockerImageFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';

dotenv.config();

type TrifectaCdkStackProps = cdk.StackProps & {
  issuer: string;
}

export class TrifectaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: TrifectaCdkStackProps) {
    super(scope, id, props);

    if (!process.env.OPEN_AI_API_KEY) {
      throw new Error('OPEN_AI_API_KEY is not set');
    }
    if (!process.env.ERC_20_TOKEN_ADDRESS) {
      throw new Error('ERC_20_TOKEN_ADDRESS is not set');
    }
    if (!process.env.BASE_RPC_URL) {
      throw new Error('BASE_RPC_URL is not set');
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY is not set');
    }

    const bucket = new s3.Bucket(this, 'TrifectaBucket');
    const coreTable = new Table(this, 'TrifectaCoreTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Chat Queue
    const chatQueueDLQ = new sqs.Queue(this, 'TrifectaChatQueueDLQ', {
      visibilityTimeout: Duration.seconds(300),
    });

    const chatQueue = new sqs.Queue(this, 'TrifectaChatQueue', {
      visibilityTimeout: Duration.seconds(300),
      deadLetterQueue: {
        queue: chatQueueDLQ,
        maxReceiveCount: 1,
      }
    });

    const chatQueueHandler = new NodejsFunction(this, 'TrifectaChatProcessor', {
      runtime: Runtime.NODEJS_22_X,
      memorySize: 512,
      timeout: Duration.seconds(30),
      environment: {
        SQS_QUEUE_URL: chatQueue.queueUrl,
        CORE_TABLE_NAME: coreTable.tableName,
      },
      entry: 'lib/lambda/api/handle-socket.ts',
      handler: 'handler',
    });
    chatQueue.grantSendMessages(chatQueueHandler)
    coreTable.grantReadWriteData(chatQueueHandler)

    const websocketIntegration = new WebSocketLambdaIntegration('TrifectaChatIntegration', chatQueueHandler);
    const websocketApi = new aws_apigatewayv2.WebSocketApi(this, 'TrifectaChatWebSocketApi', {
      apiName: 'ChatWebSocketApi',
      routeSelectionExpression: '$request.body.action',
      description: 'WebSocket API for real-time chat',
      disconnectRouteOptions: {
        integration: websocketIntegration,
      },
      connectRouteOptions: {
        integration: websocketIntegration,
      },
    });

    const websocketStage = new aws_apigatewayv2.WebSocketStage(this, `TrifectaStage`, {
      webSocketApi: websocketApi,
      stageName: "prod",
      autoDeploy: true,
    });

    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${websocketStage.stageName}/POST/*`,
      resource: websocketApi.apiId,
    });

    const websocketChatProcessorHandler = new NodejsFunction(this, 'TrifectaWebsocketChatProcessorHandler', {
      runtime: Runtime.NODEJS_22_X,
      environment: {},
      timeout: Duration.minutes(5),
      memorySize: 512,
      entry: 'lib/lambda/api/handle-message.ts',
      handler: 'handler',
    });

    bucket.grantReadWrite(websocketChatProcessorHandler)
    chatQueue.grantConsumeMessages(websocketChatProcessorHandler)
    websocketChatProcessorHandler.addEventSource(new eventsources.SqsEventSource(chatQueue));
    websocketChatProcessorHandler.addToRolePolicy(
      new PolicyStatement({ actions: ['execute-api:ManageConnections'], resources: [connectionsArns] })
    )

    coreTable.grantReadWriteData(websocketChatProcessorHandler);
    websocketChatProcessorHandler.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "bedrock:RetrieveAndGenerate",
          "bedrock:Retrieve",
          "bedrock:Invoke*",
          "bedrock:Rerank",
          "bedrock:GetInferenceProfile",
          "bedrock:ListInferenceProfiles",
          "states:StartExecution",
          "states:GetExecutionHistory",
          "states:DescribeExecution",
          "states:SendTaskSuccess",
          "states:SendTaskFailure",
          "states:SendTaskHeartbeat",
        ],
        resources: ["*"],
      })
    );

    websocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', chatQueueHandler),
    });

    // HTTP API
    const httpApi = new HttpApi(this, "TrifectaWebApi", {
      apiName: "Trifecta Web API",
      corsPreflight: {
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
        maxAge: Duration.seconds(300),
        allowOrigins: ["http://localhost:3000", "https://alexandria.gg"],
        allowHeaders: ["Authorization", "Content-Type", "Cache-Control", "ETag", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
        allowCredentials: true,
      },
      disableExecuteApiEndpoint: false,
    })

    // const issuer = props?.issuer as string;
    // const audience = ["aws"]

    // const httpApiAuthorizer = new HttpJwtAuthorizer('TrifectaHttpApiAuthorizer', issuer, {
    //   jwtAudience: audience,
    //   identitySource: ['$request.header.Authorization'],
    // })

    const apiHandler = new NodejsFunction(this, 'TrifectaApiHandler', {
      runtime: Runtime.NODEJS_22_X,
      memorySize: 512,
      timeout: Duration.seconds(15),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        CORE_TABLE_NAME: coreTable.tableName,
        ERC_20_TOKEN_ADDRESS: process.env.ERC_20_TOKEN_ADDRESS as string,
        BASE_RPC_URL: process.env.BASE_RPC_URL as string,
        PRIVATE_KEY: process.env.PRIVATE_KEY as string,
      },
      entry: 'lib/lambda/api/main.ts',
      handler: 'handler',
    });
    bucket.grantReadWrite(apiHandler)
    coreTable.grantReadWriteData(apiHandler)

    // Get Content for this user, this is generated content from uploads
    httpApi.addRoutes({
      path: "/v1/content",
      authorizer: new HttpNoneAuthorizer(),
      integration: new HttpLambdaIntegration('ContentHttp', apiHandler),
      methods: [HttpMethod.GET],
    });

    httpApi.addRoutes({
      path: "/v1/pay-student",
      authorizer: new HttpNoneAuthorizer(),
      integration: new HttpLambdaIntegration('PayStudentHttp', apiHandler),
      methods: [HttpMethod.GET],
    });

    const environmentVariables = {
      BUCKET_NAME: bucket.bucketName,
      CORE_TABLE_NAME: coreTable.tableName,
      OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY as string,
      YOUTUBE_EMAIL: process.env.YOUTUBE_EMAIL as string,
      YOUTUBE_PASSWORD: process.env.YOUTUBE_PASSWORD as string,
      WEBSOCKET_API_ID: websocketApi.apiId,
      PROXY_USERNAME: process.env.PROXY_USERNAME as string,
      PROXY_PASSWORD: process.env.PROXY_PASSWORD as string,
      STAGE: websocketStage.stageName,
    }

    const processContentFunction = new DockerImageFunction(this, 'TrifectaProcessContentFunction', {
      code: DockerImageCode.fromImageAsset('lib/lambda/state-machine/process_content', {
        platform: Platform.LINUX_AMD64
      }),
      environment: environmentVariables,
      memorySize: 2048,
      timeout: Duration.minutes(10),
    });
    coreTable.grantReadWriteData(processContentFunction);
    bucket.grantReadWrite(processContentFunction);

    const generateFunction = new DockerImageFunction(this, 'TrifectaGenerateFunction', {
      code: DockerImageCode.fromImageAsset('lib/lambda/state-machine/generate', {
        platform: Platform.LINUX_AMD64
      }),
      environment: environmentVariables,
      timeout: Duration.minutes(5),
    });
    coreTable.grantReadWriteData(generateFunction);
    bucket.grantReadWrite(generateFunction);

    const generateAgentFirstMessageFunction = new DockerImageFunction(this, 'TrifectaGenerateAgentFirstMessageFunction', {
      code: DockerImageCode.fromImageAsset('lib/lambda/state-machine/generate_agent_first_message', {
        platform: Platform.LINUX_AMD64
      }),
      environment: environmentVariables,
      timeout: Duration.minutes(5),
    });
    coreTable.grantReadWriteData(generateAgentFirstMessageFunction);
    bucket.grantReadWrite(generateAgentFirstMessageFunction);

    const sendMessageFunction = new DockerImageFunction(this, 'TrifectaSendMessageFunction', {
      code: DockerImageCode.fromImageAsset('lib/lambda/state-machine/send_message', {
        platform: Platform.LINUX_AMD64
      }),
      environment: environmentVariables,
      timeout: Duration.minutes(5),
    });
    websocketApi.grantManageConnections(sendMessageFunction);

    // State Machine - start with a start step, then splits into parallel steps
    const stateMachine = new StateMachine(this, 'TrifectaStateMachine', {
      definition: sfn.Chain.start(new sfn.Parallel(this, 'ParallelExecution')
        .branch(
          // Content Processing Branch
          new tasks.LambdaInvoke(this, 'ProcessContent', {
            lambdaFunction: processContentFunction,
            payloadResponseOnly: true
          })
            .next(new tasks.LambdaInvoke(this, 'Generate', {
              lambdaFunction: generateFunction,
              payloadResponseOnly: true
            }))
            .next(new tasks.LambdaInvoke(this, 'SendGeneratedMessage', {
              lambdaFunction: sendMessageFunction,
              payloadResponseOnly: true
            }))
        )
        .branch(
          // Websocket Communication Branch
          new tasks.LambdaInvoke(this, 'GenerateAgentFirstMessage', {
            lambdaFunction: generateAgentFirstMessageFunction,
            payloadResponseOnly: true
          })
            .next(new tasks.LambdaInvoke(this, 'SendFirstMessage', {
              lambdaFunction: sendMessageFunction,
              payloadResponseOnly: true
            }))
        )
      )
    });

    // The starter of the state machine
    stateMachine.grantStartExecution(websocketChatProcessorHandler)

    // The starter of the state machine
    websocketChatProcessorHandler.addEnvironment('STATE_MACHINE_ARN', stateMachine.stateMachineArn);

    apiHandler.addEnvironment('WEBSOCKET_API_ID', websocketApi.apiId);
    websocketApi.grantManageConnections(apiHandler);
  }
}
