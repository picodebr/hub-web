import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Moon, Settings } from 'lucide-react';
import { IHubUser } from '@/_base/interfaces/user';
import { updateProfile } from '@/_base/services/user';
import { useAsyncCallback, useAuth } from '@/_base/hooks';

interface AccountSettingsProps {
  user: IHubUser;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, isDark, onToggleTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<IHubUser>(user);
  const { setUser } = useAuth();

  const handleUpdateProfile = useAsyncCallback(async () => {
    const updatedProfile = await updateProfile({
      name: profile.name,
      username: profile.username,
      bio: profile.bio || undefined,
    });
    setProfile((e) => ({ ...e, ...updatedProfile }));
    setUser(updatedProfile);
    setIsEditing(false);
  }, [profile], true);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-sm transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Settings className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Configurações da Conta
        </h2>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nome
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            disabled={!isEditing}
            className={`w-full px-4 py-2 rounded-lg transition-all ${
              isEditing
                ? `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`
                : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} cursor-not-allowed`
            }`}
          />
        </div>

        {/* Username */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nome de Usuário
          </label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            disabled={!isEditing}
            className={`w-full px-4 py-2 rounded-lg transition-all ${
              isEditing
                ? `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`
                : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} cursor-not-allowed`
            }`}
          />
        </div>

        {/* Bio */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Biografia
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!isEditing}
            rows={3}
            className={`w-full px-4 py-2 rounded-lg transition-all resize-none ${
              isEditing
                ? `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`
                : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} cursor-not-allowed`
            }`}
          />
        </div>

        {/* Divider */}
        <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'} my-4`} />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Modo Escuro
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={() => handleUpdateProfile()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => {
                  setProfile(user);
                  setIsEditing(false);
                }}
                className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold py-2 px-4 rounded-lg transition-colors`}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Editar Dados
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AccountSettings;
