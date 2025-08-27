"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  FileText,
  Key
} from "lucide-react";

interface AIConfigurationGuideProps {
  onCopy?: (text: string) => void;
}

export function AIConfigurationGuide({ onCopy }: AIConfigurationGuideProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    onCopy?.(text);
  };

  const environmentVariables = [
    {
      name: "GOOGLE_AI_API_KEY",
      description: "Your Google AI API key for Gemini models",
      required: true,
      example: "AIzaSyB6x3j4k5l8m9n0p1q2r3s4t5u6v7w8x9y0",
      getValue: () => {
        // This would normally read from actual environment
        return process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ? "••••••••••••••••" : "Not set";
      }
    },
    {
      name: "NODE_ENV",
      description: "Environment mode (development, production, test)",
      required: false,
      example: "development",
      getValue: () => process.env.NODE_ENV || "development"
    }
  ];

  const steps = [
    {
      title: "Get Google AI API Key",
      description: "Generate an API key from Google AI Studio",
      icon: ExternalLink,
      action: {
        label: "Go to Google AI Studio",
        url: "https://ai.google.dev/",
        external: true
      }
    },
    {
      title: "Create Environment File",
      description: "Create or update your .env.local file",
      icon: FileText,
      code: `# Google AI Configuration
GOOGLE_AI_API_KEY=your_api_key_here

# Environment (optional)
NODE_ENV=development`
    },
    {
      title: "Restart Development Server",
      description: "Restart your Next.js development server",
      icon: Settings,
      action: {
        label: "Restart Server",
        command: "npm run dev"
      }
    },
    {
      title: "Verify Configuration",
      description: "Check if AI is properly configured",
      icon: CheckCircle,
      action: {
        label: "Check AI Status",
        component: "AIStatus"
      }
    }
  ];

  const troubleshooting = [
    {
      issue: "API Key Not Found",
      solution: "Make sure your .env.local file is in the root directory and contains GOOGLE_AI_API_KEY",
      check: "Verify the file exists and has the correct variable name"
    },
    {
      issue: "Invalid API Key",
      solution: "Check your API key in Google AI Studio and ensure it's properly formatted",
      check: "Try generating a new API key"
    },
    {
      issue: "Environment Variable Not Loading",
      solution: "Restart your development server after updating .env.local",
      check: "Check that the server is reading from the correct environment"
    },
    {
      issue: "Network Issues",
      solution: "Check your internet connection and firewall settings",
      check: "Test API access directly in browser"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Configuration Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Configuration Required</AlertTitle>
            <AlertDescription>
              To use AI features in EcoAlert, you need to configure a Google AI API key. 
              Follow the steps below to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {environmentVariables.map((envVar) => (
            <div key={envVar.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{envVar.name}</h4>
                  {envVar.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{envVar.description}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {envVar.getValue()}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(envVar.example, envVar.name)}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedSection === envVar.name ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  
                  {step.code && (
                    <div className="relative">
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      >
                        <Copy className="h-4 w-4" />
                        {copiedSection === `step-${index}` ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  )}
                  
                  {step.action && (
                    <div className="flex gap-2 mt-3">
                      {step.action.url ? (
                        <Button asChild variant="outline" size="sm">
                          <a 
                            href={step.action.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {step.action.label}
                          </a>
                        </Button>
                      ) : step.action.command ? (
                        <Button variant="outline" size="sm" onClick={() => {
                          // In a real app, this would run the command
                          console.log(`Running: ${step.action.command}`);
                        }}>
                          <Settings className="h-4 w-4 mr-2" />
                          {step.action.label}
                        </Button>
                      ) : step.action.component === "AIStatus" ? (
                        <Button variant="outline" size="sm" onClick={() => {
                          // Navigate to AI status tab
                          document.querySelector('[value="ai-status"]')?.click();
                        }}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {step.action.label}
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {troubleshooting.map((issue, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {issue.issue}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">{issue.solution}</p>
                <p className="text-xs text-muted-foreground">
                  <strong>Check:</strong> {issue.check}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              asChild 
              className="w-full justify-start"
            >
              <a 
                href="https://ai.google.dev/docs" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Google AI Documentation
              </a>
            </Button>
            <Button 
              variant="outline" 
              asChild 
              className="w-full justify-start"
            >
              <a 
                href="https://github.com/google/genkit" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Genkit Framework Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}