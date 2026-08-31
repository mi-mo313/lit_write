"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import Editor from "@/components/Editor";
import { useParams } from "next/navigation";
import apiFetcher from "@/helper/apiFetcher";
import { useAuth } from "@/context/auth";

export interface ProjectCommit {
  id: string;
  projectId: string;
  ownerId: string;
  chapter: string;
  text: string;
  message: string;
  hash: string;
  createdAt: string;
}
export default function EditorPage() {
  const [content, setContent] = useState("");
  const [commitName, setCommitName] = useState("");
  const { id } = useParams<{ id: string }>();
const {accessToken} = useAuth();
  async function handleSave() {
    try {
      const response = await apiFetcher<ProjectCommit>(`/commits/${id}`, {
        method: "POST",
        token: accessToken,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: {
            content,
          },
          commitMessage: commitName,
        }),
      });
if (response.status === 201) {
        alert("Commit saved successfully!");}
        setCommitName("");
        setContent("");
    } catch (error) { 
      alert("Failed to save commit.");    
      alert(error
      );    
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020617,#0f172a,#1e1b4b)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: 5,
            bgcolor: "rgba(255,255,255,.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 5,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 800,
              mb: 1,
            }}
          >
            Lit Write
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,.65)",
              mb: 4,
            }}
          >
            Write your next revision.
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,.65)",
              mb: 4,
            }}
          >
            project id:{id}
          </Typography>

          <Editor value={content} onChange={setContent} />

          <Box
            sx={{
              mt: 4,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              fullWidth
              label="Commit Name"
              value={commitName}
              onChange={(e) => setCommitName(e.target.value)}
              sx={{
                flex: 1,

                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,.6)",
                },

                "& .MuiOutlinedInput-root": {
                  color: "white",

                  "& fieldset": {
                    borderColor: "rgba(255,255,255,.1)",
                  },

                  "&:hover fieldset": {
                    borderColor: "#6366f1",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#8b5cf6",
                  },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                px: 5,
                borderRadius: 999,
                background: "linear-gradient(135deg,#8b5cf6,#6366f1)",

                "&:hover": {
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                },
              }}
            >
              Save to Project
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
