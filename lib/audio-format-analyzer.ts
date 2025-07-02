/**
 * Audio Format Analysis for Gemini Live API
 *
 * This utility helps understand and work with the audio format we receive
 * from the Gemini Live API through our WebSocket implementation.
 */

export interface AudioFormatInfo {
  format: string
  encoding: string
  sampleRate: number
  channels: number
  bitDepth: number
  estimatedDuration: number
  sizeInBytes: number
  sizeInMB: number
}

export class AudioFormatAnalyzer {
  /**
   * Analyzes the audio format we receive from Gemini Live API
   */
  static analyzeReceivedAudio(base64AudioData: string): AudioFormatInfo {
    // The audio data we receive is base64 encoded
    const audioBuffer = Uint8Array.from(atob(base64AudioData), (c) => c.charCodeAt(0))

    // Based on Gemini Live API documentation and our implementation:
    const format = "PCM" // Raw PCM audio data
    const encoding = "Linear16" // 16-bit linear PCM
    const sampleRate = 24000 // 24kHz sample rate
    const channels = 1 // Mono audio
    const bitDepth = 16 // 16 bits per sample

    // Calculate audio properties
    const bytesPerSample = bitDepth / 8 // 2 bytes per sample for 16-bit
    const totalSamples = audioBuffer.length / bytesPerSample
    const durationSeconds = totalSamples / sampleRate
    const sizeInBytes = audioBuffer.length
    const sizeInMB = sizeInBytes / (1024 * 1024)

    return {
      format,
      encoding,
      sampleRate,
      channels,
      bitDepth,
      estimatedDuration: Math.round(durationSeconds * 100) / 100, // Round to 2 decimal places
      sizeInBytes,
      sizeInMB: Math.round(sizeInMB * 100) / 100,
    }
  }

  /**
   * Converts the received audio data to a Web Audio API AudioBuffer
   */
  static async convertToAudioBuffer(base64AudioData: string, audioContext: AudioContext): Promise<AudioBuffer> {
    // Decode base64 to raw bytes
    const audioBuffer = Uint8Array.from(atob(base64AudioData), (c) => c.charCodeAt(0))

    // Audio format constants from Gemini Live API
    const sampleRate = 24000
    const channels = 1
    const bytesPerSample = 2 // 16-bit = 2 bytes

    const numSamples = audioBuffer.length / bytesPerSample

    // Create Web Audio API buffer
    const audioContextBuffer = audioContext.createBuffer(channels, numSamples, sampleRate)
    const channelData = audioContextBuffer.getChannelData(0)

    // Convert 16-bit signed PCM to float32 (-1.0 to 1.0)
    for (let i = 0; i < numSamples; i++) {
      // Read 16-bit signed integer (little-endian)
      const sample16 = audioBuffer[i * 2] | (audioBuffer[i * 2 + 1] << 8)

      // Convert to signed 16-bit if needed
      const signedSample = sample16 > 32767 ? sample16 - 65536 : sample16

      // Normalize to float32 range (-1.0 to 1.0)
      channelData[i] = signedSample / 32768.0
    }

    return audioContextBuffer
  }

  /**
   * Validates that the received audio data is in the expected format
   */
  static validateAudioFormat(base64AudioData: string): {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if it's valid base64
      const audioBuffer = Uint8Array.from(atob(base64AudioData), (c) => c.charCodeAt(0))

      // Check minimum size (should be at least a few milliseconds of audio)
      const minExpectedSize = 24000 * 2 * 0.1 // 100ms of 24kHz 16-bit mono
      if (audioBuffer.length < minExpectedSize) {
        issues.push(`Audio data too small: ${audioBuffer.length} bytes (expected at least ${minExpectedSize})`)
        recommendations.push("Check if audio generation completed successfully")
      }

      // Check if size is reasonable for speech (not too large)
      const maxExpectedSize = 24000 * 2 * 30 // 30 seconds max
      if (audioBuffer.length > maxExpectedSize) {
        issues.push(`Audio data very large: ${audioBuffer.length} bytes (over ${maxExpectedSize})`)
        recommendations.push("Consider breaking long text into smaller chunks")
      }

      // Check if size is consistent with 16-bit samples
      if (audioBuffer.length % 2 !== 0) {
        issues.push("Audio data length is not even (expected for 16-bit samples)")
        recommendations.push("Verify audio encoding format with API provider")
      }

      // Analyze the format
      const formatInfo = this.analyzeReceivedAudio(base64AudioData)

      if (formatInfo.estimatedDuration > 10) {
        recommendations.push("Consider shorter audio clips for better user experience")
      }

      if (formatInfo.sizeInMB > 1) {
        recommendations.push("Audio file is large - consider compression or shorter content")
      }
    } catch (error) {
      issues.push(`Failed to decode base64 audio data: ${error}`)
      recommendations.push("Verify the audio data is properly base64 encoded")
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    }
  }

  /**
   * Gets detailed information about our audio processing pipeline
   */
  static getAudioPipelineInfo(): {
    input: string
    processing: string[]
    output: string
    memoryUsage: string
  } {
    return {
      input: "Base64 encoded PCM audio from Gemini Live API",
      processing: [
        "1. Decode base64 string to Uint8Array",
        "2. Convert 16-bit signed PCM to float32",
        "3. Create Web Audio API AudioBuffer",
        "4. Connect to audio context destination",
        "5. Play through browser audio system",
      ],
      output: "Audio playback through Web Audio API",
      memoryUsage: "~2x audio size during conversion (original + AudioBuffer)",
    }
  }
}

// Example usage and testing
export function logAudioFormatExample(base64AudioData: string) {
  console.log("🎵 Audio Format Analysis:")

  const formatInfo = AudioFormatAnalyzer.analyzeReceivedAudio(base64AudioData)
  console.log("📊 Format Details:", formatInfo)

  const validation = AudioFormatAnalyzer.validateAudioFormat(base64AudioData)
  console.log("✅ Validation:", validation)

  const pipelineInfo = AudioFormatAnalyzer.getAudioPipelineInfo()
  console.log("🔄 Processing Pipeline:", pipelineInfo)

  // Memory usage estimation
  const memoryMB = formatInfo.sizeInMB * 2 // Original + AudioBuffer
  console.log(`💾 Estimated Memory Usage: ${memoryMB}MB per audio clip`)
}
