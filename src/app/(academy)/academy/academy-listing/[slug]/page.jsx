'use client'

import React, { useEffect, useState } from 'react'
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
  const imageSrc = course?.image && (typeof course.image === 'string') && (course.image.startsWith('http') || course.image.startsWith('/'))
    ? course.image
    : '/assets/logo/trendyol.png'

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-600"
      >
        ← Back
      </button>

      {loading ? (
        <SmallLoader loading={true} text="Initializing Academy..." />
      ) : course ? (
        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 h-64 relative">
                <Image src={imageSrc} alt={course?.title || 'course image'} fill className="object-cover" />
            </div>

            <div className="md:w-1/2 p-6">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              <div className="text-sm text-gray-500 mb-4">
                Category: {course.title || 'General'}
              </div>
              <p className="text-gray-700 mb-4">{course.description}</p>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => router.push('/academy/academy-listing')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Explore Courses
                </button>
                <button className="px-4 py-2 border rounded-lg">
                  Share
                </button>
              </div>

              <div className="text-xs text-gray-400">
                Created:{' '}
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleString()
                  : '-'}
              </div>
            </div>
          </div>

          <div className="p-6 border-t">
            <h3 className="font-semibold mb-3">Course Content</h3>
            <p className="text-sm text-gray-700 mb-4">
              {course.video ? `Video: ${course.video}` : 'No video available'}
            </p>
            <div className="text-sm text-gray-500">
              Slug: {course.slug}
            </div>
          </div>
        </article>
      ) : (
        <div className="text-center py-20">Course not found.</div>
      )}
    </main>
  )
}
