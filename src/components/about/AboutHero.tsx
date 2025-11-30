

import React from 'react'
import { Box, Typography } from '@mui/material'

export default function ForsideHero() {
    return (
        <>
            <Box
                sx={{
                    textAlign: "center",
                    alignContent: "center",
                    // height: "20vh"
                    // paddingTop: "5rem",
                    position: "relative",
                    top: "-13rem"
                }}
            >
                <Typography sx={{ fontSize: "3rem" }}>About</Typography>
                {/* <Divider sx={{ background: "white", width: "80%", margin: "auto" }} /> */}
            </Box>
        </>
    )
};