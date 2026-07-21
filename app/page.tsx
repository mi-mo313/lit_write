"use client";

import { ReactNode } from "react";
import {
  Box,
  Button,
  Container
} from "@mui/material";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { keyframes } from "@mui/system";
import { useRouter } from "next/navigation";

const float = keyframes`
0%{
transform:translateY(0) rotate(0deg);
}
50%{
transform:translateY(-20px) rotate(8deg);
}
100%{
transform:translateY(0) rotate(0deg);
}
`;

const moveGradient = keyframes`
0%{
background-position:0% 50%;
}
50%{
background-position:100% 50%;
}
100%{
background-position:0% 50%;
}
`;

const pulse = keyframes`
0%{
transform:scale(1);
opacity:.4;
}
50%{
transform:scale(1.2);
opacity:.8;
}
100%{
transform:scale(1);
opacity:.4;
}
`;

interface FloatingIconProps {
  children: ReactNode;
  top: string;
  left: string;
  delay: string;
}

function FloatingIcon({
  children,
  top,
  left,
  delay,
}: FloatingIconProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        color: "rgba(255,255,255,.07)",
        animation: `${float} 8s ease-in-out infinite`,
        animationDelay: delay,
        "& svg": {
          fontSize: 120,
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function LandingPage() {
    const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(-45deg,#020617,#0f172a,#1e1b4b,#111827)",
        backgroundSize: "400% 400%",
        animation: `${moveGradient} 20s ease infinite`,
      }}
    >
      {/* Grid */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)
        `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow */}

      <Box
        sx={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "#6366f1",
          filter: "blur(120px)",
          top: -120,
          left: -120,
          opacity: .25,
          animation: `${pulse} 8s infinite`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "#7c3aed",
          filter: "blur(140px)",
          bottom: -120,
          right: -120,
          opacity: .2,
          animation: `${pulse} 10s infinite`,
        }}
      />

      {/* Floating Icons */}

      <FloatingIcon top="12%" left="12%" delay="0s">
        <EditIcon />
      </FloatingIcon>

      <FloatingIcon top="20%" left="80%" delay="1s">
        <AutoStoriesIcon />
      </FloatingIcon>

      <FloatingIcon top="75%" left="14%" delay="2s">
        <LocalFireDepartmentIcon />
      </FloatingIcon>

      <FloatingIcon top="72%" left="82%" delay="3s">
        <EditIcon />
      </FloatingIcon>

      {/* Hero */}

      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            border: "1px solid rgba(255,255,255,.08)",
            bgcolor: "rgba(255,255,255,.04)",
            backdropFilter: "blur(20px)",
            borderRadius: 6,
            p: {
              xs: 5,
              md: 8,
            },
          }}
        >
          <Typography
            sx={{
              color: "#8b5cf6",
              fontWeight: 700,
              letterSpacing: 3,
              mb: 2,
            }}
          >
            Collaborative Writing Platform
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: "4rem",
                md: "6rem",
              },
              color: "white",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            Lit Write
          </Typography>

          <Typography
            sx={{
              mt: 3,
              color: "rgba(255,255,255,.65)",
              fontSize: "1.2rem",
              maxWidth: 650,
              mx: "auto",
            }}
          >
            Create, compare, merge and collaborate on every version of your
            writing. Every revision tells a story.
          </Typography>

          <Button
          onClick={()=>{
           router.push("/editor")
          }}
            variant="contained"
            size="large"
            sx={{
              mt: 5,
              px: 5,
              py: 1.8,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.1rem",
              background:
                "linear-gradient(135deg,#8b5cf6,#6366f1)",
              boxShadow: "0 20px 60px rgba(99,102,241,.45)",
              transition: ".3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 30px 80px rgba(99,102,241,.6)",
              },
            }}
          >
            Start Writing
          </Button>
        </Box>
      </Container>
    </Box>
  );
}