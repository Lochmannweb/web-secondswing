// Server side

import ImageSphere from "@/app/components/Home/ImageSphere";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
      <div>
        <ImageSphere />
        {/* <Image src={"/golfbanebg.jpg"} alt="img" width={1000} height={100} style={{ width: "100%", height:"99.6vh", justifySelf: "center", filter: "brightness(0.6)"  }} />
        <Box position={"absolute"} top={"23rem"} textAlign={"center"} width={"100%"} color="white" display={"grid"} gap={"1rem"}>
          <Typography fontSize={"4rem"} >Velkommen til Second Swing</Typography>
          <Typography fontSize={"1.8rem"}>Sælg dit golf udstyr hurtigt og sikkert</Typography>
          <Typography fontSize={"1rem"}>Opret en annonce på få minutter</Typography>
        </Box> */}
      </div>  
  );
}
