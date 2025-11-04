import { config } from '../config/env';
import { httpClient } from '../services/httpClient';

export interface IceServer {
  urls: string[];
  username: string;
  credential: string;
}

export interface TurnCredentialsResponse {
  iceServers: IceServer[];
}

export async function fetchTurnCredentials(): Promise<RTCConfiguration> {
  try {
    console.log('🔵 Fetching TURN credentials from:', `${config.apiBaseUrl}/turn/credentials`);
    const response = await httpClient.get<TurnCredentialsResponse>(
      `${config.apiBaseUrl}/turn/credentials`
    );
    
    console.log('✅ TURN credentials fetched successfully:', response.iceServers?.length, 'servers');
    
    return {
      iceServers: response.iceServers as RTCIceServer[],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle' as RTCBundlePolicy,
      rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
      iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch TURN credentials:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    throw error; // Re-throw so caller knows it failed
  }
}
