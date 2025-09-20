"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Square, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscription: (text: string, fieldMappings: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInput({ onTranscription, disabled = false, className = "" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Create MediaRecorder with backend-compatible formats
      let mimeType = 'audio/webm;codecs=opus'; // fallback
      let fileExtension = '.webm';

      // Try formats that the backend accepts, in order of preference
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        fileExtension = '.mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
        fileExtension = '.wav';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
        fileExtension = '.ogg';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
        fileExtension = '.webm';
      }

      console.log('Selected MIME type:', mimeType);
      console.log('Will use file extension:', fileExtension);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Process the recorded audio
        await processRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) {
      setError('No audio data recorded');
      return;
    }

    setIsProcessing(true);

    try {
      // Create blob from recorded chunks
      const audioBlob = new Blob(chunksRef.current);

      // Determine file extension based on the blob type
      let fileName = 'recording.wav'; // default fallback
      let contentType = 'audio/wav';

      if (chunksRef.current.length > 0) {
        // Use the first chunk's type to determine the format
        const firstChunk = chunksRef.current[0];
        const chunkType = firstChunk.type.toLowerCase();

        if (chunkType.includes('mp4')) {
          fileName = 'recording.mp4';
          contentType = 'audio/mp4';
        } else if (chunkType.includes('wav')) {
          fileName = 'recording.wav';
          contentType = 'audio/wav';
        } else if (chunkType.includes('ogg')) {
          fileName = 'recording.ogg';
          contentType = 'audio/ogg';
        } else if (chunkType.includes('webm')) {
          // This should hopefully not happen now, but keep as fallback
          fileName = 'recording.webm';
          contentType = 'audio/webm';
        }
      }

      console.log('Audio blob type:', audioBlob.type);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Sending file as:', fileName);
      console.log('Chunks count:', chunksRef.current.length);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, fileName); // Changed from 'audio' to 'file'

      // Send to FastAPI speech-to-text endpoint using environment variable
      const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8080';
      const response = await fetch(`${fastApiUrl}/speech-to-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to get the error details from the response
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorDetail += ` - ${errorData.detail}`;
          }
        } catch (e) {
          // If we can't parse the error response, just use the status
        }
        throw new Error(errorDetail);
      }

      const result = await response.json();
      console.log('FastAPI response:', result);

      if (result.transcription) {
        // Parse the transcribed text to extract field information
        const transcribedText = result.transcription;
        console.log('Transcribed text:', transcribedText);

        // Use Gemini AI to parse the transcript intelligently
        const fieldMappings = await parseTranscriptionWithGemini(transcribedText);
        console.log('Gemini parsed field mappings:', fieldMappings);

        onTranscription(transcribedText, fieldMappings);
      } else {
        console.error('Unexpected response format:', result);
        setError('No speech detected or unexpected response format. Please try again.');
      }

    } catch (error) {
      console.error('Error processing recording:', error);

      // More specific error messages
      const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8080';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(`Cannot connect to speech service at ${fastApiUrl}. Please check if the FastAPI server is running.`);
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        if (error.message.includes('422')) {
          setError('Audio format not supported by server. The server may need to accept .webm files.');
        } else if (error.message.includes('500')) {
          setError(`Server error: ${error.message}. Check FastAPI server logs for details.`);
        } else {
          setError(`Speech service error: ${error.message}`);
        }
      } else {
        setError('Failed to process speech. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      chunksRef.current = [];
    }
  };

  const parseTranscriptionWithGemini = async (text: string): Promise<Record<string, string>> => {
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const geminiUrl = process.env.NEXT_PUBLIC_GEMINI_API_URL;

      if (!geminiApiKey) {
        console.warn('Gemini API key not found, falling back to pattern matching');
        return parseTranscriptionToFields(text);
      }

      const prompt = `
You are an AI assistant helping to extract profile information from speech transcripts.
Extract the following information from this transcript and return it as a JSON object.

Profile fields to extract:
- first_name: Person's first name
- last_name: Person's last name
- date_of_birth: Birth date in YYYY-MM-DD format (estimate if only age given)
- age: Age as a number (if mentioned)
- gender: "male", "female", "non-binary", or "prefer-not-to-say" (infer from context if mentioned)
- phone_number: Phone number (digits only)
- address_line1: Street address
- address_line2: Apartment/unit number
- postal_code: Postal/zip code
- city: City name
- bio: Personal description or about section
- emergency_contact_name: Emergency contact person's name
- emergency_contact_phone: Emergency contact phone number
- interests: Array of interests/hobbies as JSON array
- mobility_level: "high", "moderate", "low", or "wheelchair"
- activity_preferences: Array like ["indoor", "outdoor", "social", "quiet"] as JSON array
- language_preferences: Array of languages as JSON array

Rules:
1. Only extract information that is clearly mentioned
2. For interests, activity_preferences, and language_preferences, return as JSON arrays
3. If age is mentioned, calculate approximate date_of_birth (assume January 1st)
4. For gender, only infer if explicitly stated (e.g., "I am a man/woman", "I'm male/female") or from clear context clues
5. Be respectful with gender - when in doubt, use null rather than assume
6. Return only the JSON object, no other text
7. Use null for fields that aren't mentioned

Transcript: "${text}"

Return only a valid JSON object:`;

      const response = await fetch(`${geminiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini');
      }

      console.log('Gemini raw response:', generatedText);

      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsedFields = JSON.parse(jsonMatch[0]);

      // Clean up the parsed fields - remove null values and format arrays
      const cleanedFields: Record<string, string> = {};

      Object.entries(parsedFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            cleanedFields[key] = JSON.stringify(value);
          } else {
            cleanedFields[key] = String(value);
          }
        }
      });

      return cleanedFields;

    } catch (error) {
      console.error('Error with Gemini parsing:', error);
      console.log('Falling back to pattern matching');
      return parseTranscriptionToFields(text);
    }
  };

  const parseTranscriptionToFields = (text: string): Record<string, string> => {
    const fieldMappings: Record<string, string> = {};
    const lowerText = text.toLowerCase().trim();

    console.log('Parsing text:', text);
    console.log('Lowercase text:', lowerText);

    // Return empty if text is too short or empty
    if (!text || text.trim().length < 5) {
      console.log('Text too short, returning empty mappings');
      return fieldMappings;
    }

    // Simple pattern matching for common profile fields
    // This can be made more sophisticated with NLP libraries

    // Name extraction
    const namePatterns = [
      /my name is ([a-zA-Z\s]+)/i,
      /i am ([a-zA-Z\s]+)/i,
      /call me ([a-zA-Z\s]+)/i,
      /i'm ([a-zA-Z\s]+)/i
    ];

    // Gender extraction
    if (lowerText.includes('i am a man') || lowerText.includes('i\'m a man') || lowerText.includes('i am male')) {
      fieldMappings.gender = 'male';
    } else if (lowerText.includes('i am a woman') || lowerText.includes('i\'m a woman') || lowerText.includes('i am female')) {
      fieldMappings.gender = 'female';
    } else if (lowerText.includes('non-binary') || lowerText.includes('non binary')) {
      fieldMappings.gender = 'non-binary';
    } else if (lowerText.includes('prefer not to say')) {
      fieldMappings.gender = 'prefer-not-to-say';
    }

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        const fullName = match[1].trim();
        const nameParts = fullName.split(' ');
        if (nameParts.length >= 2) {
          fieldMappings.first_name = nameParts[0];
          fieldMappings.last_name = nameParts.slice(1).join(' ');
        } else {
          fieldMappings.first_name = fullName;
        }
        break;
      }
    }

    // Age/Date of birth
    const agePatterns = [
      /i am (\d{1,2}) years old/i,
      /(\d{1,2}) years old/i,
      /my age is (\d{1,2})/i
    ];

    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age > 0 && age < 120) {
          fieldMappings.age = age.toString();
          const birthYear = new Date().getFullYear() - age;
          fieldMappings.date_of_birth = `${birthYear}-01-01`; // Approximate
        }
        break;
      }
    }

    // Phone number - extract all digit sequences and find valid phone numbers
    // First try patterns with context words
    const contextPatterns = [
      /(?:phone|number|contact|call|mobile|cell).*?(\d{4}[-.\s]*\d{4})/i, // Singapore: phone 9123 4567
      /(?:phone|number|contact|call|mobile|cell).*?(\d{3}[-.\s]*\d{3}[-.\s]*\d{4})/i, // US: phone 123 456 7890
      /(?:phone|number|contact|call|mobile|cell).*?(\d{8,15})/i // Any 8-15 digits with context
    ];

    for (const pattern of contextPatterns) {
      const match = text.match(pattern);
      if (match) {
        const cleanPhone = match[1].replace(/[^\d]/g, '');
        if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
          fieldMappings.phone_number = cleanPhone;
          break;
        }
      }
    }

    // If no phone found with context, try standalone patterns
    if (!fieldMappings.phone_number) {
      const standalonePatterns = [
        /\b(\d{4}[-.\s]\d{4})\b/g, // Singapore format: 9123 4567
        /\b(\d{3}[-.\s]\d{3}[-.\s]\d{4})\b/g, // US format: 123-456-7890
        /\b(\d{8})\b/g, // 8 consecutive digits
        /\b(\d{10})\b/g // 10 consecutive digits
      ];

      for (const pattern of standalonePatterns) {
        const matches = Array.from(text.matchAll(pattern));
        for (const match of matches) {
          const cleanPhone = match[1].replace(/[^\d]/g, '');
          if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
            fieldMappings.phone_number = cleanPhone;
            break;
          }
        }
        if (fieldMappings.phone_number) break;
      }
    }

    // Address
    const addressPatterns = [
      /i live at ([^.!?]+)/i,
      /my address is ([^.!?]+)/i,
      /located at ([^.!?]+)/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        fieldMappings.address_line1 = match[1].trim();
        break;
      }
    }

    // Bio/Description
    if (lowerText.includes('about me') || lowerText.includes('i like') || lowerText.includes('i enjoy')) {
      fieldMappings.bio = text;
    }

    // Emergency contact
    const emergencyPatterns = [
      /emergency contact.*?([a-zA-Z\s]+).*?(\d{8,})/i,
      /in case of emergency.*?([a-zA-Z\s]+)/i
    ];

    for (const pattern of emergencyPatterns) {
      const match = text.match(pattern);
      if (match) {
        fieldMappings.emergency_contact_name = match[1].trim();
        if (match[2]) {
          fieldMappings.emergency_contact_phone = match[2];
        }
        break;
      }
    }

    // Interests (simple keyword extraction)
    const interestKeywords = [
      'reading', 'walking', 'cooking', 'gardening', 'painting', 'music', 'dancing',
      'swimming', 'yoga', 'chess', 'cards', 'movies', 'travel', 'photography',
      'knitting', 'crafts', 'singing', 'exercise', 'meditation', 'baking'
    ];

    const foundInterests = interestKeywords.filter(interest =>
      lowerText.includes(interest)
    );

    if (foundInterests.length > 0) {
      fieldMappings.interests = JSON.stringify(foundInterests);
    }

    // Activity preferences
    const activityKeywords = {
      indoor: ['indoor', 'inside', 'home'],
      outdoor: ['outdoor', 'outside', 'garden', 'park'],
      social: ['social', 'group', 'people', 'friends'],
      quiet: ['quiet', 'peaceful', 'calm', 'solo']
    };

    const foundActivities: string[] = [];
    Object.entries(activityKeywords).forEach(([activity, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        foundActivities.push(activity);
      }
    });

    if (foundActivities.length > 0) {
      fieldMappings.activity_preferences = JSON.stringify(foundActivities);
    }

    // Languages
    const languages = ['english', 'mandarin', 'chinese', 'malay', 'tamil', 'hindi', 'spanish', 'french'];
    const foundLanguages = languages.filter(lang => lowerText.includes(lang));

    if (foundLanguages.length > 0) {
      fieldMappings.language_preferences = JSON.stringify(foundLanguages);
    }

    // Mobility level
    if (lowerText.includes('wheelchair')) {
      fieldMappings.mobility_level = 'wheelchair';
    } else if (lowerText.includes('limited mobility') || lowerText.includes('difficulty walking')) {
      fieldMappings.mobility_level = 'low';
    } else if (lowerText.includes('moderate') || lowerText.includes('some mobility')) {
      fieldMappings.mobility_level = 'moderate';
    } else if (lowerText.includes('active') || lowerText.includes('good mobility')) {
      fieldMappings.mobility_level = 'high';
    }

    return fieldMappings;
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          text-white
        `}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <Square className="h-5 w-5" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>

      <div className="text-center">
        {isProcessing && (
          <p className="text-sm text-blue-600">Processing speech...</p>
        )}
        {isRecording && (
          <p className="text-sm text-red-600">Recording... Tap to stop</p>
        )}
        {!isRecording && !isProcessing && (
          <p className="text-sm text-gray-600">Tap to record</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}