import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { routePaths } from '../../routes/routePaths';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRole } from '../../utils/formatters';

function AppHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [jobsAnchorEl, setJobsAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const isJobsMenuOpen = Boolean(jobsAnchorEl);
  const isUserMenuOpen = Boolean(userAnchorEl);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #e8ecf3',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.85)',
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <Typography
          component={RouterLink}
          to={routePaths.home}
          variant="h6"
          sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 800 }}
        >
          React Jobs
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1} alignItems="center">
          {isAuthenticated && (
            <IconButton component={RouterLink} to={routePaths.notifications} color="inherit">
              <Badge badgeContent={unreadCount} color="error" overlap="circular">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          <Button
            endIcon={<KeyboardArrowDownRoundedIcon />}
            onClick={(event) => setJobsAnchorEl(event.currentTarget)}
          >
            Explore
          </Button>
          <Menu
            anchorEl={jobsAnchorEl}
            open={isJobsMenuOpen}
            onClose={() => setJobsAnchorEl(null)}
          >
            <MenuItem component={RouterLink} to={routePaths.jobs} onClick={() => setJobsAnchorEl(null)}>
              Browse Jobs
            </MenuItem>
            <MenuItem component={RouterLink} to={routePaths.companies} onClick={() => setJobsAnchorEl(null)}>
              Browse Companies
            </MenuItem>
            {isAuthenticated && user?.role === 'job-seeker' ? (
              <MenuItem
                component={RouterLink}
                to={routePaths.dashboard}
                onClick={() => setJobsAnchorEl(null)}
              >
                My Applications
              </MenuItem>
            ) : null}
            {isAuthenticated && (user?.role === 'employer' || user?.role === 'admin') ? (
              <MenuItem component={RouterLink} to={routePaths.manageJobs} onClick={() => setJobsAnchorEl(null)}>
                Manage Jobs
              </MenuItem>
            ) : null}
          </Menu>

          {isAuthenticated ? (
            <>
              <Button component={RouterLink} to={routePaths.dashboard} variant="text">
                Dashboard
              </Button>
              {(user?.role === 'employer' || user?.role === 'admin') ? (
                <Button component={RouterLink} to={routePaths.manageJobs} variant="text">
                  Manage Jobs
                </Button>
              ) : null}
              {user?.role === 'admin' ? (
                <Button component={RouterLink} to={routePaths.adminUsers} variant="text">
                  Admin
                </Button>
              ) : null}
              <Button component={RouterLink} to={routePaths.profile} variant="outlined">
                Profile
              </Button>
              <IconButton onClick={(event) => setUserAnchorEl(event.currentTarget)}>
                <Avatar src={user?.profile?.avatarUrl} sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
                  {user?.profile?.avatarUrl ? '' : (user?.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userAnchorEl}
                open={isUserMenuOpen}
                onClose={() => setUserAnchorEl(null)}
              >
                <MenuItem disabled>
                  <Stack spacing={0.2}>
                    <Typography variant="body2">{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatRole(user?.role)}
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to={routePaths.profile}
                  onClick={() => setUserAnchorEl(null)}
                >
                  Account settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setUserAnchorEl(null);
                    logout();
                    navigate(routePaths.home);
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={RouterLink} to={routePaths.login}>
                Login
              </Button>
              <Button component={RouterLink} to={routePaths.register} variant="contained">
                Sign up
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
