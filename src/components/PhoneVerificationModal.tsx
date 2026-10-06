import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

// 在您的驗證組件內部
const { profile, refreshProfile } = useAuth();
const [code, setCode] = useState('');

const handleVerifyPhone = async () => {
  if (code !== '8888') {
    alert('驗證碼錯誤！');
    return;
  }

  try {
    if (!profile?.id) throw new Error('找不到用戶身分');

    // 1. 更新資料庫中的驗證狀態
    const { error } = await supabase
      .from('users')
      .update({ is_phone_verified: true })
      .eq('id', profile.id); // 🌟 核心：確保是綁定 profile.id

    if (error) throw error;

    // 2. 🔥 關鍵：立刻叫 Context 去重新撈取資料，讓全站瞬間知道手機驗證成功了！
    await refreshProfile();
    
    alert('手機號碼驗證成功！沙漏權限已解鎖。');
  } catch (err: any) {
    alert(`驗證失敗: ${err.message}`);
  }
};
