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

    window.location.href = `mailto:secondswing@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <Box className="kontakt-page">
      <Box className="kontakt-inner">
        <header className="kontakt-header">
          {/* <p className="kontakt-kicker">Kontakt</p> */}
          <h1 className="kontakt-title">Kontakt os</h1>
          <p className="kontakt-intro">
            Har du spørgsmål, forslag eller brug for hjælp? 
            <br />
            Skriv til os — vi svarer så hurtigt vi kan.
          </p>
        </header>

        <a href="mailto:secondswing@gmail.com" className="kontakt-email">secondswing@gmail.com</a>
      </Box>
    </Box>
  );
}
