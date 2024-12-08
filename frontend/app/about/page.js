import Image from "next/image";
import Link from "next/link";
import LogoLight from "../assets/logo/NoteSageLogo_Light.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9faf9] text-[#12150f] flex flex-col justify-between">
      {/* Top Banner Section */}
      <section className="flex flex-col md:flex-row items-center p-8 md:p-16 bg-[#f4f4f4] md:h-[500px]">
        <div className="flex-1 flex justify-center">
          <Image
            src={LogoLight}
            alt="NoteSage Logo"
            width={600}
            height={400}
            className="object-contain"
          />
        </div>
        <div className="flex-1 text-center md:text-left md:pl-10 mt-8 md:mt-0">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Study smarter. <br /> Learn Faster. <br />{" "}
            <span className="text-[#61cc03]">All in one!</span>
          </h1>
          <Link href="/login">
            <button className="mt-8 px-16 py-5 bg-[#61cc03] text-white rounded-full text-2xl font-semibold">
              Let's Begin!
            </button>
          </Link>
        </div>
      </section>



      {/* Footer Section */}
      <footer className="bg-[#f9faf9] text-center py-6 mt-8 text-sm">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
        <p className="text-[#12150f]">© 2024 NoteSage. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureItem({ title, description, highlight }) {
  return (
    <div className="text-center flex flex-col items-center w-full md:max-w-xl">
      <div className="w-24 h-24 mb-6 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-4xl text-gray-400">📷</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mt-2">
        {title} {highlight && <span className="text-[#61cc03]">{highlight}</span>}
      </h2>
      <p className="mt-4 text-lg md:text-xl max-w-lg">{description}</p>
    </div>
  );
}
