// app/components/FeatureItem.js
export default function FeatureItem({ title, description, highlight }) {
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
  