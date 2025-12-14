export const dynamic = 'force-dynamic';

import { aboutData } from "@/./app/Content/about"
import { Box, Divider } from "@mui/material";

export default function Home() {
  return (
    <>
    <Box 
        sx={{
            width: { xs: "90%", sm: "50%" },
            pt: { xs: "6rem", sm: "8rem" },
            pb: { xs: "6rem" },
            display: "grid",
            gap: "2rem",
            m: "auto"
        }} >
            <Box>
                <h2 style={{ color: "white", transform: "uppercase" }}>{aboutData.Company.title}</h2>
                <Divider sx={{ backgroundColor: "white", width: "100%", mb: 1 }} />
                <Box 
                    sx={{
                        color: "gray",
                        mb: 2,
                        "& > p:not(:last-child)": { mb: 2 }
                    }}>
                    <p>{aboutData.Company.contentTop}</p>                
                    <p>{aboutData.Company.contentMidt}</p>                
                    <p>{aboutData.Company.contentBottom}</p>  
                </Box>              
            </Box>

            <Box>
                <h2 style={{ color: "white" }}>{aboutData.OurMission.title}</h2>
                <Divider sx={{ backgroundColor: "white", width: "100%", mb: 1 }} />
                <Box 
                    sx={{
                        color: "gray",
                        mb: 2,
                        "& > p:not(:last-child)": { mb: 2 }
                    }}>
                    <p>{aboutData.OurMission.contentTop}</p>                
                    <p>{aboutData.OurMission.contentMidt}</p>                
                </Box>              
            </Box>

            <Box>
                <h2 style={{ color: "white" }}>{aboutData.OurTeam.title}</h2>
                <Divider sx={{ backgroundColor: "white", width: "100%", mb: 1 }} />
                <Box 
                    sx={{
                        color: "gray",
                        mb: 2,
                        "& > p:not(:last-child)": { mb: 2 }
                    }}>
                    <p>{aboutData.OurTeam.contentTop}</p>                
                    <p>{aboutData.OurTeam.contentMidt}</p>                
                </Box>              
            </Box>

            <Box>
                <h2 style={{ color: "white" }}>{aboutData.ChooseUs.title}</h2>
                <Divider sx={{ backgroundColor: "white", width: "100%", mb: 1 }} />
                <Box 
                    sx={{
                        color: "gray",
                        display: "grid",
                        gap: "1rem"
                    }}>
                        <Box>
                            <h5 style={{ color: "white" }}>{aboutData.ChooseUs.reasonOne.title}</h5>                
                            <p>{aboutData.ChooseUs.reasonOne.content}</p>                
                        </Box>

                        <Box>
                            <h5 style={{ color: "white" }}>{aboutData.ChooseUs.reasonTwo.title}</h5>                
                            <p>{aboutData.ChooseUs.reasonTwo.content}</p>                
                        </Box>

                        <Box>
                            <h5 style={{ color: "white" }}>{aboutData.ChooseUs.reasonThree.title}</h5>                
                            <p>{aboutData.ChooseUs.reasonThree.content}</p>                
                        </Box>

                        <Box>
                            <h5 style={{ color: "white" }}>{aboutData.ChooseUs.reasonFour.title}</h5>                
                            <p>{aboutData.ChooseUs.reasonFour.content}</p>                
                        </Box>
                </Box>              
            </Box>
    </Box>
    </>
  );
}
