// Lightweight API client for GetSpot backend
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  followers: number;
  following: number;
};

export type Story = {
  id: string;
  user_id: string;
  user_name: string;
  avatar: string;
  background: string;
  viewed: boolean;
};

export type Event = {
  id: string;
  title: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  image: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  description: string;
  category: string;
  attendees: string[];
  member_count: number;
  is_premium: boolean;
  going: boolean;
};

export type Spot = {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
};

export type Post = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  created_at: string;
};

export type ChatPreview = {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  last_message: string;
  time: string;
  unread: number;
  online: boolean;
};

export type Message = {
  id: string;
  chat_id: string;
  sender: string;
  text: string;
  time: string;
};

export const api = {
  me: () => req<User>("/me"),
  stories: () => req<Story[]>("/stories"),
  events: (category?: string) => req<Event[]>(`/events${category ? `?category=${category}` : ""}`),
  event: (id: string) => req<Event>(`/events/${id}`),
  toggleGoing: (id: string) => req<{ going: boolean; member_count: number }>(`/events/${id}/going`, { method: "POST" }),
  createEvent: (body: { title: string; location: string; date: string; description: string; category?: string }) =>
    req<Event>("/events", { method: "POST", body: JSON.stringify(body) }),
  spots: (category?: string) => req<Spot[]>(`/spots${category ? `?category=${category}` : ""}`),
  posts: (userId?: string) => req<Post[]>(`/posts${userId ? `?user_id=${userId}` : ""}`),
  chats: () => req<ChatPreview[]>("/chats"),
  messages: (chatId: string) => req<Message[]>(`/chats/${chatId}/messages`),
  sendMessage: (chatId: string, text: string) =>
    req<Message>(`/chats/${chatId}/messages`, { method: "POST", body: JSON.stringify({ text }) }),
};
