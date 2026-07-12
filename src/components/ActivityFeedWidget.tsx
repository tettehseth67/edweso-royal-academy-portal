import React, { useState, useEffect } from 'react';
import { 
  Activity, LogIn, Award, CheckSquare, RefreshCw, ChevronRight, ChevronLeft, ShieldAlert
} from 'lucide-react';
import { SchoolDatabase } from '../mockData';

interface ActivityFeedWidgetProps {
  isDarkMode: boolean;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'grade' | 'attendance';
  user: string;
  details: string;
  timestamp: string;
}

export default function ActivityFeedWidget({ isDarkMode }: ActivityFeedWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial activities
  const fetchActivities = () => {
    setIsRefreshing(true);
    const data = SchoolDatabase.getSystemActivities();
    setActivities(data);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  useEffect(() => {
    fetchActivities();

    // Set up a real-time simulation interval (simulate other users' activities every 18 seconds)
    const interval = setInterval(() => {
      const users = [
        'Mr. Yaw Asante', 'Miss Abena Osei', 'Mrs. Ama Serwaa Addo', 
        'Dr. Joseph Darko', 'Admin (Principal Appiah)', 'Mr. Kofi Mensah',
        'Student (Emmanuel Tetteh)', 'Student (Kofi Mensah Jnr)'
      ];
      
      const eventTypes = ['login', 'grade', 'attendance'] as const;
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let details = '';
      if (randomType === 'login') {
        details = 'Logged into the school portal from ' + (Math.random() > 0.5 ? 'Mobile App' : 'Web Terminal');
      } else if (randomType === 'grade') {
        const subjects = ['Mathematics', 'Integrated Science', 'English Language', 'Social Studies', 'ICT', 'RME'];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        details = `Updated term assessment scores for JHS ${Math.floor(Math.random() * 3) + 1} ${randomSubject}`;
      } else {
        const classes = ['Primary 4', 'Primary 5', 'JHS 1', 'JHS 2', 'JHS 3'];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        details = `Submitted morning roll-call attendance for ${randomClass}`;
      }

      // Add to database so it persists
      SchoolDatabase.addSystemActivity(randomType, randomUser, details);
      
      // Update local state with fresh data
      setActivities(SchoolDatabase.getSystemActivities());
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // Quick manually triggered simulations for live testing
  const triggerManualSimulation = (type: 'login' | 'grade' | 'attendance') => {
    const activeUser = 'You (Simulated Action)';
    let details = '';
    if (type === 'login') {
      details = 'Initiated secure session authentication from current terminal';
    } else if (type === 'grade') {
      details = 'Simulated grade uploading ledger update';
    } else {
      details = 'Simulated complete class roll-call submission';
    }

    SchoolDatabase.addSystemActivity(type, activeUser, details);
    setActivities(SchoolDatabase.getSystemActivities());
  };

  if (!isExpanded) {
    return (
      <div className="hidden lg:flex flex-col items-center py-6 w-12 shrink-0 border-l border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 transition-all">
        <button 
          onClick={() => setIsExpanded(true)}
          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          title="Expand Activity Feed"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 flex items-center [writing-mode:vertical-lr] text-slate-400 dark:text-slate-500 font-extrabold uppercase text-[10px] tracking-widest gap-2 py-4">
          <Activity size={12} className="animate-pulse" />
          <span>System Activity Feed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hidden lg:flex flex-col w-80 shrink-0 border-l transition-all animate-fade-in ${
      isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200/60'
    }`}>
      {/* Header Panel */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-white">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity size={15} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider font-sans leading-none">System Activity</h4>
            <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Real-time terminal event logs</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <button
            onClick={fetchActivities}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Logs"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Activity List Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-1">
            <ShieldAlert size={20} className="mx-auto text-slate-300" />
            <p className="text-[10px] font-bold">No active system logs</p>
          </div>
        ) : (
          activities.map((act) => {
            // Pick badge background and text colors based on activity type
            let badgeBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
            let icon = <LogIn size={11} />;

            if (act.type === 'grade') {
              badgeBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
              icon = <Award size={11} />;
            } else if (act.type === 'attendance') {
              badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
              icon = <CheckSquare size={11} />;
            }

            return (
              <div 
                key={act.id} 
                className={`p-3 rounded-xl border flex gap-3 text-xs leading-relaxed transition-all hover:bg-slate-50 dark:hover:bg-slate-950/20 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                {/* Visual Icon */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${badgeBg}`}>
                  {icon}
                </div>

                {/* Event Description */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                      {act.user}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono shrink-0 whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {act.details}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Real-time Simulator Panel */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-100'
      }`}>
        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-2.5">
          System Action Simulator
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => triggerManualSimulation('login')}
            className="px-2 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-[9px] uppercase rounded hover:bg-amber-500/20 transition-colors text-center cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => triggerManualSimulation('grade')}
            className="px-2 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-extrabold text-[9px] uppercase rounded hover:bg-blue-500/20 transition-colors text-center cursor-pointer"
          >
            Grades
          </button>
          <button
            onClick={() => triggerManualSimulation('attendance')}
            className="px-2 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-[9px] uppercase rounded hover:bg-emerald-500/20 transition-colors text-center cursor-pointer"
          >
            Roll Call
          </button>
        </div>
      </div>
    </div>
  );
}
