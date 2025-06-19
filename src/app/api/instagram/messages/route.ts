import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchInstagramChats } from '@/actions/instagram/chats';

/**
 * Resolves and returns the participant ID associated with a given chat ID.
 *
 * If the chat ID is already in participant ID format, it is returned directly. Otherwise, attempts to look up the participant ID from the list of Instagram chats. If no participant ID is found, returns the original chat ID.
 *
 * @param chatId - The chat or conversation ID to resolve
 * @returns The participant ID corresponding to the chat, or the original chat ID if not found
 */
async function getParticipantId(chatId: string): Promise<string> {
  if (chatId.startsWith('ig_')) {
    return chatId;
  }
  
  const chatsResult = await fetchInstagramChats();
  if (Array.isArray(chatsResult)) {
    const chat = chatsResult.find(c => c.id === chatId);
    if (chat && chat.participantId) {
      return chat.participantId;
    }
  }
  
  console.warn(`Could not find participant ID for chat ${chatId}, falling back to conversation ID`);
  return chatId;
}

/**
 * Uploads a media attachment to Instagram and returns the resulting attachment ID.
 *
 * @param accessToken - The access token used for authentication with the Instagram Graph API.
 * @param mediaType - The type of media to upload (e.g., "image", "video", "audio", "file").
 * @param mediaUrl - The URL of the media file to upload.
 * @returns The attachment ID assigned by Instagram for the uploaded media.
 * @throws If the Instagram page ID is missing or the API request fails.
 */
async function uploadAttachment(accessToken: string, mediaType: string, mediaUrl: string): Promise<string> {
  try {
    const pageId = process.env.INSTAGRAM_PAGE_ID;
    
    if (!pageId) {
      throw new Error('Page ID not found');
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pageId}/message_attachments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          platform: "instagram",
          message: {
            attachment: {
              type: mediaType,
              payload: {
                url: mediaUrl,
                is_reusable: "true"
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API attachment upload error:', errorData);
      throw new Error(`Failed to upload attachment: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.attachment_id;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
}

/**
 * Handles POST requests to send messages to Instagram users via the Facebook Graph API.
 *
 * Expects a JSON body with `recipientId`, `messageType`, and `content`. Supports sending text, image, video, audio, file, sticker, and post messages. Validates authentication and required fields, constructs the appropriate message payload, and sends it to the Instagram messaging endpoint. Returns a JSON response with the message ID, timestamp, and message content or attachment details on success, or an error message with the appropriate status code on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('instagram_access_token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, messageType, content } = body;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (!messageType || !content) {
      return NextResponse.json({ error: 'Message type and content are required' }, { status: 400 });
    }

    const participantId = await getParticipantId(recipientId);
    console.log("API route sending to participant:", participantId);

    let messagePayload;
    let attachmentId;

    switch (messageType) {
      case 'text':
        messagePayload = { text: content };
        break;
      case 'image':
        messagePayload = {
          attachment: {
            type: 'image',
            payload: { url: content }
          }
        };
        break;
      case 'video':
        messagePayload = {
          attachment: {
            type: 'video',
            payload: { url: content }
          }
        };
        break;
      case 'audio':
        messagePayload = {
          attachment: {
            type: 'audio',
            payload: { url: content }
          }
        };
        break;
      case 'file':
        try {
          attachmentId = await uploadAttachment(accessToken.value, 'file', content);
          messagePayload = {
            attachment: {
              type: 'file',
              payload: { attachment_id: attachmentId }
            }
          };
        } catch (uploadError) {
          return NextResponse.json({ error: 'Failed to upload file', details: uploadError instanceof Error ? uploadError.message : String(uploadError) }, { status: 500 });
        }
        break;
      case 'sticker':
        messagePayload = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [
                {
                  title: 'Sticker',
                  image_url: content
                }
              ]
            }
          }
        };
        break;
      case 'post':
        try {
          const postId = content.includes('/') ? content.split('/').pop() : content;
          messagePayload = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [
                  {
                    media_type: 'instagram_post',
                    url: postId
                  }
                ]
              }
            }
          };
        } catch (postError) {
          return NextResponse.json({ error: 'Invalid post ID or URL', details: postError instanceof Error ? postError.message : String(postError) }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId }, // Use the participant ID (IGSID)
          message: messagePayload
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      return NextResponse.json(
        { error: `Failed to send message: ${JSON.stringify(errorData)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    const responsePayload: {
      success: boolean;
      message_id: string;
      timestamp: string;
      text?: string;
      attachments?: {
        type: string;
        payload: {
          url: string;
          title: string;
        };
      }[];
    } = {
      success: true,
      message_id: data.message_id,
      timestamp: new Date().toISOString()
    };
    
    if (messageType !== 'text') {
      responsePayload.attachments = [{
        type: messageType,
        payload: {
          url: content,
          title: messageType.charAt(0).toUpperCase() + messageType.slice(1)
        }
      }];
    } else {
      responsePayload.text = content;
    }
    
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Handles unsupported GET requests by returning a 405 Method Not Allowed error in JSON format.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}