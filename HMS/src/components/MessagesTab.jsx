import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';

export default function MessagesTab({ currentUser }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");  const [errorMessage, setErrorMessage] = useState("");  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch approved contacts based on user role
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetch(`http://127.0.0.1:5555/users/${currentUser.id}/approved-contacts`)
        .then(async (r) => {
          const data = await r.json().catch(() => null);
          if (!r.ok) {
            throw new Error(data?.error || data?.message || 'Failed to load contacts');
          }
          return data;
        })
        .then(data => {
          if (Array.isArray(data)) {
            setContacts(data);
          }
          setErrorMessage("");
        })
        .catch(err => setErrorMessage(err.message || 'Error fetching contacts'));
    }
  }, [currentUser?.id]);

  // Fetch messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5555/messages?user_id=${currentUser.id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to load messages');
      }

      const filtered = data.filter(m => 
        (m.sender_id === selectedContact.id && m.receiver_id === currentUser.id) ||
        (m.sender_id === currentUser.id && m.receiver_id === selectedContact.id)
      );
      setMessages(filtered);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message || 'Error fetching messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch('http://127.0.0.1:5555/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: selectedContact.id,
          content: text
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to send message');
      }

      setText("");
      setErrorMessage("");
      fetchMessages();
    } catch (err) {
      setErrorMessage(err.message || 'Error sending message');
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar: Contacts */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 font-black text-gray-400 text-xs uppercase tracking-widest">
          Recents
        </div>
        {contacts.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">
            No approved contacts yet
          </div>
        ) : (
          contacts.map(contact => (
            <button 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 border-b transition ${
                selectedContact?.id === contact.id 
                  ? 'bg-indigo-50 border-r-4 border-r-indigo-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-gray-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">{contact.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{contact.role}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedContact ? (
          <>
            <div className="p-4 bg-white border-b font-bold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Chatting with {selectedContact.full_name}
            </div>

            {errorMessage && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                      m.sender_id === currentUser.id 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
              <input 
                type="text"
                placeholder="Write a message..."
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
            {contacts.length === 0 
              ? "No approved contacts available for messaging"
              : "Select a contact to start messaging"
            }
          </div>
        )}
      </div>
    </div>
  );
}