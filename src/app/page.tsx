
"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { suggestLocator, type SuggestLocatorOutput } from "@/ai/flows/suggest-locator";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Loader2, UploadCloud, Wand2, RefreshCw } from "lucide-react";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  currentLocator: z.string().min(1, { message: "Locator cannot be empty." }),
});

export default function Home() {
  const [result, setResult] = useState<SuggestLocatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotDataUri, setScreenshotDataUri] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "https://dev-dash.janitri.in/",
      currentLocator: "",
    },
  });

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, etc.).",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setScreenshotPreview(dataUri);
      setScreenshotDataUri(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!screenshotDataUri) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot of the page.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await suggestLocator({
        ...values,
        screenshotDataUri,
      });
      setResult(aiResult);
    } catch (error) {
      console.error("Error suggesting locator:", error);
      toast({
        title: "An Error Occurred",
        description: "Failed to get suggestions. Please check the console and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
    setScreenshotPreview(null);
    setScreenshotDataUri(null);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 text-center">
        <h1 className="font-headline text-5xl font-bold tracking-tight">TestAutomator</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-powered assistant for robust UI test automation.
        </p>
      </header>
      <main className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">Analyze Your UI</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm} aria-label="Reset form">
                    <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Provide the URL, current locator, and a screenshot to get started.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentLocator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current CSS Locator</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., #login-button" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormItem>
                    <FormLabel>Screenshot</FormLabel>
                     {screenshotPreview ? (
                      <div className="relative group">
                        <Image
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          width={1280}
                          height={720}
                          className="w-full h-auto rounded-lg border border-border"
                          data-ai-hint="website screenshot"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                           <Button type="button" variant="secondary" onClick={() => {setScreenshotPreview(null); setScreenshotDataUri(null);}}>Change Screenshot</Button>
                        </div>
                      </div>
                    ) : (
                    <FormControl>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10"
                      >
                        <div className="text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4 flex text-sm justify-center leading-6 text-muted-foreground">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-semibold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-accent/90"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-muted-foreground/80">
                            PNG, JPG, GIF
                          </p>
                        </div>
                      </div>
                    </FormControl>
                     )}
                  </FormItem>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Analyzing..." : "Suggest Locators"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <div className="md:sticky md:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">AI Suggestions</CardTitle>
                <CardDescription>
                  Review the AI-generated suggestions and reasoning below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="pt-4 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                )}
                {!isLoading && !result && (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Suggestions will appear here once you analyze a UI.</p>
                  </div>
                )}
                {result && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-headline text-lg font-semibold">Reasoning</h3>
                      <p className="text-muted-foreground">{result.reasoning}</p>
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-semibold">Suggested Locators</h3>
                      <ul className="mt-2 space-y-2">
                        {result.suggestedLocators.map((locator, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                          >
                            <code className="font-mono text-sm">{locator}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(locator)}
                              aria-label={`Copy locator: ${locator}`}
                            >
                              <ClipboardCopy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
