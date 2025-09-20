import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Calendar, MapPin, Clock, Users, Star, Plus, Search, Filter, Heart } from "lucide-react";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock data for demo purposes
  const featuredActivities = [
    {
      id: 1,
      title: "Morning Tai Chi",
      description: "Gentle movement practice perfect for maintaining flexibility and balance",
      category: "Exercise",
      date: "2024-09-21",
      time: "9:00 AM - 10:00 AM",
      location: "Garden Pavilion",
      participants: 12,
      maxParticipants: 20,
      difficulty: "Beginner",
      points: 15,
      image: "🧘‍♀️",
      isRegistered: true
    },
    {
      id: 2,
      title: "Creative Watercolor Painting",
      description: "Express yourself through beautiful watercolor techniques with guided instruction",
      category: "Arts & Crafts",
      date: "2024-09-22",
      time: "2:00 PM - 4:00 PM",
      location: "Art Studio",
      participants: 8,
      maxParticipants: 15,
      difficulty: "All Levels",
      points: 20,
      image: "🎨",
      isRegistered: false
    },
    {
      id: 3,
      title: "Book Club: Classic Literature",
      description: "Join us for engaging discussions about timeless novels and stories",
      category: "Social",
      date: "2024-09-23",
      time: "10:30 AM - 12:00 PM",
      location: "Library Lounge",
      participants: 6,
      maxParticipants: 12,
      difficulty: "All Levels",
      points: 10,
      image: "📚",
      isRegistered: false
    }
  ];

  const upcomingActivities = [
    {
      id: 4,
      title: "Cooking Workshop: Asian Delights",
      description: "Learn to prepare delicious traditional Asian dishes",
      category: "Cooking",
      date: "2024-09-24",
      time: "11:00 AM - 1:00 PM",
      location: "Community Kitchen",
      participants: 4,
      maxParticipants: 8,
      difficulty: "Intermediate",
      points: 25,
      image: "👨‍🍳"
    },
    {
      id: 5,
      title: "Nature Photography Walk",
      description: "Explore the beautiful gardens while learning photography tips",
      category: "Outdoor",
      date: "2024-09-25",
      time: "8:00 AM - 10:00 AM",
      location: "Botanical Gardens",
      participants: 7,
      maxParticipants: 10,
      difficulty: "All Levels",
      points: 15,
      image: "📸"
    },
    {
      id: 6,
      title: "Music Therapy Session",
      description: "Relaxing musical activities to enhance wellbeing and memory",
      category: "Wellness",
      date: "2024-09-26",
      time: "3:00 PM - 4:30 PM",
      location: "Music Room",
      participants: 10,
      maxParticipants: 15,
      difficulty: "All Levels",
      points: 18,
      image: "🎵"
    }
  ];

  const categories = [
    { name: "All", count: 24, active: true },
    { name: "Exercise", count: 8, active: false },
    { name: "Arts & Crafts", count: 6, active: false },
    { name: "Social", count: 5, active: false },
    { name: "Cooking", count: 3, active: false },
    { name: "Wellness", count: 2, active: false }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600 mt-1">Discover and join engaging activities at your care center</p>
          </div>
          <button className="flex items-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
            <Plus className="mr-2 h-5 w-5" />
            Suggest Activity
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities by name, category, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="mr-2 h-5 w-5 text-gray-500" />
              Filters
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category.active
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Activities */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Featured This Week</h2>
            <p className="text-gray-600 text-sm mt-1">Popular activities you might enjoy</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredActivities.map((activity) => (
                <div key={activity.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl mb-2">{activity.image}</div>
                    <div className="flex items-center space-x-2">
                      {activity.isRegistered && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Registered
                        </span>
                      )}
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{activity.points}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {activity.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {activity.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {activity.participants}/{activity.maxParticipants} joined
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {activity.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {activity.difficulty}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {activity.isRegistered ? (
                      <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                        Registered
                      </button>
                    ) : (
                      <button className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
                        Join Activity
                      </button>
                    )}
                    <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                      <Heart className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Activities</h2>
            <p className="text-gray-600 text-sm mt-1">More activities to explore</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-3xl">{activity.image}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <div className="flex items-center text-yellow-500 ml-4">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{activity.points}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(activity.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {activity.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {activity.participants}/{activity.maxParticipants}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {activity.category}
                    </span>
                    <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
