import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white">
          {user.name}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.email}
        </span>
      </div>
      
      {/* Admin Badge - Web sitesinden kayıt olanlar için */}
      {user.role === 'admin' && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#C48913] to-[#D4AF37] text-black">
          <svg 
            className="w-3 h-3 mr-1" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M9.224 1.553a.5.5 0 01.448 0L15.5 4.553a.5.5 0 01.28.447v5a7.5 7.5 0 01-7.5 7.5A7.5 7.5 0 01.72 10V5a.5.5 0 01.28-.447l5.828-3a.5.5 0 01.416 0z"
            />
          </svg>
          Admin
        </span>
      )}
    </div>
  );
};

export default UserProfile;
