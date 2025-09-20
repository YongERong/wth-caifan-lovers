import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Calendar, Users, Award, Clock, TrendingUp, MapPin } from "lucide-react";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock data for demo purposes
  const upcomingActivities = [
    {
      id: 1,
      title: "Morning Tai Chi",
      time: "9:00 AM",
      location: "Garden Pavilion",
      participants: 12,
      date: "Today"
    },
    {
      id: 2,
      title: "Book Club Discussion",
      time: "2:00 PM",
      location: "Library",
      participants: 8,
      date: "Tomorrow"
    },
    {
      id: 3,
      title: "Cooking Workshop",
      time: "10:30 AM",
      location: "Kitchen",
      participants: 6,
      date: "Friday"
    }
  ];

  const recentBuddies = [
    { id: 1, name: "Margaret Chen", status: "online", avatar: "MC" },
    { id: 2, name: "Robert Lee", status: "offline", avatar: "RL" },
    { id: 3, name: "Susan Wong", status: "online", avatar: "SW" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pt-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-pink-100 text-lg">
            Ready to connect and explore new activities today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Buddies</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Activities Joined</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Points Earned</p>
                <p className="text-3xl font-bold text-gray-900">324</p>
              </div>
              <Award className="h-10 w-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-3xl font-bold text-gray-900">+42</p>
              </div>
              <TrendingUp className="h-10 w-10 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Activities */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Activities</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <Clock className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {activity.time} • {activity.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {activity.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.participants} joined</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors">
              View All Activities
            </button>
          </div>

          {/* Recent Buddies */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Buddies</h2>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentBuddies.map((buddy) => (
                <div key={buddy.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {buddy.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      buddy.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{buddy.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{buddy.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors">
              Find New Buddies
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-blue-900">Join an Activity</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-medium text-green-900">Find Buddies</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Award className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-purple-900">View Rewards</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
