import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Badge,
  Text,
  VStack,
  HStack,
  Divider,
  IconButton,
  useDisclosure
} from '@chakra-ui/react';
import { BellIcon, CheckIcon } from '@chakra-ui/icons';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const popoverRef = useRef();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <IconButton
          icon={<BellIcon />}
          aria-label="Notifications"
          variant="ghost"
          position="relative"
        >
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="0"
              right="0"
              colorScheme="red"
              borderRadius="full"
              fontSize="0.6em"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </IconButton>
      </PopoverTrigger>
      
      <PopoverContent ref={popoverRef} width="350px" maxWidth="100vw">
        <PopoverArrow />
        <PopoverBody padding={0}>
          <Box>
            <HStack justifyContent="space-between" padding={3} borderBottomWidth="1px">
              <Text fontWeight="bold" fontSize="lg">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleMarkAllRead}
                  isLoading={isLoading}
                >
                  Mark all as read
                </Button>
              )}
            </HStack>
            
            <VStack
              spacing={0}
              align="stretch"
              maxHeight="400px"
              overflowY="auto"
            >
              {notifications.length === 0 ? (
                <Box padding={4} textAlign="center">
                  <Text color="gray.500">No notifications yet</Text>
                </Box>
              ) : (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    padding={3}
                    borderBottomWidth="1px"
                    backgroundColor={!notification.is_read ? 'gray.50' : 'white'}
                    _hover={{ backgroundColor: 'gray.100' }}
                    onClick={() => handleMarkRead(notification.id)}
                    cursor="pointer"
                  >
                    <HStack align="start" spacing={3}>
                      {!notification.is_read && (
                        <Box
                          width="8px"
                          height="8px"
                          borderRadius="full"
                          backgroundColor="blue.500"
                          marginTop="4px"
                        />
                      )}
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" fontSize="sm">
                          {notification.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {notification.message}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Text>
                      </VStack>
                      {notification.is_read && (
                        <CheckIcon color="green.500" />
                      )}
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
            
            <Box padding={2} textAlign="center">
              <Button
                size="sm"
                variant="link"
                colorScheme="blue"
                onClick={() => {
                  onClose();
                  // Navigate to notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </Box>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;