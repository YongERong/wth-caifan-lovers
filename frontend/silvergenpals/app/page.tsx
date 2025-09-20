import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Users, Calendar, Award, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="w-full bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">SilverGenPals</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              {hasEnvVars && <AuthButton />}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect, Engage, <span className="text-pink-500">Thrive</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our vibrant community where seniors discover exciting activities, 
            meet like-minded friends, and create meaningful connections at aging care centers.
          </p>
          
          {hasEnvVars ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-500 bg-white border-2 border-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">Please set up your environment variables to get started.</p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Find Friends</h3>
            <p className="text-gray-600">
              Connect with fellow seniors who share your interests and hobbies. 
              Build lasting friendships through our buddy matching system.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Join Activities</h3>
            <p className="text-gray-600">
              Discover engaging activities at aging care centers. From exercise classes 
              to cultural events, there&apos;s something for everyone.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Earn Rewards</h3>
            <p className="text-gray-600">
              Participate in activities and earn points that can be redeemed for 
              exciting rewards and special privileges.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl p-8 mt-16 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Join thousands of seniors who have found friendship, purpose, and joy through SilverGenPals.
          </p>
          {hasEnvVars && (
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-colors"
            >
              Join SilverGenPals Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-semibold">SilverGenPals</span>
          </div>
          <p className="text-gray-400">
            Connecting seniors, enriching lives. Powered by community and care.
          </p>
        </div>
      </footer>
    </div>
  );
}