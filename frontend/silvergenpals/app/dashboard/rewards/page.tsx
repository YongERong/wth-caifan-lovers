import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Award, Star, Gift, Trophy, TrendingUp, Calendar, Target, Clock } from "lucide-react";

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock data for demo purposes
  const userStats = {
    totalPoints: 324,
    thisMonth: 42,
    level: "Silver",
    nextLevel: "Gold",
    pointsToNext: 176,
    activitiesCompleted: 23,
    rewardsEarned: 8
  };

  const availableRewards = [
    {
      id: 1,
      title: "Free Coffee & Cake",
      description: "Enjoy a complimentary coffee and slice of cake at the cafe",
      points: 50,
      category: "Food & Drink",
      available: 15,
      icon: "☕",
      popular: true
    },
    {
      id: 2,
      title: "One-Hour Massage",
      description: "Relaxing therapeutic massage session with our wellness therapist",
      points: 150,
      category: "Wellness",
      available: 5,
      icon: "💆‍♀️",
      premium: true
    },
    {
      id: 3,
      title: "Garden Tools Set",
      description: "Complete set of gardening tools for your hobby",
      points: 200,
      category: "Hobby",
      available: 3,
      icon: "🌱",
      limited: true
    },
    {
      id: 4,
      title: "Art Supplies Bundle",
      description: "Premium art supplies including paints, brushes, and canvas",
      points: 120,
      category: "Arts & Crafts",
      available: 8,
      icon: "🎨"
    },
    {
      id: 5,
      title: "Book Store Voucher",
      description: "$20 voucher to spend at the local bookstore",
      points: 80,
      category: "Education",
      available: 12,
      icon: "📚"
    },
    {
      id: 6,
      title: "Cooking Class Pass",
      description: "Free entry to any premium cooking class",
      points: 100,
      category: "Learning",
      available: 6,
      icon: "👨‍🍳"
    }
  ];

  const recentRewards = [
    {
      id: 1,
      title: "Free Coffee & Cake",
      pointsUsed: 50,
      dateRedeemed: "2024-09-18",
      status: "redeemed"
    },
    {
      id: 2,
      title: "Book Store Voucher",
      pointsUsed: 80,
      dateRedeemed: "2024-09-15",
      status: "redeemed"
    },
    {
      id: 3,
      title: "Art Supplies Bundle",
      pointsUsed: 120,
      dateRedeemed: "2024-09-10",
      status: "redeemed"
    }
  ];

  const pointsHistory = [
    { activity: "Morning Tai Chi", points: 15, date: "2024-09-20", type: "earned" },
    { activity: "Book Club Discussion", points: 10, date: "2024-09-19", type: "earned" },
    { activity: "Free Coffee & Cake", points: -50, date: "2024-09-18", type: "spent" },
    { activity: "Cooking Workshop", points: 25, date: "2024-09-17", type: "earned" },
    { activity: "Nature Walk", points: 15, date: "2024-09-16", type: "earned" }
  ];

  const achievements = [
    { title: "First Steps", description: "Complete your first activity", icon: "🏆", unlocked: true },
    { title: "Social Butterfly", description: "Make 5 new buddies", icon: "🦋", unlocked: true },
    { title: "Activity Enthusiast", description: "Join 20 activities", icon: "⭐", unlocked: true },
    { title: "Helper", description: "Help organize an activity", icon: "🤝", unlocked: false },
    { title: "Mentor", description: "Guide 3 new members", icon: "👨‍🏫", unlocked: false },
    { title: "Century Club", description: "Accumulate 500 points", icon: "💯", unlocked: false }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards & Points</h1>
            <p className="text-gray-600 mt-1">Earn points through activities and redeem exciting rewards</p>
          </div>
        </div>

        {/* Points Overview */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold mb-2">{userStats.totalPoints}</h2>
              <p className="text-purple-100">Total Points</p>
              <p className="text-sm text-purple-200 mt-1">+{userStats.thisMonth} this month</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-3">
                <Trophy className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold">{userStats.level} Level</h3>
              <p className="text-purple-200 text-sm">{userStats.pointsToNext} points to {userStats.nextLevel}</p>
            </div>
            
            <div className="text-center md:text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{userStats.activitiesCompleted}</p>
                  <p className="text-purple-200 text-sm">Activities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.rewardsEarned}</p>
                  <p className="text-purple-200 text-sm">Rewards</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{userStats.level}</span>
              <span>{userStats.nextLevel}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-300"
                style={{ width: `${(324 / 500) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Available Rewards</h2>
                <p className="text-gray-600 text-sm mt-1">Redeem your points for exciting rewards</p>
              </div>
              <Gift className="h-6 w-6 text-pink-500" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableRewards.map((reward) => (
                <div key={reward.id} className="relative bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {reward.popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    {reward.premium && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        Premium
                      </span>
                    )}
                    {reward.limited && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Limited
                      </span>
                    )}
                  </div>
                  
                  <div className="text-4xl mb-4">{reward.icon}</div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-purple-600">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{reward.points} points</span>
                    </div>
                    <span className="text-sm text-gray-500">{reward.available} available</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {reward.category}
                    </span>
                    <button 
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        userStats.totalPoints >= reward.points
                          ? 'bg-pink-500 hover:bg-pink-600 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={userStats.totalPoints < reward.points}
                    >
                      {userStats.totalPoints >= reward.points ? 'Redeem' : 'Need More Points'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
              <p className="text-gray-600 text-sm mt-1">Your recent point activity</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pointsHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {entry.type === 'earned' ? (
                          <TrendingUp className={`h-4 w-4 ${entry.type === 'earned' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <Gift className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.activity}</p>
                        <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      entry.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'earned' ? '+' : ''}{entry.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              <p className="text-gray-600 text-sm mt-1">Your progress milestones</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg ${
                    achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-green-600">
                        <Trophy className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Rewards */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recently Redeemed</h3>
            <p className="text-gray-600 text-sm mt-1">Your reward redemption history</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{reward.title}</h4>
                      <p className="text-sm text-gray-600">
                        Redeemed on {new Date(reward.dateRedeemed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">-{reward.pointsUsed} points</p>
                    <p className="text-sm text-green-600 capitalize">{reward.status}</p>
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
