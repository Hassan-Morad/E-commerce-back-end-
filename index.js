import express from "express";
import { initiateApp } from "./Src/initiate-app.js";
import {config} from 'dotenv'
config({path:'./config/dev.config.env'})

initiateApp(express)  
