'use client';
import { useState } from 'react';
import Image from 'next/image';

const subcategories = [
  'milk', 'cheese', 'coffee', 'shampoo', 'detergent', 'chips', 'purees',
  'dry_food', 'yogurt', 'toothpaste', 'tea', 'paper_products', 'pasta',
  'body_wash', 'butter', 'juice', 'conditioner', 'trash_bags', 'crackers',
  'snacks', 'treats', 'floss', 'bars', 'floor_cleaner', 'oil',
  'air_freshener', 'wipes', 'wet_food', 'laundry', 'bathroom_cleaner',
  'dish_soap', 'all_purpose', 'glass_cleaner', 'water', 'nuts',
  'mouthwash'
].sort();

export default function Home() {
  const [upc, setUpc] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upc,
          subcategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
    }
  };

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-12 space-y-10">
      <Image
        src="/FeatureBox_Logo.png"
        alt="FeatureBox Logo"
        width={120}
        height={120}
        className="mb-4 rounded-xl shadow-lg bg-[#181818] p-2"
        priority
      />
      <h1 className="text-4xl font-bold text-center">
        Product Similarity Matcher
      </h1>

      <div className="w-full max-w-xl bg-[#111] p-8 rounded-2xl shadow-lg space-y-6">
        <div>
          <label className="block mb-2 font-medium">Enter UPC Code</label>
          <input
            type="text"
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            className="w-full p-3 bg-[#1c1c1c] text-white border border-[#333] rounded-md"
            placeholder="e.g. 012345678901"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Select Subcategory</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full p-3 bg-[#1c1c1c] text-white border border-[#333] rounded-md"
          >
            <option value="">-- Select --</option>
            {subcategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="w-full py-3 rounded-md font-semibold text-white bg-[#7a5af8] hover:bg-[#6241f2] transition"
        >
          Find Similar Products
        </button>
      </div>

      {results.length > 0 && (
        <div className="w-full max-w-xl mt-6">
          <h2 className="text-2xl font-semibold mb-4">Similar Products:</h2>
          <ul className="space-y-2 text-lg text-gray-300">
            {results.map((item, idx) => (
              <li key={idx} className="bg-[#1a1a1a] p-3 rounded-md border border-[#333]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}