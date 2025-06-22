"use client"

import type React from "react"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

interface Job {
  id: number
  title: string
  company: string
  location: string
  description: string
}

interface JobsCarouselProps {
  jobs: Job[]
}

const JobsCarousel: React.FC<JobsCarouselProps> = ({ jobs }) => {
  const theme = useTheme()

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Featured Jobs</Typography>
        <Box>
          <IconButton
            aria-label="previous"
            size="small"
            sx={{
              mr: 1,
              backgroundColor: theme.palette.background.paper,
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            aria-label="next"
            size="small"
            sx={{
              backgroundColor: theme.palette.background.paper,
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        modules={[Navigation]}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        breakpoints={{
          600: {
            slidesPerView: 2,
          },
          960: {
            slidesPerView: 3,
          },
        }}
      >
        {jobs.map((job) => (
          <SwiperSlide key={job.id}>
            <Box p={3} bgcolor={theme.palette.background.paper} borderRadius={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {job.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {job.company}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {job.location}
              </Typography>
              <Typography variant="body1" mt={1}>
                {job.description}
              </Typography>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}

export default JobsCarousel
