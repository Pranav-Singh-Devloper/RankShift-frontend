// src/app/profile/[userId]/page.tsx
import { Contest, UserProfile } from '@/lib/types';
import { getTierColor } from '@/lib/utils';
import { Trophy, TrendingUp, Award, Activity } from 'lucide-react';
import { notFound } from 'next/navigation';
import InteractiveHistory from '@/components/InteractiveHistory';
import AddContestForm from '@/components/AddContestForm';
import CreateContestForm from '@/components/CreateContestForm';

// FORCE VERCEL TO TREAT THIS AS DYNAMIC (No Caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// HARDCODE FOR FINAL VERIFICATION
const API_URL = 'https://rankshift-contest-rating-engine-1.onrender.com';

async function getProfileData(userId: string): Promise<UserProfile | null> {
  const fetchUrl = `${API_URL}/api/users/${userId}`;
  
  try {
    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("DASHBOARD_FETCH_ERROR:", error);
    return null;
  }
}

async function getAllContests(): Promise<Contest[]> {
  try {
    const res = await fetch(`${API_URL}/api/contests`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: Props) {
  // Directly log to Vercel terminal
  console.log("--- ENGINE HEARTBEAT: ATTEMPTING RENDER ---");
  
  const resolvedParams = await params;
  const uid = resolvedParams.userId;

  const [user, availableContests] = await Promise.all([
    getProfileData(uid),
    getAllContests()
  ]);

  if (!user) {
    console.error("--- ENGINE ALERT: USER OBJECT NULL ---");
    notFound();
  }

  const tierColorClass = getTierColor(user.tier);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className={`w-5 h-5 ${tierColorClass}`} />
                <span className={`font-bold text-lg uppercase tracking-wider ${tierColorClass}`}>{user.tier}</span>
                <span className="text-slate-400 text-sm ml-2 font-medium">• {user.contests_played} Contests</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-xl min-w-[140px]">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Current</p>
                <p className="text-3xl font-black text-blue-950">{user.current_rating}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 px-5 py-3 rounded-xl min-w-[140px]">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Award className="w-3 h-3" /> Peak</p>
                <p className="text-3xl font-black text-amber-950">{user.max_rating}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-slate-500" /> Rating Progression</h2>
           <InteractiveHistory data={user.ratingHistory} />
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6">
          <CreateContestForm />
          <AddContestForm userId={user.id} availableContests={availableContests} />
        </div>
      </div>
    </main>
  );
}