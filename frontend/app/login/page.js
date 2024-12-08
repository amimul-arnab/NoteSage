"use client";
import Link from "next/link";
import Image from "next/image";
import GoogleButton from "react-google-button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoLight from "../assets/logo/NoteSageLogo_Light.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Adjust the URL as needed for your Flask backend
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "An error occurred during login.");
      } else {
        // Store tokens on success
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        // Redirect to main page after successful login
        router.push("/main");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9faf9] text-[#12150f]">
      <div className="w-full max-w-lg p-12 space-y-6 bg-white rounded-3xl shadow-lg">
        <div className="flex justify-center mb-2">
          <Image
            src={LogoLight}
            alt="NoteSage Logo"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>
        <h2
          className="text-center text-3xl font-bold"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Sign In
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-5 border border-gray-300 rounded-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-5 border border-gray-300 rounded-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessage && (
            <div className="text-red-500 text-center">{errorMessage}</div>
          )}
          <div className="mt-8">
            <button
              type="submit"
              className={`w-full p-4 font-semibold rounded-full text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#61cc03]"
              }`}
              style={{ width: "250px", margin: "0 auto", display: "block" }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <div className="flex justify-center">
          <GoogleButton
            onClick={() => {
              console.log("Google button clicked");
            }}
          />
        </div>
        <div className="text-center mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#61cc03] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
