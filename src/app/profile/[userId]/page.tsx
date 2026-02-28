// src/app/profile/[userId]/page.tsx
import { Contest, UserProfile } from '@/lib/types';
import { getTierColor } from '@/lib/utils';
import { Trophy, TrendingUp, Award, Activity } from 'lucide-react';
import { notFound } from 'next/navigation';
import InteractiveHistory from '@/components/InteractiveHistory';
import AddContestForm from '@/components/AddContestForm';
import CreateContestForm from '@/components/CreateContestForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 1. GLOBAL SCOPE: Fetch functions must be outside the component
async function getProfileData(userId: string): Promise<UserProfile | null> {
  // LOG 1: Check what URL Vercel is actually using
  console.log(`FETCHING FROM: ${API_URL}/api/users/${userId}`); 

  try {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      // LOG 2: See if the backend is rejecting the request
      console.error(`BACKEND ERROR: Status ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    // LOG 3: See if there is a network/DNS connection error
    console.error("NETWORK ERROR:", error);
    return null;
  }
}

async function getAllContests(): Promise<Contest[]> {
  try {
    const res = await fetch(`${API_URL}/api/contests`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch contests:", error);
    return [];
  }
}

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const resolvedParams = await params;
  
  // 2. PARALLEL FETCH: Get both datasets
  const [user, availableContests] = await Promise.all([
    getProfileData(resolvedParams.userId),
    getAllContests()
  ]);

  // 3. VALIDATION: Only trigger 404 if the USER fetch specifically fails
  if (!user) {
    notFound();
  }

  const tierColorClass = getTierColor(user.tier);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className={`w-5 h-5 ${tierColorClass}`} />
                <span className={`font-bold text-lg uppercase tracking-wider ${tierColorClass}`}>
                  {user.tier}
                </span>
                <span className="text-slate-400 text-sm ml-2 font-medium">
                  • {user.contests_played} Contests
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-xl min-w-[140px]">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Current
                </p>
                <p className="text-3xl font-black text-blue-950 flex items-center gap-2">
                  {user.current_rating}
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 px-5 py-3 rounded-xl min-w-[140px]">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Peak
                </p>
                <p className="text-3xl font-black text-amber-950 flex items-center gap-2">
                  {user.max_rating}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Growth Chart Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              Rating Progression
            </h2>
          </div>
          <InteractiveHistory data={user.ratingHistory} />
        </div>

        {/* Action Panels */}
        <div className="grid grid-cols-1 gap-6 mt-6">
          <CreateContestForm />
          <AddContestForm userId={user.id} availableContests={availableContests} />
        </div>
      </div>
    </main>
  );
}