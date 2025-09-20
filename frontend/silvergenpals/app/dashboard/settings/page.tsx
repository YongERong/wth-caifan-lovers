"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { User, Bell, Shield, Accessibility, Globe, Heart, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    bio: "",
    gender: "",
    date_of_birth: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    country: "Singapore",
    mobility_level: "",
    interests: [] as string[],
    activity_preferences: [] as string[],
    language_preferences: [] as string[]
  });

  const supabase = createClient();

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  const checkUserAndProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login");
        return;
      }

      setUser(authUser);

      // Fetch profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id);

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profileData && profileData.length > 0) {
        const userProfile = profileData[0];
        setProfile(userProfile);

        // Pre-populate form with existing profile data
        setFormData({
          first_name: userProfile.first_name || "",
          last_name: userProfile.last_name || "",
          phone_number: userProfile.phone_number || "",
          bio: userProfile.bio || "",
          gender: userProfile.gender || "",
          date_of_birth: userProfile.date_of_birth || "",
          address_line1: userProfile.address_line1 || "",
          address_line2: userProfile.address_line2 || "",
          postal_code: userProfile.postal_code || "",
          city: userProfile.city || "",
          country: userProfile.country || "Singapore",
          mobility_level: userProfile.mobility_level || "",
          interests: userProfile.interests || [],
          activity_preferences: userProfile.activity_preferences || [],
          language_preferences: userProfile.language_preferences || []
        });
      }
    } catch (error) {
      console.error('Error checking user and profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to save profile. Please try again.');
      } else {
        alert('Profile saved successfully!');
        // Refresh profile data
        checkUserAndProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and privacy settings</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-100 text-gray-500"
                  value={user.email || ''}
                  disabled
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
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={4}
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Additional Profile Fields */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your address"
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
                  placeholder="Enter your city"
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
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            {/* Mobility Level */}
            <div className="mt-6">
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
            <div className="mt-6">
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
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          interests: prev.interests.filter((_, i) => i !== index)
                        }));
                      }}
                      className="ml-2 text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Current interests: {formData.interests.length > 0 ? formData.interests.join(', ') : 'None'}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !profile}
                className="flex items-center px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {!profile && (
                <p className="mt-2 text-sm text-gray-500">
                  Please complete your profile creation first before accessing settings.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Activity Reminders</h3>
                <p className="text-sm text-gray-600">Get notified about upcoming activities you&apos;ve joined</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Buddy Requests</h3>
                <p className="text-sm text-gray-600">Get notified when someone wants to be your buddy</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">New Activities</h3>
                <p className="text-sm text-gray-600">Get notified about new activities that match your interests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Weekly Summary</h3>
                <p className="text-sm text-gray-600">Receive a weekly summary of your activities and connections</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Accessibility className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Accessibility</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Size</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">High Contrast Mode</h3>
                <p className="text-sm text-gray-600">Improve text readability with higher contrast</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Voice Navigation</h3>
                <p className="text-sm text-gray-600">Enable voice commands for easier navigation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Screen Reader Support</h3>
                <p className="text-sm text-gray-600">Optimize for screen reader compatibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="public">Public - Everyone can see my profile</option>
                <option value="buddies" selected>Buddies Only - Only my buddies can see my profile</option>
                <option value="private">Private - Only I can see my profile</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Show Online Status</h3>
                <p className="text-sm text-gray-600">Let others see when you&apos;re online</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Activity Sharing</h3>
                <p className="text-sm text-gray-600">Share your activity participation with buddies</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div>
              <button className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-900">Language & Region</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="en" selected>English</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ms">Bahasa Melayu</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="SGT" selected>Singapore Standard Time (SGT)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Help Center</h3>
                <p className="text-sm text-gray-600">Find answers to common questions</p>
              </button>
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our support team</p>
              </button>
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Send Feedback</h3>
                <p className="text-sm text-gray-600">Help us improve SilverGenPals</p>
              </button>
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Privacy Policy</h3>
                <p className="text-sm text-gray-600">Read our privacy policy</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
