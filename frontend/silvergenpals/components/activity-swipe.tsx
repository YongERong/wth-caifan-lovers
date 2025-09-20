"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin, Clock, Users, Star, X, Heart, RotateCcw } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  difficulty: string;
  points: number;
  image: string;
}

interface ActivitySwipeProps {
  activities: Activity[];
  userId: string;
  onSwipeHistoryUpdate?: () => void;
}

export default function ActivitySwipe({ activities, userId, onSwipeHistoryUpdate }: ActivitySwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const currentActivity = activities[currentIndex];

  const handleSwipe = async (action: 'yes' | 'no') => {
    if (isAnimating || !currentActivity) return;

    setIsAnimating(true);

    try {
      // Map the mock integer IDs to the actual UUIDs we inserted into the database
      const activityUUIDMap: { [key: number]: string } = {
        1: '00000000-0000-0000-0000-000000000001',
        2: '00000000-0000-0000-0000-000000000002',
        3: '00000000-0000-0000-0000-000000000003',
        4: '00000000-0000-0000-0000-000000000004',
        5: '00000000-0000-0000-0000-000000000005',
        6: '00000000-0000-0000-0000-000000000006'
      };

      const activityUUID = activityUUIDMap[currentActivity.id];

      if (!activityUUID) {
        throw new Error(`No UUID mapping found for activity ID: ${currentActivity.id}`);
      }

      console.log('Recording swipe:', {
        swiper_id: userId,
        activity_id: activityUUID,
        action: action,
        activity_title: currentActivity.title
      });

      const { data, error } = await supabase
        .from('swipe_history')
        .insert([{
          swiper_id: userId,
          activity_id: activityUUID,
          action: action
        }])
        .select();

      if (error) {
        console.error('Error recording swipe:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Still continue with the animation even if DB fails
        alert(`Failed to record swipe: ${error.message}`);
      } else {
        console.log(`Successfully swiped ${action} on activity:`, currentActivity.title);
        console.log('Swipe record created:', data);
        onSwipeHistoryUpdate?.();
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
      alert(`Failed to record swipe: ${error}`);
    }

    // Animate card out
    if (cardRef.current) {
      const direction = action === 'yes' ? 1 : -1;
      cardRef.current.style.transform = `translateX(${direction * 100}%) rotate(${direction * 15}deg)`;
      cardRef.current.style.opacity = '0';
    }

    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setIsAnimating(false);

      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '1';
      }
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;

    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const action = dragOffset.x > 0 ? 'yes' : 'no';
      handleSwipe(action);
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;

    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const action = dragOffset.x > 0 ? 'yes' : 'no';
      handleSwipe(action);
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const resetStack = () => {
    setCurrentIndex(0);
    setDragOffset({ x: 0, y: 0 });
    setIsAnimating(false);
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '1';
    }
  };

  if (currentIndex >= activities.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-lg">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600 mb-6 text-center">You've swiped through all available activities.</p>
        <button
          onClick={resetStack}
          className="flex items-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Start Over
        </button>
      </div>
    );
  }

  if (!currentActivity) return null;

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) * 0.002;

  return (
    <div className="relative h-96 w-full max-w-sm mx-auto">
      {/* Next card (background) */}
      {activities[currentIndex + 1] && (
        <div className="absolute inset-0 bg-white rounded-xl shadow-lg transform scale-95 opacity-50">
          <div className="p-6">
            <div className="text-4xl mb-4">{activities[currentIndex + 1].image}</div>
            <h3 className="font-semibold text-gray-900">{activities[currentIndex + 1].title}</h3>
          </div>
        </div>
      )}

      {/* Current card */}
      <div
        ref={cardRef}
        className="absolute inset-0 bg-white rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicators */}
        <div
          className="absolute top-8 left-8 px-4 py-2 bg-red-500 text-white rounded-lg font-bold transform -rotate-12 transition-opacity"
          style={{ opacity: dragOffset.x < -50 ? Math.min(1, Math.abs(dragOffset.x) / 100) : 0 }}
        >
          PASS
        </div>
        <div
          className="absolute top-8 right-8 px-4 py-2 bg-green-500 text-white rounded-lg font-bold transform rotate-12 transition-opacity"
          style={{ opacity: dragOffset.x > 50 ? Math.min(1, dragOffset.x / 100) : 0 }}
        >
          LIKE
        </div>

        <div className="p-6 h-full flex flex-col">
          <div className="text-6xl mb-4 text-center">{currentActivity.image}</div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{currentActivity.title}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-1">{currentActivity.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(currentActivity.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {currentActivity.time}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {currentActivity.location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {currentActivity.participants}/{currentActivity.maxParticipants} joined
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {currentActivity.category}
            </span>
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium ml-1">{currentActivity.points} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
        {currentIndex + 1} / {activities.length}
      </div>
    </div>
  );
}