import express from 'express'
import { initiateApp } from './source/utilities/initiateApp.js'
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve('./configs/.env') })

const app = express()

initiateApp(app, express)