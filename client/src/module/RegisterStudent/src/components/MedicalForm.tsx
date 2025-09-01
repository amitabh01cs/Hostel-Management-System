
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
import { useToast } from '@/hooks/use-toast';

const medicalFormSchema = z.object({
  bloodGroup: z.string().min(1, { message: 'Blood group is required' }),
  seriousDisease: z.object({
    status: z.enum(['yes', 'no']),
    details: z.string().optional(),
  }),
  regularMedication: z.object({
    status: z.enum(['yes', 'no']),
    details: z.string().optional(),
  }),
  hospitalAdmission: z.object({
    status: z.enum(['yes', 'no']),
    details: z.string().optional(),
  }),
  emergencyMedicines: z.string().optional(),
  allergies: z.string().optional(),
});

type MedicalFormValues = z.infer<typeof medicalFormSchema>;

interface MedicalFormProps {
  onSubmit: (data: MedicalFormValues) => void;
  onPrevious: () => void;
  initialData?: MedicalFormValues;
}

const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Known'
];

const MedicalForm: React.FC<MedicalFormProps> = ({ onSubmit, onPrevious, initialData }) => {
  const { toast } = useToast();
  
  const form = useForm<MedicalFormValues>({
    resolver: zodResolver(medicalFormSchema),
    defaultValues: initialData || {
      bloodGroup: '',
      seriousDisease: { status: 'no', details: '' },
      regularMedication: { status: 'no', details: '' },
      hospitalAdmission: { status: 'no', details: '' },
      emergencyMedicines: '',
      allergies: '',
    },
  });

  const handleSubmit = (values: MedicalFormValues) => {
    toast({
      title: "Registration Successfully Submitted!",
      description: "Your hostel registration has been completed.",
    });
    onSubmit(values);
  };
  
  const watchSeriousDiseaseStatus = form.watch('seriousDisease.status');
  const watchRegularMedicationStatus = form.watch('regularMedication.status');
  const watchHospitalAdmissionStatus = form.watch('hospitalAdmission.status');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Medical Details</h2>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="seriousDisease.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you suffering from any serious disease?</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchSeriousDiseaseStatus === 'yes' && (
                <FormField
                  control={form.control}
                  name="seriousDisease.details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about your disease"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="regularMedication.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you in regular medication?</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchRegularMedicationStatus === 'yes' && (
                <FormField
                  control={form.control}
                  name="regularMedication.details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about your medication"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hospitalAdmission.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record of hospital admission?</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchHospitalAdmissionStatus === 'yes' && (
                <FormField
                  control={form.control}
                  name="hospitalAdmission.details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about your hospital admission"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="emergencyMedicines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of the prescribed emergency medicines (if any)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List emergency medicines if applicable"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergic to</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List any allergies you have"
                      {...field} 
                    />
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
            Submit Registration  
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MedicalForm;
