
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, User, LoaderCircle } from "lucide-react";
import { askEnvironmentalAssistant } from "@/ai/flows/environmental-assistant";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const currentQuestion = question;
    const userMessage: Message = { role: 'user', content: currentQuestion };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const assistantResponse = await askEnvironmentalAssistant(currentQuestion);
      const assistantMessage: Message = { role: 'assistant', content: assistantResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking AI assistant:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
      });
      // remove the user message if the API fails
      setMessages(prev => prev.filter(msg => msg.content !== currentQuestion));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl rounded-xl w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary flex items-center justify-center">
          <Sparkles className="mr-3 h-7 w-7" />
          Ask Your Environmental AI Assistant
        </CardTitle>
        <CardDescription>
          Have a question about pollution, conservation, or safety? Ask away!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto p-4 border rounded-lg mb-4 space-y-4 bg-secondary/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4" />
              <p className="text-lg">Welcome!</p>
              <p>You can ask me anything like:</p>
              <em className="mt-2 text-sm">"How does PM2.5 affect my health?"</em>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 bg-primary rounded-full text-primary-foreground">
                    <Bot className="h-6 w-6" />
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  <p className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
                </div>
                 {message.role === 'user' && (
                  <div className="p-2 bg-muted rounded-full text-muted-foreground">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="p-2 bg-primary rounded-full text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <div className="bg-card rounded-lg p-3">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What is acid rain?"
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
                "Ask"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
