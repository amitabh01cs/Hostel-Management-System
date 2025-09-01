import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PhotoCapture from './PhotoCapture';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FancyCalendar } from '../components/ui/FancyCalendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// --- Institute/Course/Branch Mapping ---
const instituteOptions = {
  IIST: {
    courses: [
      "B.Tech",
      "M.Tech"
    ],
    branches: [
      "Computer Science and Engineering (CSE)",
      "Information Technology (IT)",
      "Electronics and Communication Engineering (ECE)",
      "Mechanical Engineering (ME)",
      "Civil Engineering (CE)",
      "Chemical Engineering",
      "Artificial Intelligence & Machine Learning (AIML)",
      "Robotics & Artificial Intelligence (RAI)",
      "Civil Engineering with Computer Application (CECA)",
      "Electronics and Computer Science (ECS)",
      "Computer Science and Engineering - Data Science (CSE-DS)"
    ]
  },
  IIP: {
    courses: [
      "D. Pharm.",
      "B. Pharm.",
      "M. Pharm.",
      "Pharm D"
    ],
    branches: [
      "Pharmaceutics",
      "Pharmaceutical Quality Assurance"
    ]
  },
  IIMR: {
    courses: [
      "MBA",
      "BBA",
      "BBA (Foreign Trade)"
    ],
    branches: [], // Now blank, so we show Input field for IIMR
  }
};

// Zod schema for boarder form
const boarderFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  gender: z.string().min(1, { message: 'Gender is required' }),
  religion: z.string().min(1, { message: 'Religion is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  nationality: z.string().min(1, { message: 'Nationality is required' }),
  otherCountry: z.string().optional(),
  mobileNo: z.string()
    .min(10, { message: 'Mobile number must be at least 10 digits' })
    .max(15, { message: 'Mobile number must not exceed 15 digits' }),
  email: z.string().email({ message: 'Invalid email address' }),
  aadharNo: z.string()
    .min(12, { message: 'Aadhar number must be 12 digits' })
    .max(12, { message: 'Aadhar number must be 12 digits' }),
  studentPassword: z.string().min(1, { message: 'Password required ' }),
  courseDetails: z.string().min(1, { message: 'Course details are required' }),
  instituteName: z.string().min(1, { message: 'Institute name is required' }),
  course: z.string().min(1, { message: 'Course is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  yearOfStudy: z.string().min(1, { message: 'Year of study is required' }),
  semester: z.string().min(1, { message: 'Semester is required' }),
  admissionDate: z.date({ required_error: 'Date of admission is required' }),
  hostelJoiningDate: z.date({ required_error: 'Hostel joining date is required' }),
});

export type BoarderFormValues = z.infer<typeof boarderFormSchema>;

interface BoarderFormProps {
  onNext: (data: BoarderFormValues & { photo: File | string | null }) => void;
  initialData?: BoarderFormValues & { photo: File | string | null };
}

const BoarderForm: React.FC<BoarderFormProps> = ({ onNext, initialData }) => {
  const [photo, setPhoto] = React.useState<File | string | null>(initialData?.photo || null);

  const form = useForm<BoarderFormValues>({
    resolver: zodResolver(boarderFormSchema),
    defaultValues: initialData || {
      fullName: '',
      gender: '',
      religion: '',
      category: '',
      nationality: 'Indian',
      otherCountry: '',
      mobileNo: '',
      email: '',
      aadharNo: '',
      studentPassword: '',
      courseDetails: '',
      instituteName: '',
      course: '',
      branch: '',
      yearOfStudy: '',
      semester: '',
    },
  });

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = (values: BoarderFormValues) => {
    onNext({ ...values, photo });
  };

  const nationality = form.watch('nationality');
  const dateOfBirth = form.watch('dateOfBirth');
  const instituteName = form.watch('instituteName');
  const course = form.watch('course');
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  // Dynamic course/branch options
  const courseOptions = instituteName
    ? instituteOptions[instituteName]?.courses || []
    : [];
  const branchOptions = instituteName
    ? instituteOptions[instituteName]?.branches || []
    : [];

  // Reset course/branch if institute changes
  React.useEffect(() => {
    form.setValue('course', '');
    form.setValue('branch', '');
  }, [instituteName]); // eslint-disable-line

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:w-1/3">
              <PhotoCapture onPhotoCapture={setPhoto} photo={photo} />
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick date of birth</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <FancyCalendar
                        mode="date"
                        value={field.value}
                        onChange={field.onChange}
                        maxDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {age !== null && (
                    <div className="text-sm text-gray-500 mt-1">
                      Age: {age} years
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your religion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {nationality === "Other" && (
              <FormField
                control={form.control}
                name="otherCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="mobileNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile No.</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aadharNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Card No.</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your 12-digit Aadhar number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Set Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course/Semester</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., B.Tech, 3rd Semester" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instituteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of Institute</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Institute" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="IIST">IIST</SelectItem>
                    <SelectItem value="IIP">IIP</SelectItem>
                    <SelectItem value="IIMR">IIMR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Course Dropdown */}
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseOptions.map((c) => (
                      <SelectItem value={c} key={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Branch Dropdown or Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  {/* If IIMR, show Input, else show dropdown as before */}
                  {instituteName === "IIMR" ? (
                    <Input
                      placeholder="Enter branch"
                      {...field}
                    />
                  ) : branchOptions.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branchOptions.map((b) => (
                          <SelectItem value={b} key={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="No branch"
                      value="NA"
                      readOnly
                      disabled
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="I">I (First Year)</SelectItem>
                      <SelectItem value="II">II (Second Year)</SelectItem>
                      <SelectItem value="III">III (Third Year)</SelectItem>
                      <SelectItem value="IV">IV (Fourth Year)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1st</SelectItem>
                    <SelectItem value="2">2nd</SelectItem>
                    <SelectItem value="3">3rd</SelectItem>
                    <SelectItem value="4">4th</SelectItem>
                    <SelectItem value="5">5th</SelectItem>
                    <SelectItem value="6">6th</SelectItem>
                    <SelectItem value="7">7th</SelectItem>
                    <SelectItem value="8">8th</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Admission (Institute)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick admission date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <FancyCalendar
                      mode="date"
                      value={field.value}
                      onChange={field.onChange}
                      maxDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hostelJoiningDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hostel Joining Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick hostel joining date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <FancyCalendar
                      mode="date"
                      value={field.value}
                      onChange={field.onChange}
                      maxDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-yojana-purple hover:bg-yojana-purple-dark">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BoarderForm;