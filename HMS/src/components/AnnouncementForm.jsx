import { Megaphone, Send } from 'lucide-react';

export default function AnnouncementForm({ managerId }) {
  const [content, setContent] = useState("");

  const handlePost = async () => {
    if (!content.trim()) return;

    const response = await fetch('http://127.0.0.1:5555/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: managerId,
        user_role: 'manager',
        content: content
      })
    });

    if (response.ok) {
      setContent("");
      alert("Announcement broadcasted!");
    }
  };

  return (
    <div className="bg-indigo-50 p-6 rounded-3xl mb-8 border border-indigo-100">
      <h3 className="flex items-center gap-2 font-bold text-indigo-900 mb-4">
        <Megaphone size={20} /> Broadcast Announcement
      </h3>
      <div className="flex gap-3">
        <textarea 
          className="flex-1 p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-400 text-sm"
          placeholder="e.g. Water maintenance tomorrow from 10 AM..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button 
          onClick={handlePost}
          className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 self-end transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}