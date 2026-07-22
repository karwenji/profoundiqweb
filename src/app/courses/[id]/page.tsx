'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { courses } from '@/data/courses'
import { getModulesWithLessons } from '@/lib/courseWorkflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/store/cart'
import { Star, Clock, Users, BookOpen, CheckCircle, PlayCircle, ArrowLeft, Zap, Trophy, ChevronRight, Lock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = courses.find(c => c.id === courseId)
  const { addItem } = useCart()
  const [showFullCurriculum, setShowFullCurriculum] = useState(false)

  const modulesWithLessons = course ? getModulesWithLessons(course.id) : []
  const totalXP = modulesWithLessons.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.xpReward, 0), 0)
  const totalLessons = modulesWithLessons.reduce((sum, m) => sum + m.lessons.length, 0)

  if (!course) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      courseId: course.id,
      title: course.title,
      price: course.price,
      image: course.image,
    })
  }

  const displayedModules = showFullCurriculum ? modulesWithLessons : modulesWithLessons.slice(0, 2)

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Link href="/courses" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <Link href={`/courses?rating=${course.rating}`} className="flex items-center hover:text-primary transition-colors">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="ml-1">({course.students.toLocaleString()} students)</span>
                </Link>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-1" />
                  <span>{totalLessons} lessons</span>
                </div>
                <Link href={`/courses?level=${course.level}`} className="flex items-center hover:text-primary transition-colors">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{course.level}</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-600">Instructor:</span>
                <Link href={`/courses?instructor=${encodeURIComponent(course.instructor)}`} className="font-semibold text-blue-600 hover:underline">
                  {course.instructor}
                </Link>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-600">Category:</span>
                <Link href={`/courses?category=${encodeURIComponent(course.category)}`} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                  {course.category}
                </Link>
              </div>
            </div>

            {/* Gamification Overview */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Learning Outcomes & Rewards</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{totalXP.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Total XP Available</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{modulesWithLessons.length}</p>
                    <p className="text-sm text-green-700">Modules</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{totalLessons}</p>
                    <p className="text-sm text-purple-700">Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <ul className="space-y-3">
                  {course.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
                <div className="space-y-4">
                  {displayedModules.map((module) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{module.title}</h3>
                            <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                          </div>
                          <Badge variant="outline">{module.unlockRule}</Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {module.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-3">
                                  <span>{lesson.durationMinutes} min</span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-blue-500" />
                                    {lesson.xpReward} XP
                                  </span>
                                </div>
                              </div>
                            </div>
                            {lesson.isFree ? (
                              <div className="flex items-center text-green-600 text-sm">
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Preview
                              </div>
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {modulesWithLessons.length > 2 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowFullCurriculum(!showFullCurriculum)}>
                    {showFullCurriculum ? 'Show Less' : `Show All ${modulesWithLessons.length} Modules`}
                    <ChevronRight className={`h-4 w-4 ml-2 ${showFullCurriculum ? 'rotate-90' : ''}`} />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                </div>

                <div className="mb-4">
                  {course.originalPrice && (
                    <div className="text-lg text-gray-600 line-through mb-1">{formatPrice(course.originalPrice)}</div>
                  )}
                  <div className="text-3xl font-bold text-primary">{formatPrice(course.price)}</div>
                </div>

                <Button onClick={handleAddToCart} className="w-full mb-3" size="lg">
                  Add to Cart
                </Button>

                <Link href={`/checkout?course=${course.id}`} className="block">
                  <Button variant="secondary" className="w-full" size="lg">
                    Enroll Now
                  </Button>
                </Link>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Access on mobile and desktop</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

