// malicious_url.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle, Bot, Search, Puzzle } from "lucide-react";

export function MaliciousURL() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ risk_score: number; reasoning: string; recommendations: string[] } | null>(null);

  // --- NEW FUNCTION to add extension ---
  const handleAddExtension = async () => {
    try {
      // ⚠️ IMPORTANT: Chrome does not allow adding extensions directly from web pages.
      // This just *simulates* the process for your UI.
      // In real use, you must manually enable Developer Mode in Chrome and load unpacked extensions.

      alert(
        "To add the extension:\n\n1. Open Chrome → Extensions (chrome://extensions/)\n2. Enable Developer Mode in the right top corner\n3. Click 'Load unpacked'\n4. Select folder:\nGroup31\\safe-browse-guard-extension"
      );
    } catch (err) {
      alert("Failed to add extension: " + (err as Error).message);
    }
  };

  // List of known phishing domains & suspicious keywords
  const phishingDomains = [
    "paypal-login.com",
    "secure-update.net",
    "apple-verify.com",
    "bankofamerica-login.net",
    "login-microsoftsecure.com",
    "facebook-securityalert.com",
    "google-verifyaccount.com",
    "amazon-updatebilling.com",
    "outlook-websecure.com",
    "chase-banklogin.com",
    "icloud-securityverify.com",
    "dropbox-loginsecure.com",
    "instagram-security-alert.com",
    "linkedin-updateaccount.com",
    "yahoo-mailverify.com",
    "wellsfargo-securelogin.com",
    "microsoft-supportverify.com",
    "citibank-onlineverify.com",
    "hsbc-securebanking.com",
    "netflix-accountverify.com",
    "steamcommunity-loginsecure.com",
    "tiktok-verificationsecure.com",
    "snapchat-loginverify.com",
  ];

  const suspiciousKeywords = [
    "login",
    "secure",
    "verify",
    "update",
    "account",
    "password",
    "signin",
    "webmail",
    "auth",
    "authentication",
    "billing",
    "confirm",
    "credentials",
    "idcheck",
    "validate",
    "banking",
    "support",
    "unlock",
    "security",
    "reset",
    "verification",
    "recover",
    "access",
    "renew",
  ];

  // Local keyword-based detection
  const analyzeWithKeyword = () => {
    if (!url.trim()) return;

    const lowerUrl = url.toLowerCase();
    let score = 0;
    let reasons: string[] = [];

    if (phishingDomains.some((domain) => lowerUrl.includes(domain))) {
      score += 8;
      reasons.push("Matches known phishing domain.");
    }

    const matchedKeywords = suspiciousKeywords.filter((kw) => lowerUrl.includes(kw));
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 1.5;
      reasons.push(`Contains suspicious keywords: ${matchedKeywords.join(", ")}`);
    }

    if (score > 10) score = 10;

    setAnalysis({
      risk_score: score,
      reasoning: reasons.length > 0 ? reasons.join(" ") : "No phishing indicators found.",
      recommendations:
        score > 5
          ? ["Do not click this link.", "Report to your IT/security team.", "Use a URL scanning service."]
          : ["Seems safe, but always verify the source."],
    });
  };

  // AI-based detection
  const analyzeWithAI = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing Groq API key. Add NEXT_PUBLIC_GROQ_API_KEY in .env.local");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are an AI URL security analyzer. Return ONLY valid JSON in the following format:
{
  "risk_score": number between 0 and 10,
  "reasoning": "short explanation of why",
  "recommendations": ["step 1", "step 2"]
}`,
            },
            {
              role: "user",
              content: `Analyze this URL for malicious or phishing intent: ${url}`,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errText}`);
      }

      const data = await res.json();

      let parsed;
      try {
        parsed = JSON.parse(data.choices[0]?.message?.content || "{}");
      } catch (e) {
        throw new Error("Failed to parse AI JSON output");
      }

      setAnalysis(parsed);
    } catch (err: any) {
      setAnalysis({
        risk_score: -1,
        reasoning: err.message || "Error analyzing URL with AI.",
        recommendations: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header with Add Extension Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" /> Malicious URL Detection
          </h1>
          <p className="text-gray-600">
            Paste a URL and check if it's potentially dangerous using keyword or AI analysis.
          </p>
        </div>
        <Button onClick={handleAddExtension} variant="default" className="flex items-center gap-2">
          <Puzzle className="h-4 w-4" /> Add Extension
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Analysis Tool</CardTitle>
          <CardDescription>Scan URLs for malicious or phishing behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeWithKeyword} disabled={!url.trim()} variant="outline" className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4" /> Keyword Analysis
            </Button>
            <Button onClick={analyzeWithAI} disabled={!url.trim()} variant="secondary" className="flex-1">
              {loading ? "Analyzing with AI..." : "AI Analysis"}
            </Button>
          </div>

          {analysis && (
            <div
              className={`mt-4 p-3 rounded border ${
                analysis.risk_score >= 5
                  ? "border-red-600 bg-red-50"
                  : analysis.risk_score === -1
                  ? "border-yellow-600 bg-yellow-50"
                  : "border-green-600 bg-green-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {analysis.risk_score >= 7 ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : analysis.risk_score === -1 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <strong>
                  {analysis.risk_score === -1
                    ? "Analysis Failed"
                    : `Risk Score: ${analysis.risk_score}/10`}
                </strong>
              </div>
              <div className="mt-2">
                <strong>Reasoning:</strong> {analysis.reasoning}
              </div>
              {analysis.recommendations.length > 0 && (
                <div className="mt-2">
                  <strong>Recommendations:</strong>
                  <ul className="list-disc ml-5">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding Malicious URL Attacks</CardTitle>
          <CardDescription>
            Learn about dangerous links and how to identify them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">What is a Malicious URL?</h4>
              <p className="text-sm text-gray-700">
                A malicious URL (Uniform Resource Locator) is a link designed to lead users to
                websites that host malware, phishing scams, or other harmful content.
                These URLs are often disguised to look legitimate, tricking users into clicking them.
              </p>

              <h4 className="font-semibold mb-3 mt-6 text-red-700">Common Tactics:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Typo-squatting (e.g., "gooogle.com" instead of "google.com")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Using legitimate domain names with extra subdomains (e.g., "bank.com.malicious.link")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>URL shortening services (making the destination hidden)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Embedding credentials in the URL (e.g., "http://user:pass@example.com")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Redirects to unexpected or malicious sites</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Prevention Strategies:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Hover over links to inspect the full URL before clicking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Be wary of unexpected links in emails, messages, or social media</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Use a URL scanner or browser extension to check link safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Ensure your browser and antivirus software are up-to-date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Only download files from trusted sources</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
