

import ForsideHero from "@/components/Forside";
import { Box } from "@mui/material";

export default async function Home() {
  return (
    <>
        <div 
          // style={{
          //   height: "100vh", 
          //   backgroundImage: `url(/golfbane.jpg)`,
          //   backgroundSize: "cover",         
          //   backgroundPosition: "center", 
          //   marginTop: "0rem"
          //   // marginTop: { xs: "0rem" } 
          // }}
          >
            <img 
              style={{
                height: "100vh", 
                backgroundImage: `url(/golfbane.jpg)`,
                backgroundSize: "cover",         
                backgroundPosition: "center", 
                marginTop: "0rem"
                // marginTop: { xs: "0rem" } 
              }}
            />
            <ForsideHero   />
        </div>
    </> 
  );
}
