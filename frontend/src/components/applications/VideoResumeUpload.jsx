import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Progress,
  Icon,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiUploadCloud, FiVideo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import VideoService from '../../services/videoService';

const VideoResumeUpload = ({ applicationId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_VIDEO_DURATION = 120; // 2 minutes in seconds

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, MOV)');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      setError(`Video size exceeds ${MAX_VIDEO_SIZE / (1024 * 1024)}MB limit`);
      return;
    }
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(previewUrl);
    setError(null);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError('Please select a video file first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response = await VideoService.uploadVideoResume(videoFile, applicationId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Video resume uploaded successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
        
        // Reset form
        setVideoFile(null);
        setVideoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.message || 'Failed to upload video resume');
      }
    } catch (err) {
      setError(err.message || 'Error uploading video resume');
      toast({
        title: 'Error',
        description: err.message || 'Failed to upload video resume',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={6}
      backgroundColor="white"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Video Resume (Optional)
        </Text>
        
        <Text fontSize="sm" color="gray.600">
          Upload a short video (max 2 minutes) to introduce yourself to employers.
          This can significantly increase your chances of getting noticed!
        </Text>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {!videoPreview ? (
          <VStack spacing={4} align="center" justify="center">
            <Box
              borderWidth="2px"
              borderStyle="dashed"
              borderColor="gray.300"
              borderRadius="lg"
              padding={8}
              width="100%"
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500', backgroundColor: 'gray.50' }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/mp4,video/mov,video/quicktime"
                style={{ display: 'none' }}
              />
              <Icon as={FiUploadCloud} boxSize={10} color="gray.400" />
              <Text fontSize="md" color="gray.600" mt={2}>
                Click to upload or drag and drop
              </Text>
              <Text fontSize="sm" color="gray.500">
                MP4 or MOV (Max {MAX_VIDEO_SIZE / (1024 * 1024)}MB, {MAX_VIDEO_DURATION} seconds)
              </Text>
            </Box>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            <Box position="relative">
              <video
                src={videoPreview}
                controls
                style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
              />
              <Button
                position="absolute"
                top="8px"
                right="8px"
                size="sm"
                colorScheme="red"
                onClick={handleRemoveVideo}
              >
                Remove
              </Button>
            </Box>
            
            <HStack justifyContent="space-between">
              <Text fontSize="sm">
                {videoFile.name} ({Math.round(videoFile.size / 1024 / 1024)}MB)
              </Text>
              <Button
                leftIcon={<FiCheckCircle />}
                colorScheme="blue"
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText="Uploading..."
              >
                Upload Video Resume
              </Button>
            </HStack>
            
            {isUploading && (
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="blue"
                borderRadius="md"
              />
            )}
          </VStack>
        )}
        
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text fontSize="sm">
              <strong>Tips for a great video resume:</strong>
            </Text>
            <Text fontSize="sm" mt={1}>
              • Keep it professional and concise (30-60 seconds is ideal)
            </Text>
            <Text fontSize="sm">
              • Introduce yourself and highlight your key skills
            </Text>
            <Text fontSize="sm">
              • Dress professionally and ensure good lighting
            </Text>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default VideoResumeUpload;