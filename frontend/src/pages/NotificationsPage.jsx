import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Divider,
  IconButton,
  useToast,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import PageContainer from '../components/common/PageContainer';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [fetchNotifications, toast]);

  const handleMarkRead = async (notification) => {
    try {
      await markAsRead(notification.id);
      toast({
        title: 'Success',
        description: 'Notification marked as read',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(selectedNotification?.id === notification.id ? null : notification);
    if (!notification.is_read) {
      handleMarkRead(notification);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <VStack spacing={4} align="center" justify="center" minHeight="300px">
          <Spinner size="xl" />
          <Text>Loading notifications...</Text>
        </VStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading as="h1" size="xl">
            Notifications
          </Heading>
          {unreadCount > 0 && (
            <Button
              colorScheme="blue"
              leftIcon={<CheckIcon />}
              onClick={handleMarkAllRead}
              isLoading={isLoading}
            >
              Mark all as read
            </Button>
          )}
        </HStack>

        {notifications.length === 0 ? (
          <VStack spacing={4} align="center" justify="center" minHeight="300px">
            <Text fontSize="lg" color="gray.500">
              No notifications yet
            </Text>
            <Text color="gray.400">
              You'll see job updates, interview requests, and other important messages here.
            </Text>
          </VStack>
        ) : (
          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </Text>

            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={4}
                  bg={selectedNotification?.id === notification.id ? 'gray.50' : 'white'}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <HStack align="start" spacing={3}>
                    {!notification.is_read && (
                      <Box
                        w="2"
                        h="2"
                        bg="blue.500"
                        borderRadius="full"
                        mt={1}
                      />
                    )}
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack justifyContent="space-between" width="100%">
                        <Text fontWeight="bold" fontSize="md">
                          {notification.title}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Text>
                      </HStack>
                      <Text color="gray.600">
                        {notification.message}
                      </Text>
                      {selectedNotification?.id === notification.id && notification.data && (
                        <Box
                          p={3}
                          bg="gray.100"
                          borderRadius="md"
                          width="100%"
                          mt={2}
                        >
                          <Text fontSize="sm" color="gray.700">
                            {JSON.stringify(JSON.parse(notification.data), null, 2)}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                    {notification.is_read ? (
                      <CheckIcon color="green.500" />
                    ) : (
                      <IconButton
                        icon={<CheckIcon />}
                        aria-label="Mark as read"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notification);
                        }}
                      />
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </PageContainer>
  );
};

export default NotificationsPage;