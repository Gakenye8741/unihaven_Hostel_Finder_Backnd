import express, { Application }  from "express";
import dotenv from 'dotenv';
import cors from 'cors';

import { logger } from "./middleware/logger";
import AuthRouter from "./Auth/Auth.route";
import HostelRouter from "./services/Hostels/Hostels.route";
import MediaRouter from "./services/HostelMedia/Media.routes";
import AmenityRouter from "./services/Amenities/Amenities.route";
import RoomRouter from "./services/Rooms/Rooms.route";
import ReviewRouter from "./services/Reviews/Reviews.route";
import UserRouter from "./services/User/Users.Route";


dotenv.config();

const PORT = process.env.PORT || 5000


const app:Application = express()

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(logger)


// Routes
app.use('/api/auth',AuthRouter);
app.use('/api/hostels', HostelRouter);
app.use('/api/media', MediaRouter);
app.use("/api/amenities", AmenityRouter);
app.use('/api/rooms', RoomRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/users", UserRouter);


// Default Message
app.get('/',(req,res)=>{
   res.send('Welcome to the Hostel Finder BackEnd Project')
})

app.listen(PORT,()=>{
    console.log(`Hostel Finder App is running on http://localhost:${PORT}`);
})