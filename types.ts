
export interface GuestInfo {
  hotelName: string;
  mobile: string;
  nightsStay: number;
}

export interface FeedbackData {
  rawTranscript: string;
  generatedReview: string;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}
