import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, QueryCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ethers } from "ethers";
import { APIGatewayProxyEventV2WithJWTAuthorizer, createApiGatewayResponse } from "../utils/api";

// ERC20 ABI - minimal interface needed for transfers
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    },
});
const tableName = process.env.CORE_TABLE_NAME as string;

async function handleContentGet(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const { personal, latest, recommended, user_id, limit, lesson_id } = event.queryStringParameters || {};

    try {
        let baseQuery: QueryCommandInput = {
            TableName: tableName,
            KeyConditionExpression: "PK = :pk",
            Limit: limit ? parseInt(limit) : undefined,
            ExpressionAttributeValues: {
                ":pk": "CONTENT"
            }
        };

        if (personal === 'true' && !lesson_id) {
            // User wants their own content but not a specific lesson
            baseQuery.KeyConditionExpression += " AND begins_with(SK, :sk_prefix)";
            baseQuery.ExpressionAttributeValues = {
                ...baseQuery.ExpressionAttributeValues,
                ":sk_prefix": `USER#${user_id}#`
            };
        } else if (personal === 'true' && lesson_id) {
            // User wants their own content for a specific lesson
            baseQuery.KeyConditionExpression += " AND SK = :sk";
            baseQuery.ExpressionAttributeValues = {
                ...baseQuery.ExpressionAttributeValues,
                ":sk": `USER#${user_id}#${lesson_id}`
            };
        }

        baseQuery.ScanIndexForward = latest === 'false' ? true : false;

        const result = await docClient.send(new QueryCommand(baseQuery));
        let items = result.Items || [];

        if (recommended === 'true') {
            console.log('Fetching recommended content');
            // Can't use SK in FilterExpression since it's a primary key
            // Get all content and filter in memory
            const otherContent = await docClient.send(new QueryCommand({
                TableName: tableName,
                KeyConditionExpression: "PK = :pk",
                Limit: limit ? parseInt(limit) : undefined,
                ExpressionAttributeValues: {
                    ":pk": "CONTENT"
                }
            }));

            console.log(`All content query returned ${otherContent.Items?.length || 0} items`);
            console.log('First few items:', JSON.stringify(otherContent.Items?.slice(0, 3)));

            // Filter out the user's content in memory
            const userPrefix = `USER#${user_id}#`;
            console.log(`Filtering out items with prefix: ${userPrefix}`);

            otherContent.Items = (otherContent.Items || []).filter(
                item => !item.SK.startsWith(userPrefix)
            );

            console.log(`After filtering user content: ${otherContent.Items.length} items remain`);

            if (items.length > 0) {
                console.log(`User has ${items.length} lessons, calculating preferences`);
                console.log('User items data structure sample:', JSON.stringify(items.slice(0, 2)));

                // Check if difficulty property exists
                const hasDifficulty = items.every(item => 'difficulty' in item);
                const hasLanguage = items.every(item => 'language' in item);
                console.log(`Items have difficulty property: ${hasDifficulty}, language property: ${hasLanguage}`);

                const avgDifficulty = items.reduce((acc, item) => acc + (item.difficulty || 0), 0) / items.length;
                const preferredLanguages = [...new Set(items.map(item => item.language).filter(Boolean))];

                console.log(`Average difficulty: ${avgDifficulty}, Preferred languages: ${preferredLanguages.join(', ')}`);

                // Log content items structure too
                console.log('Content items data structure sample:', JSON.stringify(otherContent.Items?.slice(0, 2)));
                const contentHasDifficulty = (otherContent.Items || []).every(item => 'difficulty' in item);
                const contentHasLanguage = (otherContent.Items || []).every(item => 'language' in item);
                console.log(`Content items have difficulty: ${contentHasDifficulty}, language: ${contentHasLanguage}`);

                items = (otherContent.Items || [])
                    .filter(item => {
                        const difficultyMatch = Math.abs((item.difficulty || 0) - avgDifficulty) <= 1;
                        const languageMatch = item.language && preferredLanguages.includes(item.language);
                        return difficultyMatch && languageMatch;
                    })
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5);

                console.log(`Filtered to ${items.length} relevant items based on preferences`);

                // If no items match the preferences, fall back to random selection
                if (items.length === 0) {
                    console.log('No items matched preferences, falling back to random selection');
                    items = (otherContent.Items || [])
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 5);
                    console.log(`Selected ${items.length} random items instead`);
                }

                if (items.length > 0) {
                    console.log('Sample recommended item:', JSON.stringify(items[0]));
                }
            } else {
                console.log('No user lessons found, selecting random content');
                items = (otherContent.Items || [])
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5);

                console.log(`Selected ${items.length} random items`);
                if (items.length > 0) {
                    console.log('Sample random item:', JSON.stringify(items[0]));
                }
            }
        }

        return createApiGatewayResponse(200, items);
    } catch (error) {
        console.error('Error fetching content:', error);
        return createApiGatewayResponse(500, { message: "Internal server error" });
    }
}

async function handlePayStudent(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const { user_id, lesson_id } = event.queryStringParameters || {};

    if (!user_id || !lesson_id) {
        return createApiGatewayResponse(400, { message: "Missing required parameters: user_id and lesson_id" });
    }

    try {
        // Look up the lesson in the database using the correct PK/SK structure
        const lessonResult = await docClient.send(new GetCommand({
            TableName: tableName,
            Key: {
                PK: "CONTENT",
                SK: `USER#${user_id}#${lesson_id}`
            }
        }));

        const lesson = lessonResult.Item;
        if (!lesson) {
            return createApiGatewayResponse(404, { message: "Lesson not found" });
        }

        // Check if the user has already been paid for the lesson
        if (lesson.paid) {
            console.log(`User ${user_id} has already been paid for lesson ${lesson_id}`);
            return createApiGatewayResponse(200, {
                message: "Already paid",
                user_id,
                lesson_id
            });
        }

        // Get the reward amount from the lesson
        const rewardAmount = lesson.reward;
        if (!rewardAmount) {
            return createApiGatewayResponse(400, { message: "Lesson has no reward amount" });
        }

        // Get environment variables
        const privateKey = process.env.PRIVATE_KEY;
        const tokenAddress = process.env.ERC_20_TOKEN_ADDRESS;
        const rpcUrl = process.env.BASE_RPC_URL;

        if (!privateKey || !tokenAddress || !rpcUrl) {
            console.error("Missing environment variables for blockchain interaction");
            return createApiGatewayResponse(500, { message: "Server configuration error" });
        }

        // Set up ethers provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

        // Get token decimals
        const decimals = await tokenContract.decimals();
        console.log(`Token decimals: ${decimals}`);

        // Calculate amount with decimals
        const amount = ethers.parseUnits(rewardAmount.toString(), decimals);
        console.log(`Transferring ${rewardAmount} tokens (${amount} wei) to ${user_id}`);

        // Check balance before transfer
        const balance = await tokenContract.balanceOf(wallet.address);
        console.log(`Sender balance: ${ethers.formatUnits(balance, decimals)} tokens`);

        if (balance < amount) {
            console.error(`Insufficient token balance for transfer`);
            return createApiGatewayResponse(400, { message: "Insufficient funds for token transfer" });
        }

        // Transfer tokens
        const tx = await tokenContract.transfer(user_id, amount);
        console.log(`Transaction hash: ${tx.hash}`);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Update the lesson to be marked as paid - using the correct PK/SK
        await docClient.send(new UpdateCommand({
            TableName: tableName,
            Key: {
                PK: "CONTENT",
                SK: `USER#${user_id}#${lesson_id}`
            },
            UpdateExpression: "SET paid = :paid, paidAt = :paidAt, txHash = :txHash",
            ExpressionAttributeValues: {
                ":paid": true,
                ":paidAt": new Date().toISOString(),
                ":txHash": tx.hash
            }
        }));

        // Look up the connection ID for the user to send notification
        const connectionResult = await docClient.send(new GetCommand({
            TableName: tableName,
            Key: {
                PK: 'USER',
                SK: `CONNECTION#${user_id}`
            }
        }));

        // Send notification if connection exists
        if (connectionResult.Item) {
            const connectionId = connectionResult.Item.connectionId;
            console.log(`Sending notification to connection: ${connectionId}`);

            // Get the WebSocket API endpoint 
            const apiId = process.env.WEBSOCKET_API_ID;
            const region = process.env.AWS_REGION;
            const stage = process.env.STAGE || 'prod';

            if (apiId && region) {
                const wsEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;

                try {
                    const apigwManagementApi = new ApiGatewayManagementApiClient({
                        endpoint: wsEndpoint
                    });

                    await apigwManagementApi.send(new PostToConnectionCommand({
                        ConnectionId: connectionId,
                        Data: JSON.stringify({
                            type: 'NOTIFICATION',
                            message: `You've been awarded ${rewardAmount} ALEX tokens for completing lesson ${lesson_id}!`,
                            lessonId: lesson_id,
                            txHash: tx.hash,
                            amount: rewardAmount,
                            timestamp: new Date().toISOString()
                        })
                    }));

                    console.log(`Successfully sent notification to connection: ${connectionId}`);
                } catch (wsError: any) {
                    // Don't fail the function if notification fails
                    console.error(`Failed to send WebSocket notification: ${wsError}`);
                    if (wsError.name === 'GoneException') {
                        console.log(`Connection ${connectionId} is no longer valid, should clean up`);
                    }
                }
            } else {
                console.log(`WebSocket API configuration not found, skipping notification`);
            }
        } else {
            console.log(`No active connection found for user ${user_id}, skipping notification`);
        }

        return createApiGatewayResponse(200, {
            message: "Payment successful",
            user_id,
            lesson_id,
            txHash: tx.hash,
            amount: rewardAmount
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return createApiGatewayResponse(500, {
            message: "Payment processing error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const { method } = event.requestContext.http;
    const path = event.rawPath;

    switch (method) {
        case 'GET':
            switch (path) {
                case '/v1/content':
                    return handleContentGet(event);
                case '/v1/pay-student':
                    return handlePayStudent(event);
                default:
                    return createApiGatewayResponse(404, { message: "Not found" });
            }

        case 'POST':
            switch (path) {
                default:
                    return createApiGatewayResponse(404, { message: "Not found" });
            }

        default:
            return createApiGatewayResponse(405, { message: "Method not allowed" });
    }
}
