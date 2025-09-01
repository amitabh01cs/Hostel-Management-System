import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: File | null) => void; // **CHANGED: File, not string**
  photo: File | string | null;                      // **CHANGED: also accept File**
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, photo }) => {
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // Convert base64 string to File object
  function base64toFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const file = base64toFile(imageSrc, "webcam_photo.jpg");
        onPhotoCapture(file);
        setShowCamera(false);
        toast({
          title: "Photo captured",
          description: "Your photo has been captured successfully.",
        });
      }
    }
  }, [webcamRef, onPhotoCapture, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type.match('image.*')) {
      onPhotoCapture(file); // Only File object
      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const clearPhoto = () => {
    onPhotoCapture(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({
      title: "Photo removed",
      description: "Your photo has been removed.",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // For preview
  let imgSrc: string | undefined;
  if (photo instanceof File) {
    imgSrc = URL.createObjectURL(photo);
  } else if (typeof photo === "string") {
    imgSrc = photo;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
      <div className="flex flex-col items-center">
        {imgSrc ? (
          <div className="relative w-32 h-32 mb-4">
            <img
              src={imgSrc}
              alt="Captured"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              onClick={clearPhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              title="Remove photo"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : showCamera ? (
          <div className="w-full max-w-md bg-black rounded-lg overflow-hidden mb-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 justify-center">
          {!showCamera && !imgSrc && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(true)}
                className="flex items-center"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="flex items-center"
              >
                <Image className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}

          {showCamera && !imgSrc && (
            <>
              <Button
                type="button"
                onClick={capture}
                className="bg-yojana-purple hover:bg-yojana-purple-dark"
              >
                Capture
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                Cancel
              </Button>
            </>
          )}

          {imgSrc && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearPhoto();
                  setShowCamera(true);
                }}
                className="flex items-center"
              >
                <Camera className="mr-2 h-4 w-4" />
                Retake Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="flex items-center"
              >
                <Image className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;