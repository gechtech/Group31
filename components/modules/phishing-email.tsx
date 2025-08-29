"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertTriangle, CheckCircle, Bot } from "lucide-react";


export function PhishingEmail() {
  const [emailAccount, setEmailAccount] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [analysis, setAnalysis] = useState<{ suspicious: boolean; keywords: string[]; score: number } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ risk_score: number; reasoning: string; recommendations: string[] } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const suspiciousKeywords = [
    "urgent", "immediate", "verify", "suspend", "click here", "act now",
    "limited time", "congratulations", "winner", "free", "prize",
    "bank account", "social security", "password", "login", "confirm"
  ];

  // Local keyword-based check
  const analyzeEmail = () => {
    const content = emailContent.toLowerCase();
    const foundKeywords = suspiciousKeywords.filter((keyword) => content.includes(keyword.toLowerCase()));

    const score = foundKeywords.length;
    const suspicious = score >= 2;

    setAnalysis({
      suspicious,
      keywords: foundKeywords,
      score,
    });
  };

  // AI-based phishing detection using Groq API
  const analyzeWithGroq = async () => {
    if (!emailAccount.trim() && !emailContent.trim()) return;
    setLoadingAI(true);
    setAiAnalysis(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing Groq API key. Add NEXT_PUBLIC_GROQ_API_KEY in .env.local");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are an AI email security analyzer. 
Return ONLY valid JSON in the following format:
{
  "risk_score": number between 0 and 10,
  "reasoning": "short explanation of why",
  "recommendations": ["step 1", "step 2"]
}`
            },
            {
              role: "user",
              content: `Analyze this email for phishing and malicious intent:
Email Account: ${emailAccount}
Email Content: ${emailContent}`
            }
          ],
          temperature: 0.2,
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errText}`);
      }

      const data = await res.json();

      // Parse JSON from AI output safely
      let parsed;
      try {
        parsed = JSON.parse(data.choices[0]?.message?.content || "{}");
      } catch (e) {
        throw new Error("Failed to parse AI JSON output");
      }

      setAiAnalysis(parsed);
    } catch (err: any) {
      console.error(err);
      setAiAnalysis({
        risk_score: -1,
        reasoning: err.message || "Error analyzing email with AI.",
        recommendations: [],
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Phishing Email Detection</h1>
        </div>
        <p className="text-gray-600">
          Paste an email address and its content to analyze it with AI and keyword detection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Analysis Tool</CardTitle>
          <CardDescription>Scans for phishing keywords and AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email account */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Account</label>
            <Input
              placeholder="e.g. user@example.com"
              value={emailAccount}
              onChange={(e) => setEmailAccount(e.target.value)}
            />
          </div>

          {/* Email content */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Content</label>
            <Textarea
              placeholder="Paste the email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-32"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={analyzeEmail} disabled={!emailContent.trim()} className="flex-1">
              Keyword Analysis
            </Button>
            <Button onClick={analyzeWithGroq} disabled={!emailContent.trim()} className="flex-1" variant="secondary">
              {loadingAI ? "Analyzing..." : "AI Analysis"}
            </Button>
          </div>

          {/* Local keyword analysis result */}
          {analysis && (
            <div className={analysis.suspicious ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <div className="flex items-center gap-2">
                {analysis.suspicious ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <div className={analysis.suspicious ? "text-red-800" : "text-green-800"}>
                  <strong>{analysis.suspicious ? "Suspicious Email Detected!" : "Email Appears Safe"}</strong>
                  <div className="mt-2">Risk Score: {analysis.score}/10</div>
                  {analysis.keywords.length > 0 && (
                    <div className="mt-2">
                      <strong>Suspicious keywords found:</strong> {analysis.keywords.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI analysis result */}
          {aiAnalysis && (
            <div className={aiAnalysis.risk_score >= 7 ? "border border-red-700 bg-red-200 rounded p-2" : "border-blue-200 bg-blue-50"}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <strong>
                    {aiAnalysis.risk_score === -1
                      ? "AI Analysis Failed"
                      : `AI Phishing Risk Score: ${aiAnalysis.risk_score}/10`}
                  </strong>
                </div>
              
              <div>
                  <strong>Reasoning:</strong> {aiAnalysis.reasoning}
                </div>
                {aiAnalysis.recommendations.length > 0 && (
                  <div>
                    <strong>Recommendations:</strong>
                    <ul className="list-disc ml-5">
                      {aiAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding Phishing Email Attacks</CardTitle>
          <CardDescription>
            Learn about this common cyber threat and how to prevent it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">What is Phishing Email?</h4>
              <p className="text-sm text-gray-700">
                Phishing is a type of social engineering attack often used to steal user data,
                including login credentials and credit card numbers. It occurs when an attacker,
                disguising themselves as a trustworthy entity, dupes a victim into opening an email,
                instant message, or text message.
              </p>

              <h4 className="font-semibold mb-3 mt-6 text-red-700">Common Tactics:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Urgent or threatening language (e.g., "account suspended," "immediate action required")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Links to fake login pages or malicious websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Generic greetings ("Dear Customer") instead of your name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Attachments that contain malware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Spoofed sender addresses that look legitimate but are slightly off</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Prevention Strategies:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Always check the sender's email address for legitimacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Hover over links before clicking to see the actual URL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Be suspicious of urgent or unexpected emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Never provide personal information or credentials in response to an email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Use multi-factor authentication (MFA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Report suspicious emails to your IT department</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
