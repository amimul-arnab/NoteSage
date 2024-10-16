"use client";
import Link from "next/link";
import Image from "next/image";
import GoogleButton from "react-google-button";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import LogoLight from "../assets/logo/NoteSageLogo_Light.png";

export default function LoginPage() {
  const router = useRouter(); // Initialize useRouter

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission
    router.push("/main"); // Redirect to the main page
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
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-5 border border-gray-300 rounded-full"
          />
          <div className="mt-8">
            <button
              type="submit"
              className="w-full p-4 bg-[#61cc03] text-white font-semibold rounded-full"
              style={{ width: "250px", margin: "0 auto", display: "block" }}
            >
              Sign In
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
