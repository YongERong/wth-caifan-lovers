"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Save, X, Mic } from "lucide-react";
import VoiceInput from "@/components/voice-input";

interface ProfileCreationProps {
  user: any;
  onProfileCreated: () => void;
}

export default function ProfileCreation({ user, onProfileCreated }: ProfileCreationProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    phone_number: "",
    date_of_birth: "",
    age: "",
    gender: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    country: "Singapore",
    bio: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    interests: [] as string[],
    mobility_level: "",
    activity_preferences: [] as string[],
    language_preferences: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [currentInterest, setCurrentInterest] = useState("");
  const [currentActivityPref, setCurrentActivityPref] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");

  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addToArray = (field: string, value: string, setValue: (value: string) => void) => {
    if (value.trim() && !formData[field as keyof typeof formData].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof formData] as string[], value.trim()]
      }));
      setValue("");
    }
  };

  const handleVoiceTranscription = (text: string, fieldMappings: Record<string, string>) => {
    console.log('Voice transcription:', text);
    console.log('Field mappings:', fieldMappings);

    // Update form data with extracted fields
    setFormData(prev => {
      const updated = { ...prev };

      Object.entries(fieldMappings).forEach(([field, value]) => {
        if (field === 'interests' || field === 'activity_preferences' || field === 'language_preferences') {
          try {
            const parsedArray = JSON.parse(value);
            updated[field as keyof typeof updated] = parsedArray as never;
          } catch (e) {
            console.error('Error parsing array field:', field, value);
          }
        } else {
          updated[field as keyof typeof updated] = value as never;
        }
      });

      return updated;
    });

    // Show a success message
    alert(`Voice input processed! Found: ${Object.keys(fieldMappings).join(', ')}`);
  };

  const removeFromArray = (field: string, valueToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof formData] as string[]).filter(item => item !== valueToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        id: user.id, // Use the auth user's ID as the profile ID
        ...formData,
        interests: formData.interests,
        activity_preferences: formData.activity_preferences,
        language_preferences: formData.language_preferences,
        user_type: 'regular'
      };

      console.log('Attempting to create profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select(); // Return the created record

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);

      // Verify we can read the profile immediately after creation
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      console.log('Profile verification:', { verifyData, verifyError });

      // Call the callback to refresh the parent component
      onProfileCreated();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                  <p className="text-pink-100 mt-1">Help us personalize your experience and connect you with the right activities and buddies</p>
                </div>
              </div>

              {/* Voice Input */}
              <div className="flex flex-col items-center space-y-2">
                <VoiceInput
                  onTranscription={handleVoiceTranscription}
                  disabled={loading}
                  className="text-white"
                />
                <div className="text-center">
                  <p className="text-white text-sm font-medium">Voice Fill</p>
                  <p className="text-pink-100 text-xs">Speak to auto-fill</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Voice Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mic className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Voice Input Instructions</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Use the voice button above to automatically fill your profile. Try saying something like:
                  </p>
                  <p className="text-xs text-blue-600 mt-2 italic">
                    "My name is John Smith, I am 65 years old, I live at 123 Main Street, I enjoy reading and gardening,
                    my emergency contact is Mary Smith, I speak English and Mandarin"
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Bio */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About You</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself, your hobbies, and what you're looking for in activities and friendships..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </section>

            {/* Emergency Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Preferences</h2>

              {/* Mobility Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobility Level</label>
                <select
                  name="mobility_level"
                  value={formData.mobility_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select mobility level</option>
                  <option value="high">High - Can participate in physically demanding activities</option>
                  <option value="moderate">Moderate - Can walk and participate in light activities</option>
                  <option value="low">Low - Limited mobility but can participate in seated activities</option>
                  <option value="wheelchair">Wheelchair user</option>
                </select>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeFromArray('interests', interest)}
                        className="ml-2 text-pink-600 hover:text-pink-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    placeholder="Add an interest (e.g., reading, walking, cooking)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('interests', currentInterest, setCurrentInterest);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('interests', currentInterest, setCurrentInterest)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Activity Preferences */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Preferences</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.activity_preferences.map((pref, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {pref}
                      <button
                        type="button"
                        onClick={() => removeFromArray('activity_preferences', pref)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentActivityPref}
                    onChange={(e) => setCurrentActivityPref(e.target.value)}
                    placeholder="Add activity preference (e.g., indoor, outdoor, social, quiet)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('activity_preferences', currentActivityPref, setCurrentActivityPref);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('activity_preferences', currentActivityPref, setCurrentActivityPref)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Language Preferences */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language Preferences</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.language_preferences.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeFromArray('language_preferences', lang)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    placeholder="Add language (e.g., English, Mandarin, Malay, Tamil)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('language_preferences', currentLanguage, setCurrentLanguage);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('language_preferences', currentLanguage, setCurrentLanguage)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Creating Profile...' : 'Complete Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}