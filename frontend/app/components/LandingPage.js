// app/components/LandingPage.js
import Image from "next/image";
import Link from "next/link";
import FeatureItem from "./FeatureItem";
import LogoLight from "../assets/logo/NoteSageLogo_Light.png";
import Neurodivergent from "../assets/neurodivergent.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9faf9] text-[#12150f] flex flex-col justify-between">
      {/* Top Banner Section */}
      <section className="flex flex-col md:flex-row items-center p-8 md:p-16 bg-[#f4f4f4] md:h-[500px]">
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <Image
              src={LogoLight}
              alt="NoteSage Logo"
              width={600}
              height={400}
              className="object-contain"
            />
          </Link>
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

      {/* Features Section */}
      <section className="flex flex-col items-center gap-16 p-8 md:p-12">
        <FeatureItem
          title="Study Guide Generation"
          description="Simply upload your notes and create a customized study guide just for you, saving you time from creating your own."
        />

        <FeatureItem
          title="Active Learning with "
          description="Trouble learning a concept? No problem, SageAI has you covered. Simplify your notes to dive further into a concept and help you remember better."
          highlight="SageAI"
        />

        <FeatureItem
          title="Learn with Flashcards"
          description="Convert your notes into flashcards to help you learn and memorize important concepts."
        />

        <FeatureItem
          title="Test Your Knowledge"
          description="Turn your notes and flashcards into generated exams to help ace your classes."
        />
      </section>

      {/* Neurodivergent Friendly Banner */}
      <section className="flex flex-col md:flex-row items-center justify-between p-8 md:p-16 text-white bg-gradient-to-r from-[#0097b2] to-[#7ed957]">
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Neurodivergent Friendly
          </h2>
          <p className="text-xl md:text-2xl">
            At NoteSage, we know learning can be a challenge for those who think
            differently. We're here to make it easier, guiding you every step of
            the way to unlock your full potential with care and understanding.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
            <span className="text-7xl text-gray-400">
              <Image
              src={Neurodivergent}
              alt="NoteSage Logo"
              width={400}
              height={500}
              className="object-contain"
              />
            </span>
          </div>
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
