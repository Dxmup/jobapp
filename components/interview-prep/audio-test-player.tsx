"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Download } from "lucide-react"

interface AudioTestPlayerProps {
  audioUrl?: string
  audioData?: ArrayBuffer
  title?: string
}

export function AudioTestPlayer({ audioUrl, audioData, title = "Test Audio" }: AudioTestPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a")
      a.href = audioUrl
      a.download = `${title.replace(/\s+/g, "_")}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!audioUrl && !audioData) {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        <div className="flex items-center gap-2">
          <Button onClick={handlePlayPause} size="sm" variant="outline">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1 text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button onClick={downloadAudio} size="sm" variant="ghost">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-100"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>

        {audioData && (
          <div className="text-xs text-muted-foreground">
            Audio size: {audioData.byteLength} bytes ({(audioData.byteLength / 1024).toFixed(1)} KB)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
