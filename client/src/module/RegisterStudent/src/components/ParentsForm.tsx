
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const parentsFormSchema = z.object({
  fatherName: z.string().min(1, { message: 'Father\'s name is required' }),
  fatherOccupation: z.string().min(1, { message: 'Father\'s occupation is required' }),
  fatherEducation: z.string().min(1, { message: 'Father\'s education is required' }),
  fatherEmail: z.string().email({ message: 'Invalid email address' }).or(z.string().length(0)),
  fatherMobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }).max(15, { message: 'Mobile number must not exceed 15 digits' }),
  
  motherName: z.string().min(1, { message: 'Mother\'s name is required' }),
  motherOccupation: z.string().min(1, { message: 'Mother\'s occupation is required' }),
  motherEducation: z.string().min(1, { message: 'Mother\'s education is required' }),
  motherEmail: z.string().email({ message: 'Invalid email address' }).or(z.string().length(0)),
  motherMobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }).max(15, { message: 'Mobile number must not exceed 15 digits' }),
  
  permanentAddress: z.string().min(1, { message: 'Permanent address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  pinCode: z.string().min(6, { message: 'Pin code must be at least 6 digits' }).max(6, { message: 'Pin code must not exceed 6 digits' }),
  
  residencePhone: z.string().optional(),
  officePhone: z.string().optional(),
  officeAddress: z.string().min(1, { message: 'Office address is required' }),
  
  guardianName: z.string().min(1, { message: 'Guardian\'s name is required' }),
  guardianAddress: z.string().min(1, { message: 'Guardian\'s address is required' }),
  guardianPhone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }).max(15, { message: 'Phone number must not exceed 15 digits' }),
  guardianMobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }).max(15, { message: 'Mobile number must not exceed 15 digits' }),
  
  emergencyContact: z.string().min(1, { message: 'Emergency contact is required' }),
});

type ParentsFormValues = z.infer<typeof parentsFormSchema>;

interface ParentsFormProps {
  onNext: (data: ParentsFormValues) => void;
  onPrevious: () => void;
  initialData?: ParentsFormValues;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep"
];

const ParentsForm: React.FC<ParentsFormProps> = ({ onNext, onPrevious, initialData }) => {
  const form = useForm<ParentsFormValues>({
    resolver: zodResolver(parentsFormSchema),
    defaultValues: initialData || {
      fatherName: '',
      fatherOccupation: '',
      fatherEducation: '',
      fatherEmail: '',
      fatherMobile: '',
      motherName: '',
      motherOccupation: '',
      motherEducation: '',
      motherEmail: '',
      motherMobile: '',
      permanentAddress: '',
      city: '',
      state: '',
      pinCode: '',
      residencePhone: '',
      officePhone: '',
      officeAddress: '',
      guardianName: '',
      guardianAddress: '',
      guardianPhone: '',
      guardianMobile: '',
      emergencyContact: '',
    },
  });

  const handleSubmit = (values: ParentsFormValues) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Parents Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Father</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fatherOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fatherEducation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's highest education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fatherEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fatherMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile No.</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Mother</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motherOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motherEducation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's highest education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motherEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motherMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile No.</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-700 mb-3">Permanent Address</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full permanent address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / District</FormLabel>
                    <FormControl>
                      <Input placeholder="City or district" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pin Code</FormLabel>
                    <FormControl>
                      <Input placeholder="6-digit pin code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField
              control={form.control}
              name="residencePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Residence)</FormLabel>
                  <FormControl>
                    <Input placeholder="Landline with STD code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="officePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Office)</FormLabel>
                  <FormControl>
                    <Input placeholder="Office phone with STD code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="officeAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Office address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Local Guardian's Name & Address</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Guardian's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guardianAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Guardian's full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Guardian's Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Landline with STD code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guardianMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile No.</FormLabel>
                    <FormControl>
                      <Input placeholder="Guardian's mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact name & No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Name and number for emergency contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            className="bg-yojana-purple hover:bg-yojana-purple-dark"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ParentsForm;
