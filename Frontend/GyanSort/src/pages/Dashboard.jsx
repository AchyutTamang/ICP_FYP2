import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    freeCourses: 0,
    paidCourses: 0,
    totalCategories: 0,
    categoryStats: [],
    monthlyStats: [],
    pricingStats: { free: 0, paid: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/courses/dashboard-stats/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        setStats({
          totalCourses: response.data.total_courses,
          freeCourses: response.data.free_courses,
          paidCourses: response.data.paid_courses,
          totalCategories: response.data.category_stats.length,
          categoryStats: response.data.category_stats,
          monthlyStats: response.data.monthly_stats,
          pricingStats: {
            free: response.data.free_courses,
            paid: response.data.paid_courses,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Chart data and options
  const categoryChartData = {
    labels: stats.categoryStats.map((item) => item.name),
    datasets: [
      {
        data: stats.categoryStats.map((item) => item.course_count),
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
          "#5a5c69",
          "#858796",
          "#6610f2",
          "#fd7e14",
          "#20c9a6",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pricingChartData = {
    labels: ["Free", "Paid"],
    datasets: [
      {
        data: [stats.pricingStats.free, stats.pricingStats.paid],
        backgroundColor: ["#1cc88a", "#4e73df"],
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: stats.monthlyStats.map((item) => {
      const date = new Date(item.month);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Courses Created",
        data: stats.monthlyStats.map((item) => item.count),
        backgroundColor: "#4e73df",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Courses
              </Typography>
              <Typography variant="h3">{stats.totalCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Free Courses
              </Typography>
              <Typography variant="h3">{stats.freeCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid Courses
              </Typography>
              <Typography variant="h3">{stats.paidCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h3">{stats.totalCategories}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography variant="h6" gutterBottom>
              Courses by Category
            </Typography>
            {stats.categoryStats.length > 0 && (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie data={categoryChartData} options={chartOptions} />
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography variant="h6" gutterBottom>
              Free vs Paid Courses
            </Typography>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Doughnut data={pricingChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 300 }}
          >
            <Typography variant="h6" gutterBottom>
              Courses Created per Month
            </Typography>
            {stats.monthlyStats.length > 0 && (
              <Box sx={{ height: "100%" }}>
                <Bar data={monthlyChartData} options={barChartOptions} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
