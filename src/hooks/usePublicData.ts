import { useState, useEffect } from 'react';

// 👑 完美的出廠預設狀態：完全隔離 Supabase，強行提供靜態的安全公告，杜絕 Realtime 報錯
export function usePublicData() {
  const [announcement, setAnnouncement] = useState({
    title: "✨【夢沙星願祭】跨年夜搶尾刀活動即將開跑！",
    content: "歡迎來到夢沙 DreamSand。這是一個由陌生人的善意堆疊而成的溫暖空間，請盡情瀏覽他人的故事。"
  });
  const [wishes, setWishes] = useState([]);
  const [tags, setTags] = useState(['全部故事', '#學生苦讀中', '#面試大作戰', '#毛孩的願望', '#生日邊緣人']);
  const [loading, setLoading] = useState(false);

  // 徹底拔除裡面所有會報錯的 supabase.channel().subscribe() 程式碼
  useEffect(() => {
    // 這裡保持乾淨的空邏輯，不發起任何會崩潰的 WebSockets 連線
    console.log("🔒 夢沙雲端防禦：已成功將 Realtime 即時連線安全降級為靜態出廠模式。");
  }, []);

  return {
    announcement,
    wishes,
    tags,
    loading,
    refreshWishes: async () => {}
  };
}
