"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DatabaseTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      let userId = localStorage.getItem("userId");
      // Manual override for testing - replace with your actual UUID from database
      const manualUserId = "dc9d9422-7725-4600-ab7f-986295a04f65";
      console.log("Original stored userId:", userId);
      console.log("Using manual userId for testing:", manualUserId);
      userId = manualUserId;

      if (!userId) {
        setResult({ error: "No userId found in localStorage" });
        return;
      }

      // Test query - first let's see all profiles
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');
        
      console.log('All profiles:', allProfiles);
      if (allProfiles) {
        const formattedProfiles = allProfiles.map(profile => ({
          id: profile.id,
          company_size: profile.company_size,
        }));
        console.log('Formatted Profiles for Debug:', formattedProfiles);
      }
      
      // Now test the specific query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setResult({ data, error, userId });
      console.log("Database test result:", { data, error, userId });
    } catch (err) {
      setResult({ error: err });
      console.error("Database test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-bold mb-4">Database Test</h3>
      <button 
        onClick={testDatabase}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Database"}
      </button>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold">Result:</h4>
          <pre className="bg-black p-2 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
