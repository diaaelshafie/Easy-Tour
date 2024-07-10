import { touristModel } from '../../../../../dataBase/models/tourist.model.js'
import { AItripModel } from '../../../../../dataBase/models/AItrip.model.js'
import { StatusCodes } from 'http-status-codes'
import { getRestaurant, getHotel, getImages } from '../../../../../utilities/extract_data.js'
import axios from 'axios'

export {
    touristModel, AItripModel, StatusCodes, axios, getRestaurant, getHotel, getImages
}