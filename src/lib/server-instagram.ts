/**
 * Server-side Instagram client for secure API interactions
 */
import { IgApiClient, IgCheckpointError, IgLoginRequiredError } from 'instagram-private-api';
import { Message, Conversation } from './instagram-client';

// Store active sessions (in a real app, this would be in Redis or a database)
const sessions: { [key: string]: IgApiClient } = {};

/**
 * Create or get an Instagram client instance for a specific user
 */
export async function getIgClient(username: string): Promise<IgApiClient> {
  if (sessions[username]) {
    return sessions[username];
  }

  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  sessions[username] = ig;
  return ig;
}

/**
 * Extract challenge data from different error types
 */
function extractChallengeData(error: any): any {
  // Try different paths where challenge data might be found
  if (error.challenge) {
    return error.challenge;
  }
  
  if (error.json && error.json.challenge) {
    return error.json.challenge;
  }
  
  if (error.response && error.response.body && error.response.body.challenge) {
    return error.response.body.challenge;
  }
  
  // For plain JSON responses
  if (typeof error === 'object' && error.status === 'fail' && error.error_type === 'checkpoint_challenge_required') {
    return error.challenge;
  }
  
  return null;
}

/**
 * Handle Instagram challenge verification
 * This is a simplified approach - in a real app, you'd implement a flow to
 * send verification codes to the user's email/phone
 */
async function handleChallenge(error: any, ig: IgApiClient): Promise<any> {
  console.log('Challenge required, attempting to resolve...');
  
  // Extract challenge data from the error
  const challengeData = extractChallengeData(error);
  
  // If we still don't have challenge data, we can't proceed
  if (!challengeData) {
    console.log('Challenge data structure:', JSON.stringify(error, null, 2));
    // Instead of failing, we'll return a more helpful message for the user
    throw new Error('Instagram security verification required. Please log in through the Instagram app first to verify your account.');
  }
  
  try {
    // Set the challenge data manually
    ig.state.checkpoint = challengeData;
    
    // If we have an API path, set it
    if (challengeData.api_path) {
      ig.state.challengeUrl = challengeData.api_path;
    }
    
    // Try to get the challenge state
    try {
      const challengeInfo = await ig.challenge.state();
      console.log('Challenge info:', challengeInfo);
    } catch (stateError) {
      console.log('Could not get challenge state:', stateError);
      // Continue anyway
    }
    
    // Try to bypass the challenge with auto method
    try {
      await ig.challenge.auto(true);
    } catch (autoError) {
      console.log('Auto challenge resolution failed:', autoError);
      // Continue anyway
    }
    
    // In a real implementation, you would:
    // 1. Determine the challenge type (email/phone)
    // 2. Send the verification code to the user
    // 3. Have the user enter the code
    // 4. Submit the code using ig.challenge.sendSecurityCode(code)
    
    // For now, we'll throw a more helpful error
    throw new Error('Instagram security challenge required. Please log in through the Instagram app first to verify your account, then try again.');
  } catch (challengeError) {
    console.error('Challenge handling error:', challengeError);
    throw new Error('Instagram security verification required. Please log in through the Instagram app first to verify your account, then try again.');
  }
}

/**
 * Log in to Instagram
 */
export async function serverLogin(username: string, password: string) {
  const ig = await getIgClient(username);

  try {
    // Try to simulate preLoginFlow to improve success rate
    try {
      await ig.simulate.preLoginFlow();
    } catch (preLoginError) {
      console.log('Pre-login simulation error (non-critical):', preLoginError);
    }
    
    const loggedInUser = await ig.account.login(username, password);
    
    // Complete post-login flow to avoid suspicion
    process.nextTick(async () => {
      try {
        await ig.simulate.postLoginFlow();
      } catch (error) {
        console.log('Post login flow error (non-critical):', error);
      }
    });
    
    const userInfo = await ig.user.info(loggedInUser.pk);

    return {
      pk: userInfo.pk.toString(),
      username: userInfo.username,
      full_name: userInfo.full_name,
      profile_pic_url: userInfo.profile_pic_url,
      is_private: userInfo.is_private,
    };
  } catch (error) {
    console.error('Server login error:', error);
    
    // Check for challenge required in various formats
    const isChallenge = 
      (error instanceof IgCheckpointError) ||
      (error instanceof IgLoginRequiredError && error.message.includes('challenge')) ||
      (error.message && error.message.includes('challenge_required')) ||
      (error.error_type && error.error_type === 'checkpoint_challenge_required') ||
      (error.json && error.json.error_type === 'checkpoint_challenge_required');
    
    if (isChallenge) {
      try {
        return await handleChallenge(error, ig);
      } catch (challengeError) {
        throw challengeError;
      }
    }
    
    throw error;
  }
}

/**
 * Fetch user's direct message threads
 */
export async function serverFetchConversations(username: string): Promise<Conversation[]> {
  const ig = sessions[username];
  if (!ig) {
    throw new Error('Not authenticated');
  }

  try {
    const inbox = await ig.feed.directInbox().request();

    return inbox.inbox.threads.map(thread => {
      return {
        thread_id: thread.thread_id,
        users: thread.users.map(user => ({
          pk: user.pk.toString(),
          username: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
        })),
        last_activity_at: new Date(thread.last_activity_at).getTime(),
        items: thread.items?.map(item => ({
          item_id: item.item_id,
          user_id: item.user_id.toString(),
          timestamp: new Date(item.timestamp).getTime(),
          text: item.text,
          ...(item.visual_media && {
            media: {
              url: item.visual_media.media.image_versions2?.candidates[0]?.url,
              type: 'image'
            }
          })
        }))
      };
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Fetch messages for a specific thread
 */
export async function serverFetchThreadMessages(username: string, threadId: string): Promise<Message[]> {
  const ig = sessions[username];
  if (!ig) {
    throw new Error('Not authenticated');
  }

  try {
    const thread = ig.feed.directThread({ thread_id: threadId });
    const items = await thread.items();

    return items.map(item => ({
      item_id: item.item_id,
      user_id: item.user_id.toString(),
      timestamp: new Date(item.timestamp).getTime(),
      text: item.text,
      ...(item.visual_media && {
        media: {
          url: item.visual_media.media.image_versions2?.candidates[0]?.url,
          type: 'image'
        }
      })
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Send a message to a thread
 */
export async function serverSendMessage(
  username: string,
  threadId: string,
  text?: string,
  mediaId?: string
): Promise<Message> {
  const ig = sessions[username];
  if (!ig) {
    throw new Error('Not authenticated');
  }

  try {
    const thread = ig.entity.directThread(threadId);
    
    let result;
    
    if (text) {
      result = await thread.broadcastText(text);
    } else if (mediaId) {
      throw new Error('Media upload not implemented');
    } else {
      throw new Error('No content to send');
    }
    
    // Get the user's ID
    const loggedInUser = await ig.account.currentUser();
    
    return {
      item_id: result.item_id,
      user_id: loggedInUser.pk.toString(),
      timestamp: Date.now(),
      text: text
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
} 