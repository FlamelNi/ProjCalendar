import React, { useEffect } from "react";
import { useAuth } from "../GoogleAuthProvider";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/calendar");
    }
  }, [user, navigate]);

  return (
    <div>
      {user ? (
        <>
          <h2>Welcome, {user.name}</h2>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}
