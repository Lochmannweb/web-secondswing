

import ForsideHero from "@/components/Forside";
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
            marginTop: { xs: "0rem" } 
          }}
          >
            <ForsideHero   />
            {/* <Fordele /> */}
            {/* <Kategorier /> */}
        </Box>
    </> 
  );
}
