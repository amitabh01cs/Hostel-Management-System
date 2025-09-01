import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAntiRaggingReportSchema, type InsertAntiRaggingReport } from "../../../shared/schema";
import { apiRequest } from "../lib/queryClient";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertTriangle, Camera, Video, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import LayoutS from "../components/LayoutS";

const formSchema = insertAntiRaggingReportSchema.extend({
  photoFiles: z.array(z.instanceof(File)).optional(),
  videoFiles: z.array(z.instanceof(File)).optional(),
  textFiles: z.array(z.instanceof(File)).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AntiRagging() {
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterName: "",
      contact: "",
      description: "",
      photoFiles: [],
      videoFiles: [],
      textFiles: [],
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert files to base64 or handle file upload as needed
      const submitData: InsertAntiRaggingReport = {
        reporterName: data.reporterName || undefined,
        contact: data.contact || undefined,
        description: data.description,
        photoFiles: data.photoFiles?.map(f => f.name) || [],
        videoFiles: data.videoFiles?.map(f => f.name) || [],
        textFiles: data.textFiles?.map(f => f.name) || [],
      };
      
      const response = await apiRequest("POST", "/api/anti-ragging", submitData);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmittedReportId(data.reportId);
      toast({
        title: "Report submitted successfully!",
        description: `Your report ID is: ${data.reportId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/anti-ragging'] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitReportMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setSubmittedReportId(null);
  };

  const handleFileChange = (files: FileList | null, fieldName: keyof FormData) => {
    if (files) {
      const fileArray = Array.from(files);
      form.setValue(fieldName, fileArray as any);
    }
  };

  return (
    <LayoutS>
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Anti-Ragging Complaint</h1>
        <p className="text-gray-600 mt-2">Report any ragging incidents confidentially</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <Alert className="bg-red-50 border-red-200 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <div>
                <h4 className="font-medium text-red-800">Important Notice</h4>
                <p className="text-red-700 mt-1">
                  All complaints are treated with strict confidentiality. Your safety and privacy are our top priority.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reporterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporter Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Leave blank for anonymous reporting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="For follow-up if needed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={5} 
                        placeholder="Please describe the incident in detail. Include date, time, location, and people involved..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload Sections */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="photoFiles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Photo Evidence (Optional)</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Camera className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload photos or drag and drop</p>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden" 
                            id="photo-upload"
                            onChange={(e) => handleFileChange(e.target.files, 'photoFiles')}
                          />
                          <label htmlFor="photo-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Browse Files
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoFiles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Video Evidence (Optional)</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Video className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload videos or drag and drop</p>
                          <Input 
                            type="file" 
                            accept="video/*" 
                            multiple 
                            className="hidden" 
                            id="video-upload"
                            onChange={(e) => handleFileChange(e.target.files, 'videoFiles')}
                          />
                          <label htmlFor="video-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Browse Files
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textFiles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Text Documents (Optional)</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <FileText className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-600 mb-2">Upload text files (.txt, .doc, .docx, .pdf)</p>
                          <Input 
                            type="file" 
                            accept=".txt,.doc,.docx,.pdf" 
                            multiple 
                            className="hidden" 
                            id="text-upload"
                            onChange={(e) => handleFileChange(e.target.files, 'textFiles')}
                          />
                          <label htmlFor="text-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Browse Files
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div>
                    <h4 className="font-medium text-yellow-800">Privacy & Security</h4>
                    <p className="text-yellow-700 mt-1">
                      Your complaint will be handled by trained professionals. All evidence will be securely stored and only accessed by authorized personnel.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {submittedReportId && (
                <Alert className="bg-green-50 border-green-200">
                  <Shield className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    <span className="font-medium">Report submitted successfully! Your report ID is: </span>
                    <span className="font-bold">{submittedReportId}</span>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={submitReportMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitReportMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </LayoutS>
  );
}
