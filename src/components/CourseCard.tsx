import Image from 'next/image'
import Link from 'next/link'
import { Course } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Star, Clock, Users, BookOpen } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
          {course.category}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{course.lessons} lessons</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-2">
        <div>
          {course.originalPrice && (
            <span className="text-sm text-muted-foreground line-through mr-2">
              {formatPrice(course.originalPrice)}
            </span>
          )}
          <span className="text-xl font-bold text-primary">
            {formatPrice(course.price)}
          </span>
        </div>
        <Link href={`/courses/${course.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}