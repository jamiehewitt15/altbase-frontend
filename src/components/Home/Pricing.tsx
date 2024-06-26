import React from 'react'
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import Check from '@mui/icons-material/Check'

const features = [
  'Feature 1',
  'Feature 2',
  'Feature 3',
  'Feature 4'
  // Add more features as needed
]

const tiers = [
  { title: 'Open Source', description: 'Free plan with basic features.' },
  { title: 'Premium', description: 'Advanced features for your needs.' }
]

export default function Pricing() {
  return (
    <>
      <Typography variant="h1" align="center">
        Features & Pricing
      </Typography>
      <br />
      <Grid container spacing={2}>
        {tiers.map((tier) => (
          <Grid item xs={12} sm={6} key={tier.title}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h2" component="h3">
                {tier.title}
              </Typography>
              <Typography variant="body1">{tier.description}</Typography>
              <List>
                {features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Check />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
