"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ActivitySwipe from "@/components/activity-swipe";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin, Clock, Users, Star, Plus, Search, Filter, Heart, List, Shuffle, History, X } from "lucide-react";

interface ActivitiesClientProps {
  userId: string;
}

type ViewMode = 'list' | 'swipe';

export default function ActivitiesClient({ userId }: ActivitiesClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isJoining, setIsJoining] = useState<number | null>(null);
  const [isDeregistering, setIsDeregistering] = useState<number | null>(null);
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [buddyName, setBuddyName] = useState('');
  const supabase = createClient();

  // Mock data for demo purposes - in a real app, this would come from the database
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
      isRegistered: true,
      buddyName: null as string | null
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
      isRegistered: false,
      buddyName: null as string | null
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
      isRegistered: false,
      buddyName: null as string | null
    },
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
      image: "👨‍🍳",
      buddyName: null as string | null
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
      image: "📸",
      buddyName: null as string | null
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
      image: "🎵",
      buddyName: null as string | null
    }
  ];

  const [activities, setActivities] = useState(featuredActivities);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true);
  const upcomingActivities = activities.slice(3); // Show last 3 as upcoming

  const categories = [
    { name: "All", count: 24, active: true },
    { name: "Exercise", count: 8, active: false },
    { name: "Arts & Crafts", count: 6, active: false },
    { name: "Social", count: 5, active: false },
    { name: "Cooking", count: 3, active: false },
    { name: "Wellness", count: 2, active: false }
  ];

  // Map mock activity IDs to actual UUIDs (matching the pattern from activity-swipe.tsx)
  const activityUUIDMap: { [key: number]: string } = {
    1: '00000000-0000-0000-0000-000000000001',
    2: '00000000-0000-0000-0000-000000000002',
    3: '00000000-0000-0000-0000-000000000003',
    4: '00000000-0000-0000-0000-000000000004',
    5: '00000000-0000-0000-0000-000000000005',
    6: '00000000-0000-0000-0000-000000000006'
  };

  // Fetch user's actual registrations on component mount
  useEffect(() => {
    fetchUserRegistrations();
  }, [userId]);

  const fetchUserRegistrations = async () => {
    try {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select('activity_id, buddy')
        .eq('profile_id', userId)
        .eq('status', 'registered');

      if (error) {
        setIsLoadingRegistrations(false);
        return;
      }

      // Create a map of registered activity UUIDs to their buddy information
      const registrationMap = new Map();
      registrations?.forEach(reg => {
        // Extract buddy name from the database
        let buddyName = null;
        if (reg.buddy && typeof reg.buddy === 'string' && reg.buddy.trim() !== '') {
          buddyName = reg.buddy.trim();
        }
        
        registrationMap.set(reg.activity_id, {
          isRegistered: true,
          buddyName: buddyName
        });
      });

      // Update activities to reflect actual registration status and buddy info
      setActivities(prevActivities => 
        prevActivities.map(activity => {
          const activityUUID = activityUUIDMap[activity.id];
          const registrationInfo = registrationMap.get(activityUUID);
          
          
          return {
            ...activity,
            isRegistered: registrationInfo?.isRegistered || false,
            buddyName: registrationInfo?.buddyName || null
          };
        })
      );

      setIsLoadingRegistrations(false);
    } catch (error) {
      setIsLoadingRegistrations(false);
    }
  };

  const showBuddyNameModal = (activityId: number) => {
    setSelectedActivityId(activityId);
    setBuddyName('');
    setShowBuddyModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (selectedActivityId === null) return;
    
    const processedBuddyName = buddyName.trim() || null;
    setShowBuddyModal(false);
    await handleJoinActivity(selectedActivityId, processedBuddyName);
  };

  const handleCancelRegistration = () => {
    setShowBuddyModal(false);
    setSelectedActivityId(null);
    setBuddyName('');
  };

  const handleJoinActivity = async (activityId: number, buddyNameParam: string | null = null) => {
    setIsJoining(activityId);
    
    try {
      const activityUUID = activityUUIDMap[activityId];
      
      if (!activityUUID) {
        throw new Error(`No UUID mapping found for activity ID: ${activityId}`);
      }

      // First, check if the user profile exists
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId);

      if (profileError) {
        throw new Error('Failed to verify user profile. Please refresh the page and try again.');
      }

      if (!profileCheck || profileCheck.length === 0) {
        throw new Error('User profile not found. Please refresh the page and try again.');
      }

      // Check if the activity exists in the database
      const { data: activityCheck, error: activityError } = await supabase
        .from('activities')
        .select('id')
        .eq('id', activityUUID);

      if (activityError) {
        // If activities table doesn't exist, we'll continue and let the foreign key constraint catch it
      } else if (!activityCheck || activityCheck.length === 0) {
        throw new Error('This activity is not available in the database. Please contact support.');
      }

      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('profile_id', userId)
        .eq('activity_id', activityUUID);

      if (checkError) {
        throw checkError;
      }

      if (existingRegistration && existingRegistration.length > 0) {
        // If we find an existing registration, update the local state to reflect this
        setActivities(prevActivities => 
          prevActivities.map(activity => 
            activity.id === activityId 
              ? { ...activity, isRegistered: true, buddyName: null }
              : activity
          )
        );
        throw new Error('You are already registered for this activity.');
      }

      // Insert the registration with buddy name if provided
      const registrationData: any = {
        profile_id: userId,
        activity_id: activityUUID,
        status: 'registered'
      };

      // Add buddy name if provided - store in the new 'buddy' column
      if (buddyNameParam && buddyNameParam.trim() !== '') {
        registrationData.buddy = buddyNameParam.trim();
      }

      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select();

      if (error) {
        console.error('Registration insert error:', error);
        throw error;
      }


      // Update the local state to reflect the registration
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { 
                ...activity, 
                isRegistered: true,
                participants: activity.participants + 1,
                buddyName: (buddyNameParam && buddyNameParam.trim() !== '') ? buddyNameParam.trim() : null
              }
            : activity
        )
      );

      // Refresh registrations to ensure consistency with database
      setTimeout(() => {
        fetchUserRegistrations();
      }, 500);

    } catch (error) {
      // More specific error messages
      let errorMessage = 'Failed to join activity. Please try again.';
      if (error instanceof Error) {
        // Use the error message if it's one of our custom messages
        if (error.message.includes('already registered')) {
          // For "already registered" error, the UI should now show the correct state
          errorMessage = 'This activity is now showing as registered in your list.';
        } else if (error.message.includes('profile not found') ||
            error.message.includes('verify user profile') ||
            error.message.includes('not available in the database')) {
          errorMessage = error.message;
        } else if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          errorMessage = 'You are already registered for this activity.';
        } else if (error.message.includes('foreign key') || error.message.includes('violates')) {
          errorMessage = 'Activity not found. Please refresh the page and try again.';
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          errorMessage = 'Permission denied. Please log in again and try again.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsJoining(null);
    }
  };

  const handleDeregister = async (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    const confirmed = window.confirm(
      `Are you sure you want to deregister from "${activity?.title}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }

    setIsDeregistering(activityId);
    
    try {
      const activityUUID = activityUUIDMap[activityId];
      
      if (!activityUUID) {
        throw new Error(`No UUID mapping found for activity ID: ${activityId}`);
      }

      // Delete the registration from the database
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('profile_id', userId)
        .eq('activity_id', activityUUID);

      if (error) {
        throw error;
      }

      // Update the local state to reflect the deregistration
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { 
                ...activity, 
                isRegistered: false,
                participants: Math.max(0, activity.participants - 1),
                buddyName: null as string | null
              }
            : activity
        )
      );

      // Optionally refresh registrations to ensure consistency
      // fetchUserRegistrations();

    } catch (error) {
      // More specific error messages
      let errorMessage = 'Failed to deregister from activity. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('No rows')) {
          errorMessage = 'Registration not found. You may have already been deregistered.';
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          errorMessage = 'Permission denied. Please log in again and try again.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsDeregistering(null);
    }
  };

  const handleSwipeHistoryUpdate = () => {
    // This could trigger a refresh of statistics or other UI updates
  };

  if (viewMode === 'swipe') {
    return (
      <div className="space-y-8">
        {/* Header with toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Activities</h1>
            <p className="text-gray-600 mt-1">Swipe right to like, left to pass</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/activities/history"
              className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Link>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === ('list' as ViewMode)
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              >
                <List className="mr-2 h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                  viewMode === ('swipe' as ViewMode)
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Swipe
              </button>
            </div>
          </div>
        </div>

        {/* Swipe Interface */}
        <div className="flex flex-col items-center space-y-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Find Your Perfect Activity</h2>
              <p className="text-gray-600">Swipe through activities to discover what interests you</p>
            </div>

            <ActivitySwipe
              activities={activities}
              userId={userId}
              onSwipeHistoryUpdate={handleSwipeHistoryUpdate}
            />
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 max-w-md">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">How to Swipe</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span>Swipe right to like activities</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="h-4 w-4 text-white" />
                </div>
                <span>Swipe left to pass on activities</span>
              </div>
              <div className="text-center text-xs text-gray-500 mt-4 italic">
                Drag the cards or use touch gestures
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">Discover and join engaging activities at your care center</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/activities/history"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Link>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === ('list' as ViewMode)
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('swipe')}
              className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === ('swipe' as ViewMode)
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Swipe
            </button>
          </div>

        </div>
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

      {/* My Registered Activities */}
      {isLoadingRegistrations ? (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Registered Activities</h2>
            <p className="text-gray-600 text-sm mt-1">Loading your registered activities...</p>
          </div>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activities.filter(activity => activity.isRegistered).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Registered Activities</h2>
            <p className="text-gray-600 text-sm mt-1">Activities you've signed up for</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activities.filter(activity => activity.isRegistered).map((activity) => (
                <div key={activity.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-green-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl mb-2">{activity.image}</div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Registered
                      </span>
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
                    <div className="flex items-center text-sm text-gray-600">
                      <Heart className="h-4 w-4 mr-2" />
                      Buddy: {activity.buddyName || 'N/A'}
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
                    <button 
                      onClick={() => handleDeregister(activity.id)}
                      disabled={isDeregistering === activity.id}
                      className="flex-1 py-2 bg-red-100 hover:bg-red-200 disabled:bg-red-50 disabled:cursor-not-allowed text-red-700 rounded-lg font-medium transition-colors"
                    >
                      {isDeregistering === activity.id ? 'Deregistering...' : 'Deregister'}
                    </button>
                    <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                      <Heart className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Activities */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Featured This Week</h2>
          <p className="text-gray-600 text-sm mt-1">Popular activities you might enjoy</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activities.slice(0, 3).map((activity) => (
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
                    <button 
                      onClick={() => showBuddyNameModal(activity.id)}
                      disabled={isJoining === activity.id}
                      className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {isJoining === activity.id ? 'Joining...' : 'Join Activity'}
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
                  {activity.isRegistered ? (
                    <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                      Registered
                    </button>
                  ) : (
                    <button 
                      onClick={() => showBuddyNameModal(activity.id)}
                      disabled={isJoining === activity.id}
                      className="px-6 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {isJoining === activity.id ? 'Joining...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buddy Name Modal */}
      {showBuddyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Register for Activity
            </h3>
            <p className="text-gray-600 mb-4">
              Would you like to register with a buddy? (Optional)
            </p>
            
            <div className="mb-6">
              <label htmlFor="buddyName" className="block text-sm font-medium text-gray-700 mb-2">
                Buddy's Name
              </label>
              <input
                type="text"
                id="buddyName"
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                placeholder="Enter your buddy's name (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelRegistration}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegistration}
                disabled={isJoining !== null}
                className="flex-1 py-2 px-4 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-lg font-medium transition-colors"
              >
                {isJoining !== null ? 'Registering...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}