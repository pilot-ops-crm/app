import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchInstagramChats } from '@/actions/instagram/chats';

/**
 * Helper function to get the participant ID for a given chat ID
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
 * Upload an attachment and get the attachment ID
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

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}