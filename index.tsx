
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
// FIX: Import html2canvas to resolve 'Cannot find name' error.
import html2canvas from "html2canvas";

const App = () => {
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [shortcomings, setShortcomings] = useState([""]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [growthTips, setGrowthTips] = useState<string[]>([]);
  const [strengthSummary, setStrengthSummary] = useState("");
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [friendName, setFriendName] = useState("");
  const [friendMessage, setFriendMessage] = useState("");
  const [template, setTemplate] = useState({
    bg: "#FFD9FA",
    font: "#333333",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const totalPages = 6;
  const progress = (page / totalPages) * 100;

  const handleNext = () => setPage(page + 1);
  const handleBack = () => setPage(page - 1);

  const validateAndProceed = (validationFn: () => boolean) => {
    setError("");
    if (validationFn()) {
      handleNext();
    }
  };
  
  const resetApp = () => {
      setPage(1);
      setStudentId("");
      setName("");
      setShortcomings([""]);
      setAffirmations([]);
      setExplanations([]);
      setGrowthTips([]);
      setStrengthSummary("");
      setCurrentExplanationIndex(0);
      setFriendName("");
      setFriendMessage("");
      setTemplate({ bg: "#FFD9FA", font: "#333333" });
      setLoading(false);
      setError("");
  }

  const generateAnalysis = async (currentShortcomings: string[]) => {
    setError("");
    const filledShortcomings = currentShortcomings.filter(s => s.trim() !== "");
    if (filledShortcomings.length === 0) {
      setError("단점을 하나 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setPage(4); // Navigate immediately to loading page

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send both keys for compatibility as user suggested
        body: JSON.stringify({ name, shortcomings: filledShortcomings, filledShortcomings }),
      });

      if (!response.ok) {
        // Use user's better error message parsing
        const text = await response.text().catch(() => "");
        let msg = text || `HTTP ${response.status}`;
        try {
          const maybe = JSON.parse(text);
          if (maybe?.error) msg = maybe.details ? `${maybe.error} (Details: ${maybe.details})` : maybe.error;
        } catch { /* ignore parse error */ }
        throw new Error(msg);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";

      while (true) {
          const { done,