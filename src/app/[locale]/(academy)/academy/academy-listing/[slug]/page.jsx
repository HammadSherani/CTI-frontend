'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourseDetails as fetchCourseDetailsAction } from '@/store/academy'
import Image from 'next/image'
import SmallLoader from '@/components/SmallLoader'

export default function CoursePage() {
  const params = useParams()
  const slug = params?.slug
  const slugParam = Array.isArray(slug) ? slug[0] : slug
  const router = useRouter()
  const dispatch = useDispatch()

  const { courseDetails } = useSelector((state) => state.academy || {})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slugParam) return
    const load = async () => {
      try {
        setLoading(true)
        await dispatch(fetchCourseDetailsAction(slugParam)).unwrap()
      } catch (err) {
        console.error('Error fetching course details:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slugParam, dispatch])

  const course = courseDetails || null

  const imageSrc =
    course?.image &&
    typeof course.image === 'string' &&
    (course.image.startsWith('http') || course.image.startsWith('/'))
      ? course.image
      : '/assets/logo/trendyol.png'

  // Helper function to get category name
  const getCategoryName = (category) => {
    if (!category) return 'General'
    if (typeof category === 'string') return category
    if (typeof category === 'object' && category.title) return category.title
    return 'General'
  }

  // Improved Video Player Component
  function VideoPlayer({ src, poster }) {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
      const v = videoRef.current
      if (!v) return

      const onLoaded = () => {
        setDuration(v.duration || 0)
      }
      const onTime = () => {
        setCurrentTime(v.currentTime || 0)
      }
      const onEnded = () => {
        setPlaying(false)
      }
      const onPlay = () => setPlaying(true)
      const onPause = () => setPlaying(false)

      v.addEventListener('loadedmetadata', onLoaded)
      v.addEventListener('timeupdate', onTime)
      v.addEventListener('ended', onEnded)
      v.addEventListener('play', onPlay)
      v.addEventListener('pause', onPause)

      return () => {
        v.removeEventListener('loadedmetadata', onLoaded)
        v.removeEventListener('timeupdate', onTime)
        v.removeEventListener('ended', onEnded)
        v.removeEventListener('play', onPlay)
        v.removeEventListener('pause', onPause)
      }
    }, [])

    useEffect(() => {
      const v = videoRef.current
      if (!v) return
      v.muted = muted
    }, [muted])

    useEffect(() => {
      const v = videoRef.current
      if (!v) return
      v.volume = volume
    }, [volume])

    useEffect(() => {
      const v = videoRef.current
      if (!v) return
      v.playbackRate = playbackRate
    }, [playbackRate])

    const togglePlay = async () => {
      const v = videoRef.current
      if (!v) return
      try {
        if (v.paused) {
          await v.play()
          setPlaying(true)
        } else {
          v.pause()
          setPlaying(false)
        }
      } catch (err) {
        console.error('Play error:', err)
      }
    }

    const handleSeek = (e) => {
      const bar = e.currentTarget
      const rect = bar.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const pct = Math.max(0, Math.min(1, clickX / rect.width))
      const v = videoRef.current
      if (!v) return
      v.currentTime = pct * duration
      setCurrentTime(v.currentTime)
    }

    useEffect(() => {
      const handleFs = () => {
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
        setIsFullscreen(!!fsEl)
      }
      document.addEventListener('fullscreenchange', handleFs)
      document.addEventListener('webkitfullscreenchange', handleFs)
      document.addEventListener('mozfullscreenchange', handleFs)
      document.addEventListener('MSFullscreenChange', handleFs)
      return () => {
        document.removeEventListener('fullscreenchange', handleFs)
        document.removeEventListener('webkitfullscreenchange', handleFs)
        document.removeEventListener('mozfullscreenchange', handleFs)
        document.removeEventListener('MSFullscreenChange', handleFs)
      }
    }, [])

    const toggleFullscreen = () => {
      const el = containerRef.current || videoRef.current
      if (!el) return
      const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
      if (!isFs) {
        try {
          request.call(el)
        } catch (err) {
          // some browsers may require calling on video element
          try { (videoRef.current.requestFullscreen || videoRef.current.webkitRequestFullscreen).call(videoRef.current) } catch (_) {}
        }
      } else {
        try { exit.call(document) } catch (_) {}
      }
    }

    const formatTime = (t) => {
      if (!t && t !== 0) return '00:00'
      const flo = Math.floor(t)
      const mm = String(Math.floor(flo / 60)).padStart(2, '0')
      const ss = String(flo % 60).padStart(2, '0')
      return `${mm}:${ss}`
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
      <div
        ref={containerRef}
        className="relative h-full w-full bg-black rounded-lg overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(playing ? false : true)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full object-contain"
          style={{ height: isFullscreen ? '100vh' : '50vh' }}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          preload="metadata"
        />

        {/* Play/Pause Overlay */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
              <Icon icon="mdi:play" className="text-5xl text-black ml-1" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div
            className="w-full h-1 bg-gray-600 rounded cursor-pointer mb-3 hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-orange-500 rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-3 text-white">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-orange-500">
              <Icon
                icon={playing ? 'mdi:pause' : 'mdi:play'}
                className="text-2xl"
              />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className="hover:text-orange-500"
              >
                <Icon
                  icon={
                    muted || volume === 0
                      ? 'mdi:volume-off'
                      : volume < 0.5
                      ? 'mdi:volume-medium'
                      : 'mdi:volume-high'
                  }
                  className="text-xl"
                />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value)
                  setVolume(newVolume)
                  if (newVolume > 0) setMuted(false)
                }}
                className="w-20 h-1 accent-orange-500"
              />
            </div>

            {/* Time Display */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value)
                setPlaybackRate(rate)
              }}
              className="text-sm bg-gray-800 text-white rounded px-2 py-1 cursor-pointer hover:bg-gray-700"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-orange-500"
            >
              <Icon icon="mdi:fullscreen" className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <Icon icon="mdi:arrow-left" />
        Back
      </button>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <SmallLoader />
        </div>
      ) : course ? (
        <div className="space-y-6 h-full">
          {/* Course Header */}

          <div className='grid grid-cols-2 bg-white rounded-lg shadow-md p-4'>

<div className="flex flex-col justify-between p-3 gap-4">
  <div className="">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-4">
              Category: {getCategoryName(course.category)}
            </p>
            <p className="text-gray-700 leading-relaxed ">{course.description}</p>
          
          </div>
     {/* Course Actions */}
          <div className="flex justify-start items-end gap-4">
            <button
              onClick={() => router.push('/academy/academy-listing')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Explore More Courses
            </button>
            <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Icon icon="mdi:share-variant" />
              Share
            </button>
          </div>
          
</div>

          {/* Video Player */}
          {course.video ? (
            <div className="h-[50vh]">
              {/* <h2 className="text-2xl font-bold mb-4">Course Video</h2> */}
              <VideoPlayer src={course.video} poster={imageSrc} />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Icon
                icon="mdi:video-off"
                className="text-6xl text-gray-400 mx-auto mb-4"
              />
              <p className="text-gray-600">No video available for this course</p>
            </div>
          )}
          </div>

         

        
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-6xl text-gray-400 mx-auto mb-4"
          />
          <p className="text-xl text-gray-600">Course not found.</p>
        </div>
      )}
    </div>
  )
}