import { Box, Typography, Grid, Paper } from "@mui/material"

const EnhancedDashboardOverview = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Enhanced Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Total Jobs</Typography>
            <Typography variant="subtitle1">150</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Active Jobs</Typography>
            <Typography variant="subtitle1">75</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Completed Jobs</Typography>
            <Typography variant="subtitle1">75</Typography>
          </Paper>
        </Grid>

        {/* Your Jobs Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Jobs
            </Typography>
            {/* Job List (Example) */}
            <Box>
              <Typography variant="body1">Job 1: Plumber Needed</Typography>
              <Typography variant="body1">Job 2: Electrician Required</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Activity List (Example) */}
            <Box>
              <Typography variant="body1">Job 1 updated status</Typography>
              <Typography variant="body1">New application for Job 2</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EnhancedDashboardOverview
