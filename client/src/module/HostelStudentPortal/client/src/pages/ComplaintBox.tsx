import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import LayoutS from "../components/LayoutS";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { CardHeader, CardTitle } from "../components/ui/card";

const PAGE_SIZE = 3; // Number of complaints per page

type ComplaintForm = {
  issueDate: string;
  topic: string;
  description: string;
};

type Complaint = {
  id: string;
  issueDate: string;
  topic: string;
  description: string;
  status: string;
  feedback?: string;
  studentClosed?: boolean;
};

const ComplaintBoxS: React.FC = () => {
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [showMyComplaints, setShowMyComplaints] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);
  const [complaintsPage, setComplaintsPage] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get studentId from localStorage (set on login)
  const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
  const studentId = studentUser.studentId;

  const form = useForm<ComplaintForm>({
    defaultValues: {
      issueDate: "",
      topic: "",
      description: "",
    },
  });

  // Fetch student's complaints when needed
  useEffect(() => {
    if (showMyComplaints && studentId) {
      fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/complaints/student/${studentId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setComplaints(data);
          } else if (data && Array.isArray(data.complaints)) {
            setComplaints(data.complaints);
          } else {
            setComplaints([]);
          }
        });
    }
  }, [showMyComplaints, studentId]);

  // Reset complaints page whenever complaints list changes or dialog opens
  useEffect(() => {
    setComplaintsPage(0);
  }, [complaints.length, showMyComplaints]);

  // Submit complaint mutation
  const submitComplaintMutation = useMutation({
    mutationFn: async (data: ComplaintForm) => {
      if (!studentId) throw new Error("StudentId not set! Please login first.");
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("issueDate", data.issueDate);
      formData.append("topic", data.topic);
      formData.append("description", data.description);

      const response = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/complaints", {
        method: "POST",
        body: formData,
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to submit complaint.");
      }
      return resData;
    },
    onSuccess: (data) => {
      setSubmittedComplaintId(data.complaintId);
      toast({
        title: "Complaint submitted successfully!",
        description: `Your complaint ID is: ${data.complaintId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
      form.reset();
      if (showMyComplaints && studentId) {
        // Refresh complaints list after submit
        fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/complaints/student/${studentId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setComplaints(data);
            } else if (data && Array.isArray(data.complaints)) {
              setComplaints(data.complaints);
            } else {
              setComplaints([]);
            }
          });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting complaint",
        description: error?.message || "Something went wrong!",
        variant: "destructive",
      });
    },
  });

  const handleFeedback = (complaintId: string) => {
    fetch(`https://hostel-backend-module-production-iist.up.railway.app/api/complaints/${complaintId}/close`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: feedbackText }),
    })
      .then(res => res.json())
      .then(() => {
        setComplaints(cs => cs.filter(c => c.id !== complaintId));
        toast({ title: "Complaint closed!" });
        setFeedbackComplaintId(null);
        setFeedbackText("");
      });
  };

  const onSubmit = (data: ComplaintForm) => {
    submitComplaintMutation.mutate(data);
  };

  // Pagination logic
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  const pagedComplaints = complaints.slice(
    complaintsPage * PAGE_SIZE,
    complaintsPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <LayoutS>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Box</h1>
            <p className="text-gray-600 mt-2">Submit maintenance and facility complaints</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowMyComplaints(true)}
            className="mt-4 md:mt-0"
          >
            My Complaints
          </Button>
        </div>
        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint Topic *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Plumbing Issues">Plumbing Issues</SelectItem>
                            <SelectItem value="Electrical Problems">Electrical Problems</SelectItem>
                            <SelectItem value="Cleaning Services">Cleaning Services</SelectItem>
                            <SelectItem value="Food Quality">Food Quality</SelectItem>
                            <SelectItem value="Internet Connectivity">Internet Connectivity</SelectItem>
                            <SelectItem value="Room Maintenance">Room Maintenance</SelectItem>
                            <SelectItem value="Security Issues">Security Issues</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Complaint Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Please describe your complaint in detail..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {submittedComplaintId && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      <span className="font-medium">Generated Complaint ID: </span>
                      <span className="font-bold">{submittedComplaintId}</span>
                    </AlertDescription>
                  </Alert>
                )}
                {!studentId && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-700">
                      <span className="font-medium">You are not logged in! Please login to submit complaints.</span>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={submitComplaintMutation.isPending || !studentId}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* My Complaints Dialog */}
        <Dialog open={showMyComplaints} onOpenChange={setShowMyComplaints}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>My Complaints</DialogTitle>
              <DialogDescription>
                View your submitted complaints and their status.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                  {(!Array.isArray(complaints) || complaints.length === 0) && <p>No complaints found.</p>}
                  {Array.isArray(complaints) && pagedComplaints.map(comp => (
                    <div key={comp.id} className="p-4 border rounded mb-4">
                      <div><strong>Date:</strong> {comp.issueDate}</div>
                      <div><strong>Topic:</strong> {comp.topic}</div>
                      <div><strong>Description:</strong> {comp.description}</div>
                      <div><strong>Status:</strong> {comp.status}</div>
                      {comp.status === "Resolved" && !comp.studentClosed && (
                        <div className="mt-2">
                          <Textarea
                            rows={2}
                            placeholder="Add feedback"
                            value={feedbackComplaintId === comp.id ? feedbackText : ""}
                            onChange={e => {
                              setFeedbackComplaintId(comp.id);
                              setFeedbackText(e.target.value);
                            }}
                          />
                          <Button
                            className="mt-2"
                            onClick={() => handleFeedback(comp.id)}
                            disabled={!feedbackText.trim()}
                          >
                            Submit Feedback & Close Complaint
                          </Button>
                        </div>
                      )}
                      {comp.status === "Closed" && <div className="text-green-600">Closed</div>}
                    </div>
                  ))}

                  {/* Slider Navigation */}
                  {complaints.length > PAGE_SIZE && (
                    <div className="flex justify-center items-center gap-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setComplaintsPage((p) => Math.max(0, p - 1))}
                        disabled={complaintsPage === 0}
                      >
                        Previous
                      </Button>
                      <span>
                        Page {complaintsPage + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setComplaintsPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={complaintsPage + 1 >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMyComplaints(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutS>
  );
};

export default ComplaintBoxS;