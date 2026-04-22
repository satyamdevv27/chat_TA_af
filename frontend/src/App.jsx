import { useState, useEffect } from "react";
import {supabase } from "./superbase.js";
import Login from "./components/login.jsx";
import ChatList from "./components/chatlist.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // check session on reload
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // listen auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <ChatList user={user} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;