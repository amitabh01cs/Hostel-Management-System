import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
import { gatePassSchema } from "../../../shared/schema";
import { useGatePass } from "../hooks/useGatePass";
import GatePassHeader from "../components/GatePassHeader";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import LayoutS from "../../../../HostelStudentPortal/client/src/components/LayoutS";

export default function GatePassForm() {
  const { toast } = useToast();
  const [passType, setPassType] = useState("HOUR");
  const { serialNumber, currentDate } = useGatePass();

  // Get studentId from localStorage
  const [studentUser, setStudentUser] = useState(null);

  // Student details from DB
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("studentUser");
    if (user) setStudentUser(JSON.parse(user));
  }, []);

  // Fetch student details from backend using studentId ONLY
  useEffect(() => {
    if (studentUser?.studentId) {
      fetch(
        `https://hostel-backend-module-production-iist.up.railway.app/api/student/details?studentId=${studentUser.studentId}`
      )
        .then((res) => res.json())
        .then((data) => {
          setStudentDetails(data);
          // Pre-fill the form when details arrive
          form.reset({
            name: data.name || "",
            roomNo: data.room || "",
            branch: data.branch || "",
            year: data.year || "",
            from: "",
            to: "",
            fromTime: "",
            toTime: "",
            address: "Indore",
            contactNumber: data.mobile || "",
            purpose: "",
            localGuardian: data.localGuardian || "",
            localGuardianAddress: data.localGuardianAddress || "",
          });
        });
    }
    // eslint-disable-next-line
  }, [studentUser?.studentId]);

  const form = useForm({
    resolver: zodResolver(gatePassSchema),
    defaultValues: {
      name: "",
      roomNo: "",
      branch: "",
      year: "",
      from: "",
      to: "",
      fromTime: "",
      toTime: "",
      address: "Indore",
      contactNumber: "",
      purpose: "",
      localGuardian: "",
      localGuardianAddress: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      if (!studentUser?.studentId) {
        throw new Error("StudentId not set! Please login first.");
      }
      // Prepare request body for backend compatibility
      let reqBody = {
        ...data,
        placeToVisit: data.address,
        passType,
        serialNumber,
        date: currentDate,
        studentId: Number(studentUser.studentId),
      };

      // For DAYS, merge date + time fields
      if (passType === "DAYS" && data.from && data.fromTime) {
        reqBody.from = `${data.from} ${data.fromTime}`;
      }
      if (passType === "DAYS" && data.to && data.toTime) {
        reqBody.to = `${data.to} ${data.toTime}`;
      }

      return await apiRequest("POST", "https://hostel-backend-module-production-iist.up.railway.app/api/gate-pass/request", reqBody);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gate pass request submitted successfully!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit gate pass request.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    submitMutation.mutate(data);
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this gate pass request?"
      )
    ) {
      form.reset();
      setPassType("HOUR");
    }
  };

  return (
    <LayoutS>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-center text-gray-800">
                Gate pass / Leave Permit
              </h1>
              <p className="text-center text-gray-600 text-sm">
                Generate gate pass digitally
              </p>
            </div>
            <GatePassHeader />
            <CardContent className="px-6 py-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Serial Number and Date Row */}
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <div>
                      <span className="text-gray-700 text-sm font-medium mr-2">
                        Sr. no.:
                      </span>
                      <span className="text-gray-700">{serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-700 text-sm font-medium mr-2">
                        Date:
                      </span>
                      <span className="text-gray-700">{currentDate}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 -mt-3 mb-3">
                    Sr no and dates will be automatically fetched
                  </p>

                  {/* Name Field (disabled) */}
                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Room, Branch and Year Row (all disabled) */}
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                      <FormField
                        control={form.control}
                        name="roomNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room no.</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                      <FormField
                        control={form.control}
                        name="branch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-1/3 px-3">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <Input value={field.value || ""} disabled />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Pass Type Selection */}
                  <div className="mb-4">
                    <FormLabel>Pass-Type</FormLabel>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => setPassType("HOUR")}
                        variant={passType === "HOUR" ? "default" : "outline"}
                        className={passType === "HOUR" ? "bg-primary text-white" : ""}
                      >
                        HOUR
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setPassType("DAYS")}
                        variant={passType === "DAYS" ? "default" : "outline"}
                        className={passType === "DAYS" ? "bg-primary text-white" : ""}
                      >
                        DAYS
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <ul className="list-disc pl-5">
                        {passType === "HOUR" ? (
                          <li>
                            <span className="font-medium">HOUR:</span> day pass for one
                            day, user will enter{" "}
                            <span className="font-medium">time</span> in 'from' and 'to'
                          </li>
                        ) : (
                          <li>
                            <span className="font-medium">DAYS:</span> home visit/long
                            term pass, user will enter{" "}
                            <span className="font-medium">date + time</span> in 'from' and 'to'
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* From and To Row */}
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                      <FormField
                        control={form.control}
                        name="from"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>From</FormLabel>
                            {passType === "HOUR" ? (
                              <FormControl>
                                <Input
                                  placeholder="Time HH:MM"
                                  {...field}
                                  type="time"
                                />
                              </FormControl>
                            ) : (
                              <>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className="w-full pl-3 text-left font-normal flex justify-between items-center"
                                      >
                                        {field.value ? (
                                          format(new Date(field.value), "dd-MM-yyyy")
                                        ) : (
                                          <span className="text-gray-500">Pick a date</span>
                                        )}
                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) =>
                                        field.onChange(
                                          date ? format(date, "yyyy-MM-dd") : ""
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {/* Time input for DAYS */}
                                <FormField
                                  control={form.control}
                                  name="fromTime"
                                  render={({ field: timeField }) => (
                                    <FormItem className="mt-2">
                                      <FormLabel>Time</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Time HH:MM"
                                          {...timeField}
                                          type="time"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                      <FormField
                        control={form.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>To</FormLabel>
                            {passType === "HOUR" ? (
                              <FormControl>
                                <Input
                                  placeholder="Time HH:MM"
                                  {...field}
                                  type="time"
                                />
                              </FormControl>
                            ) : (
                              <>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className="w-full pl-3 text-left font-normal flex justify-between items-center"
                                      >
                                        {field.value ? (
                                          format(new Date(field.value), "dd-MM-yyyy")
                                        ) : (
                                          <span className="text-gray-500">Pick a date</span>
                                        )}
                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) =>
                                        field.onChange(
                                          date ? format(date, "yyyy-MM-dd") : ""
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {/* Time input for DAYS */}
                                <FormField
                                  control={form.control}
                                  name="toTime"
                                  render={({ field: timeField }) => (
                                    <FormItem className="mt-2">
                                      <FormLabel>Time</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Time HH:MM"
                                          {...timeField}
                                          type="time"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address during leave period</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact and Purpose Row */}
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10-digit number"
                                type="tel"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                {...field}
                                disabled
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Reason for leave" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Guardian Information Row */}
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                      <FormField
                        control={form.control}
                        name="localGuardian"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Local Guardian{" "}
                              <span className="text-gray-500 text-xs"></span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                      <FormField
                        control={form.control}
                        name="localGuardianAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Local Guardian Address{" "}
                              <span className="text-gray-500 text-xs"></span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500 mt-1">
                              local guardian details will be optional
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap -mx-3">
                    <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                      <Button
                        type="button"
                        onClick={handleCancel}
                        variant="outline"
                        className="w-full border border-red-500 text-red-500 hover:bg-red-50"
                      >
                        cancel
                      </Button>
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                      <Button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={submitMutation.isPending || !studentUser}
                      >
                        {submitMutation.isPending
                          ? "Submitting..."
                          : "Request Pass Approval"}
                      </Button>
                    </div>
                  </div>

                  {/* Not logged in Alert */}
                  {!studentUser && (
                    <div className="mt-4 text-red-600">
                      You are not logged in! Please login to submit gate pass
                      requests.
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-4">
                    After request, data goes into the admin leave request page
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutS>
  );
}