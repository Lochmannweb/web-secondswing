

import Fordele from "@/components/Fordele";
import ForsideHero from "@/components/Forside";
import Kategorier from "@/components/Kategorier";
import { Box } from "@mui/material";

export default async function Home() {
    
  return (
    <>
        <Box 
          sx={{
            height: "100vh", 
            backgroundImage: `url(/golfbane.jpg)`,
            backgroundSize: "cover",         
            backgroundPosition: "center", 
            marginTop: { xs: "-4.5rem", sm: "-2.75rem" } 
          }}
          >
            <ForsideHero   />
            <Fordele />
            <Kategorier />
        </Box>
    </> 
  );
}
