import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Heart, User, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  price: number;
  duration: string;
  thumbnail: string;
  category: string;
  enrollment_count: number;
}

interface Enrollment {
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: Course;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('Dashboard: Fetching data for user:', user.id);
      fetchDashboardData();
    } else {
      console.log('Dashboard: No user found');
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('Dashboard: No user available for data fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Dashboard: Starting data fetch for user:', user.id);
      
      // Fetch enrolled courses with specific foreign key relationship
      console.log('Dashboard: Fetching enrollments...');
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          progress,
          enrolled_at,
          courses!enrollments_course_id_fkey (
            id,
            title,
            description,
            instructor,
            difficulty,
            price,
            duration,
            thumbnail,
            category,
            enrollment_count
          )
        `)
        .eq('user_id', user.id);

      if (enrollmentError) {
        console.error('Dashboard: Error fetching enrollments:', enrollmentError);
      } else {
        console.log('Dashboard: Enrollments fetched successfully:', enrollments);
        if (enrollments && enrollments.length > 0) {
          setEnrolledCourses(enrollments);
          const completed = enrollments.filter(e => e.progress >= 100).length;
          setCompletedCount(completed);
          console.log('Dashboard: Found', enrollments.length, 'enrollments,', completed, 'completed');
        } else {
          console.log('Dashboard: No enrollments found for user');
          setEnrolledCourses([]);
          setCompletedCount(0);
        }
      }

      // Fetch wishlist count with detailed logging
      console.log('Dashboard: Fetching wishlist...');
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Dashboard: Error fetching wishlist:', wishlistError);
      } else {
        console.log('Dashboard: Wishlist fetched successfully:', wishlist);
        if (wishlist) {
          setWishlistCount(wishlist.length);
          console.log('Dashboard: Found', wishlist.length, 'wishlist items');
        } else {
          setWishlistCount(0);
        }
      }

    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      console.log('Dashboard: Data fetch completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600">Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wishlistCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link to="/student/mylearning">
            <Button className="w-full h-20 flex flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              My Learning
            </Button>
          </Link>
          <Link to="/student/courses">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              Browse Courses
            </Button>
          </Link>
          <Link to="/student/wishlist">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Heart className="w-6 h-6" />
              Wishlist
            </Button>
          </Link>
          <Link to="/student/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <User className="w-6 h-6" />
              Profile
            </Button>
          </Link>
        </div>

        {/* Continue Learning */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {enrolledCourses.slice(0, 4).map((enrollment) => {
                const course = enrollment.courses;
                return (
                  <Card key={enrollment.course_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>By {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="w-full" />
                      </div>
                      <Link to={`/student/learn/${course.id}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No enrolled courses yet</h3>
              <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
              <Link to="/student/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
