"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, X, Calendar, Clock, MapPin, Users, Star, Filter, Trash2 } from "lucide-react";
import Link from "next/link";

interface SwipeHistoryItem {
  id: string;
  action: 'yes' | 'no';
  swiped_at: string;
  activity_id: string;
  // We'll mock the activity data since we don't have full opportunities table
  activity: {
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    maxParticipants: number;
    points: number;
    image: string;
  };
}

interface SwipeHistoryClientProps {
  userId: string;
}

export default function SwipeHistoryClient({ userId }: SwipeHistoryClientProps) {
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
  const supabase = createClient();

  // Mock activity data - in a real app, this would come from joining with opportunities table
  const mockActivities = {
    1: {
      title: "Morning Tai Chi",
      description: "Gentle movement practice perfect for maintaining flexibility and balance",
      category: "Exercise",
      date: "2024-09-21",
      time: "9:00 AM - 10:00 AM",
      location: "Garden Pavilion",
      participants: 12,
      maxParticipants: 20,
      points: 15,
      image: "🧘‍♀️"
    },
    2: {
      title: "Creative Watercolor Painting",
      description: "Express yourself through beautiful watercolor techniques with guided instruction",
      category: "Arts & Crafts",
      date: "2024-09-22",
      time: "2:00 PM - 4:00 PM",
      location: "Art Studio",
      participants: 8,
      maxParticipants: 15,
      points: 20,
      image: "🎨"
    },
    3: {
      title: "Book Club: Classic Literature",
      description: "Join us for engaging discussions about timeless novels and stories",
      category: "Social",
      date: "2024-09-23",
      time: "10:30 AM - 12:00 PM",
      location: "Library Lounge",
      participants: 6,
      maxParticipants: 12,
      points: 10,
      image: "📚"
    },
    4: {
      title: "Cooking Workshop: Asian Delights",
      description: "Learn to prepare delicious traditional Asian dishes",
      category: "Cooking",
      date: "2024-09-24",
      time: "11:00 AM - 1:00 PM",
      location: "Community Kitchen",
      participants: 4,
      maxParticipants: 8,
      points: 25,
      image: "👨‍🍳"
    },
    5: {
      title: "Nature Photography Walk",
      description: "Explore the beautiful gardens while learning photography tips",
      category: "Outdoor",
      date: "2024-09-25",
      time: "8:00 AM - 10:00 AM",
      location: "Botanical Gardens",
      participants: 7,
      maxParticipants: 10,
      points: 15,
      image: "📸"
    },
    6: {
      title: "Music Therapy Session",
      description: "Relaxing musical activities to enhance wellbeing and memory",
      category: "Wellness",
      date: "2024-09-26",
      time: "3:00 PM - 4:30 PM",
      location: "Music Room",
      participants: 10,
      maxParticipants: 15,
      points: 18,
      image: "🎵"
    }
  };

  useEffect(() => {
    fetchSwipeHistory();
  }, []);

  const fetchSwipeHistory = async () => {
    try {
      console.log('Fetching swipe history for user:', userId);

      const { data, error } = await supabase
        .from('swipe_history')
        .select('*')
        .eq('swiper_id', userId)
        .order('swiped_at', { ascending: false });

      if (error) {
        console.error('Error fetching swipe history:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      console.log('Swipe history data:', data);

      // Transform data to include mock activity details
      const historyWithActivities: SwipeHistoryItem[] = (data || []).map(item => {
        // Map UUIDs back to integer IDs for mock data lookup
        const uuidToIdMap: { [key: string]: number } = {
          '00000000-0000-0000-0000-000000000001': 1,
          '00000000-0000-0000-0000-000000000002': 2,
          '00000000-0000-0000-0000-000000000003': 3,
          '00000000-0000-0000-0000-000000000004': 4,
          '00000000-0000-0000-0000-000000000005': 5,
          '00000000-0000-0000-0000-000000000006': 6
        };

        const activityId = uuidToIdMap[item.activity_id] || 0;

        console.log('Processing swipe item:', {
          activity_id: item.activity_id,
          mapped_id: activityId
        });

        return {
          ...item,
          activity: mockActivities[activityId as keyof typeof mockActivities] || {
            title: "Unknown Activity",
            description: "Activity details not available",
            category: "Unknown",
            date: "TBD",
            time: "TBD",
            location: "TBD",
            participants: 0,
            maxParticipants: 0,
            points: 0,
            image: "❓"
          }
        };
      });

      console.log('Processed history:', historyWithActivities);
      setSwipeHistory(historyWithActivities);
    } catch (error) {
      console.error('Error fetching swipe history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSwipeHistory = async (swipeId: string) => {
    try {
      const { error } = await supabase
        .from('swipe_history')
        .delete()
        .eq('id', swipeId);

      if (error) {
        console.error('Error deleting swipe:', error);
        return;
      }

      setSwipeHistory(prev => prev.filter(item => item.id !== swipeId));
    } catch (error) {
      console.error('Error deleting swipe:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all swipe history? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('swipe_history')
        .delete()
        .eq('swiper_id', userId);

      if (error) {
        console.error('Error clearing history:', error);
        return;
      }

      setSwipeHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const filteredHistory = swipeHistory.filter(item => {
    if (filter === 'all') return true;
    return item.action === filter;
  });

  const stats = {
    total: swipeHistory.length,
    liked: swipeHistory.filter(item => item.action === 'yes').length,
    passed: swipeHistory.filter(item => item.action === 'no').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/activities"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swipe History</h1>
            <p className="text-gray-600">Your activity swiping history and preferences</p>
          </div>
        </div>
        {swipeHistory.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Swipes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Liked Activities</p>
              <p className="text-3xl font-bold text-green-600">{stats.liked}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Passed Activities</p>
              <p className="text-3xl font-bold text-red-600">{stats.passed}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter History</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('yes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'yes'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Liked ({stats.liked})
          </button>
          <button
            onClick={() => setFilter('no')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'no'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Passed ({stats.passed})
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {filter === 'all' ? 'All Swipes' : filter === 'yes' ? 'Liked Activities' : 'Passed Activities'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredHistory.length} {filteredHistory.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">
              {filter === 'all' ? '📱' : filter === 'yes' ? '❤️' : '❌'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No swipes yet' : filter === 'yes' ? 'No liked activities' : 'No passed activities'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Start swiping on activities to see your history here'
                : filter === 'yes'
                ? 'Activities you like will appear here'
                : 'Activities you pass on will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors ${
                    item.action === 'yes'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="text-3xl">{item.activity.image}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.activity.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.action === 'yes'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {item.action === 'yes' ? (
                            <Heart className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </div>
                        <button
                          onClick={() => deleteSwipeHistory(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.activity.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.activity.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.activity.location}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {item.activity.points} pts
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {item.activity.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Swiped {new Date(item.swiped_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}