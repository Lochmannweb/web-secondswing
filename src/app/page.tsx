import Image from "next/image";
import { Box } from "@mui/material";
import ForsideHero from "@/components/Forside";

export default function Home() {
  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Optimized hero image */}
      {/* <Image
        src="/golfbane.jpg"
        alt="Golfbane"
        fill
        priority // ensures fast LCP load
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      /> */}

      {/* Foreground content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ForsideHero />
      </Box>
    </Box>
  );
}
