import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Heart, MessageCircle, UserPlus, Search, Filter, MapPin, Clock } from "lucide-react";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock data for demo purposes
  const currentBuddies = [
    {
      id: 1,
      name: "Margaret Chen",
      age: 68,
      location: "Queenstown",
      interests: ["Reading", "Gardening", "Tai Chi"],
      status: "online",
      avatar: "MC",
      lastActive: "2 minutes ago",
      relationship: "accepted"
    },
    {
      id: 2,
      name: "Robert Lee",
      age: 72,
      location: "Toa Payoh",
      interests: ["Chess", "Cooking", "Walking"],
      status: "offline",
      avatar: "RL",
      lastActive: "1 hour ago",
      relationship: "accepted"
    },
    {
      id: 3,
      name: "Susan Wong",
      age: 65,
      location: "Clementi",
      interests: ["Yoga", "Music", "Art"],
      status: "online",
      avatar: "SW",
      lastActive: "Active now",
      relationship: "accepted"
    }
  ];

  const suggestedBuddies = [
    {
      id: 4,
      name: "David Tan",
      age: 70,
      location: "Ang Mo Kio",
      interests: ["Photography", "Travel", "Reading"],
      avatar: "DT",
      matchScore: 95,
      mutualInterests: 2
    },
    {
      id: 5,
      name: "Helen Lim",
      age: 66,
      location: "Bishan",
      interests: ["Dancing", "Cooking", "Gardening"],
      avatar: "HL",
      matchScore: 88,
      mutualInterests: 1
    },
    {
      id: 6,
      name: "Peter Wu",
      age: 69,
      location: "Jurong",
      interests: ["Swimming", "Tai Chi", "Chess"],
      avatar: "PW",
      matchScore: 92,
      mutualInterests: 3
    }
  ];

  const pendingRequests = [
    {
      id: 7,
      name: "Grace Ng",
      age: 67,
      location: "Bedok",
      interests: ["Knitting", "Baking", "Reading"],
      avatar: "GN",
      requestType: "received",
      timeAgo: "2 hours ago"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Friends</h1>
            <p className="text-gray-600 mt-1">Connect with fellow seniors and build meaningful friendships</p>
          </div>
          <button className="flex items-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
            <UserPlus className="mr-2 h-5 w-5" />
            Find New Buddies
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, interests, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="mr-2 h-5 w-5 text-gray-500" />
              Filters
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Buddy Requests</h2>
              <p className="text-gray-600 text-sm mt-1">{pendingRequests.length} pending request(s)</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {request.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <p className="text-sm text-gray-600">{request.age} years • {request.location}</p>
                        <p className="text-xs text-blue-600 mt-1">Sent {request.timeAgo}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
                        Accept
                      </button>
                      <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Buddies */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Buddies</h2>
            <p className="text-gray-600 text-sm mt-1">{currentBuddies.length} active friendship(s)</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentBuddies.map((buddy) => (
                <div key={buddy.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {buddy.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          buddy.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{buddy.name}</h3>
                        <p className="text-sm text-gray-600">{buddy.age} years</p>
                      </div>
                    </div>
                    <Heart className="h-5 w-5 text-pink-500" />
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {buddy.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {buddy.lastActive}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Shared Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {buddy.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Buddies */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Suggested for You</h2>
            <p className="text-gray-600 text-sm mt-1">People you might want to connect with</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suggestedBuddies.map((buddy) => (
                <div key={buddy.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {buddy.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{buddy.name}</h3>
                        <p className="text-sm text-gray-600">{buddy.age} years</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{buddy.matchScore}%</div>
                      <div className="text-xs text-green-600">match</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {buddy.location}
                    </div>
                    <div className="text-sm text-gray-600">
                      {buddy.mutualInterests} mutual interest{buddy.mutualInterests !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {buddy.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Connect
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                      Profile
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
