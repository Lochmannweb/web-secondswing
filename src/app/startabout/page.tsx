"use client"


import AboutHero from "@/components/about/AboutHero";
import OurCompany from "@/components/about/OurCompany";
import OurMission from "@/components/about/OurMission";
import OurTeam from "@/components/about/OurTeam";
import WhyUs from "@/components/about/WhyUs";
import Image from "next/image";
import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          backgroundSize: "cover",
        }}
      >
        {/* Background Image */}
        <Image
          src="/hero.jpg"
          alt="hero"
          fill
          style={{
            objectFit: "cover",
            filter: "brightness(0.5)",
            zIndex: 1,
          }}
        />
        </Box>


      {/* Page Content */}
      <Box
        sx={{
          display: "grid",
          position: "absolute",
          gap: "3rem",
          padding: "0rem 2rem 2rem 2rem",
          color: "white",
          zIndex: 10,
          top: "2rem",

        }}
      >
        <OurCompany />
        <OurMission />
        {/* <WhyUs /> */}
        <OurTeam />
      </Box>
    </Box>
  );
}


