"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem('navbarOpen');
    setIsOpen(storedState === 'true');
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error);
          return;
        }
        setEmail(data.email || "");
        setFullName(data.full_name || "");
        setCreatedAt(data.created_at ? new Date(data.created_at).toLocaleString() : "");
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [token, router]);

  const marginLeft = isOpen ? 'ml-64' : 'ml-20';

  const handleLogout = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRefreshToken = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/auth/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("refresh_token")}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to refresh token:", data.error);
        alert("Failed to refresh token.");
      } else {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          alert("Token refreshed successfully.");
        }
      }
    } catch (error) {
      console.error("Refresh token error:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token || !newName.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/auth/update_profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: newName.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error updating profile:", data.error);
        alert("Failed to update profile.");
      } else {
        alert("Name updated successfully!");
        setFullName(newName.trim());
        setNewName("");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("An error occurred while updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={() => {
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem('navbarOpen', newState);
      }} activePage="settings" />
      <div className={`p-10 w-full bg-[#f9faf9] transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-4xl font-bold mb-8 text-[#12150f]">Settings</h1>

        <div className="flex flex-col gap-8 max-w-2xl">
          {/* Profile Info Section */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-[#12150f]">Profile Info</h2>
            <p className="mb-2"><strong>Email:</strong> {email}</p>
            <p className="mb-2"><strong>Full Name:</strong> {fullName}</p>
            <p className="mb-2"><strong>Account Created:</strong> {createdAt}</p>
          </div>

          {/* Update Name Section */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-[#12150f]">Update Name</h2>
            <input
              type="text"
              placeholder="New Full Name"
              className="border border-gray-300 rounded p-3 w-full mb-4 focus:outline-none focus:border-[#61cc03] focus:ring-1 focus:ring-[#61cc03] transition"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              onClick={handleUpdateProfile}
              className={`w-full py-3 rounded-full font-medium text-white transition-colors duration-300 ${(!newName.trim() || updating) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#61cc03] hover:bg-[#52ab02]'}`}
              disabled={!newName.trim() || updating}
            >
              {updating ? 'Updating...' : 'Update Name'}
            </button>
          </div>

          {/* Session Management Section */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#12150f]">Session Management</h2>
            <button
              onClick={handleRefreshToken}
              className="w-full py-3 rounded-full font-medium text-white bg-green-500 hover:bg-green-600 transition-colors duration-300"
            >
              Refresh Token
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-full font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
