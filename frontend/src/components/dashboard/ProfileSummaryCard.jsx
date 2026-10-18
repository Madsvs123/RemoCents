import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

function ProfileSummaryCard({ user }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={0.7} direction="row" alignItems="center">
          <Avatar src={user?.profile?.avatarUrl} sx={{ width: 46, height: 46 }}>
            {user?.profile?.avatarUrl ? '' : (user?.name || 'U').charAt(0)}
          </Avatar>
          <Stack spacing={0.7}>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
            <Typography color="text.secondary">Role: {user?.role}</Typography>
            <Typography color="text.secondary">Saved jobs: {user?.savedJobs?.length || 0}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileSummaryCard;
