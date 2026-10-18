import { useEffect, useState } from 'react';
import { Alert, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import { adminService } from '../services/adminService';

const roleOptions = ['job-seeker', 'employer', 'admin'];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch((error) => setErrorMessage(error?.response?.data?.message || 'Failed to load users.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRoleUpdate = async (userId, role) => {
    try {
      setNotice('');
      setErrorMessage('');
      const updated = await adminService.updateUserRole(userId, role);
      setUsers((current) => current.map((item) => (item._id === updated._id ? { ...item, role: updated.role } : item)));
      setNotice('User role updated.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Could not update user role.');
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Admin Users" subtitle="Manage user roles and platform access.">
      <Stack spacing={2}>
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <TextField
                      size="small"
                      select
                      value={user.role}
                      fullWidth
                      onChange={(event) => handleRoleUpdate(user._id, event.target.value)}
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No users found.
            </Typography>
          ) : null}
        </Paper>
      </Stack>
    </PageContainer>
  );
}

export default AdminUsersPage;
