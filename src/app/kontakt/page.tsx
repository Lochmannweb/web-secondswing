"use client";

import { Box, Button, TextField } from "@mui/material";
import { FormEvent, useState } from "react";
import "./kontakt.css";

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Kontakt fra ${name || "SecondSwing bruger"}`);
    const body = encodeURIComponent(
      `Navn: ${name}\nE-mail: ${email}\n\n${message}`
    );

    window.location.href = `mailto:support@secondswing.dk?subject=${subject}&body=${body}`;
  };

  return (
    <Box className="kontakt-page">
      <Box className="kontakt-inner">
        <header className="kontakt-header">
          <p className="kontakt-kicker">Kontakt</p>
          <h1 className="kontakt-title">Kontakt os</h1>
          <p className="kontakt-intro">
            Har du spørgsmål, forslag eller brug for hjælp? Skriv til os — vi svarer så hurtigt vi kan.
          </p>
        </header>

        <a href="mailto:support@secondswing.dk" className="kontakt-email">
          support@secondswing.dk
        </a>

        <form className="kontakt-form" onSubmit={handleSubmit}>
          <TextField
            label="Navn"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            className="kontakt-field"
          />
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            className="kontakt-field"
          />
          <TextField
            label="Besked"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
            className="kontakt-field"
          />
          <Button type="submit" className="kontakt-submit">
            Send besked
          </Button>
        </form>
      </Box>
    </Box>
  );
}
