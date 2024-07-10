# notes

## nodmailer app password

- `ulqd hqcv wljo hpry`

## figma UIs link (mahmoud sobhy)

- <https://www.figma.com/file/nHx2JHTZHGIioOccX7oCC2/Graduation-project?type=design&node-id=0%3A1&mode=design&t=zoIaIQAaGZjfgpCo-1>

======================================================================================================================================

## coding upgrades

1. you can use the following method to update an existing asset in cloudinary instead of doing it manually :

```js
  updatedImage = await cloudinary.uploader.upload(req.file.path, {
    // don't use the folder parameter here as it will create another path inside the existing path as the parameter 'public_id' automatically navigates to the existing path
    public_id: `${existing image public_id you want to replace (you will access it)}`, // no need for using "folder" field as this one navgate to it automatically
    overwrite: true,
    invalidate: true // this purges (delete) the existing old image (caches)
  })
```

2. you can use the following code `for better updating of the fields in an existing mongoDB database document` using mongoose :

```js
  const getData = await dataBaseModel.find({conditions})

  getData.set('fieldName','new_value')
  getData.save()
```

3. use this joi method to allow a field to be either something or another , `ex : field "name" is wanted to be either string or an array` :

```js
  export const deletePlaceSchema = {
    body: joi.object({
        name: joi.alternatives().try(
            joi.string().required,
            joi.array().items(joi.string()).required()
        )
    }).presence('required')
}
```

4. use this code to remove a single element from an array , always remember to assign the result back to the array itself :

```js
  req.authUser.createdTrips = req.authUser.createdTrips.filter(public_id => public_id.toString() !== trip_id)
```

4. use this method to filter an array instead of using a for loop manually : `note : filter takes a callback function like this : filter((element) => {logic})`
  `what ever satisfies the filter callback's logic or condition will stay in the array and what doesn't will be removed from it`

```js
  req.authUser.favouritePlaces = req.authUser.favouritePlaces.filter(placeId => placeId.toString() !== getPlace._id.toString())
```

1. it's preferred to convert to Object._ids  when comparing ids because_id is not guaranteed to be string and could be any type

========================================

## geoSpatial queries

### code

```js
    const pointSchema = new Schema({
    location: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [[[Number]]],
        required:true
    }
    })
    const city = new Schema({
        address: pointSchema
    })
```

### geoJSON

- npm command : `npm install mongoose-geojson`

- schema definition :

```js
    const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson');

const locationSchema = new mongoose.Schema({
  name: String,  // A name or description for the location
  coordinates: { type: GeoJSON.Point, coordinates: [Number] },  // Geospatial point
});

const Location = mongoose.model('Location', locationSchema);

```

- storing location data :

```js
    const newLocation = new Location({
  name: 'Central Park',
  coordinates: {
    type: 'Point',
    coordinates: [40.785091, -73.968285], // Latitude and longitude
  },
});

newLocation.save((err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Location saved:', result);
  }
});

```

- geospatial queries (including operators) :

```js
    Location.find({
  coordinates: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [40.7808, -73.9653], // Target coordinates
      },
      $maxDistance: 1000, // Maximum distance (in meters)
    },
  },
}).exec((err, locations) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Locations near the target:', locations);
  }
});

```

===========================

## to convert a string to a location (longitude , latiitude)

To validate and geocode addresses using the Google Maps API in a Node.js application, you can use the node-geocoder module. This module allows you to interact with various geocoding services, including Google Maps. Here's how you can use it in combination with your Mongoose schema:

Install the node-geocoder module:

bash
Copy code
`npm install node-geocoder`
Use the module in your code:

javascript code :

``` js
const NodeGeocoder = require('node-geocoder');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Mongoose schema
const schema = new Schema({
    // ... (other fields)
    address: {
        type: String,
        required: true
    },
});

// Define the geocoder options (replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key)
const geocoderOptions = {
    provider: 'google',
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your actual API key
};

// Create a geocoder instance with the specified options
const geocoder = NodeGeocoder(geocoderOptions);

// Define a pre-save hook to geocode the address before saving to the database
schema.pre('save', async function (next) {
    try {
        // Geocode the address and update the document with the latitude and longitude
        const geoResult = await geocoder.geocode(this.address);
        if (geoResult.length > 0) {
            this.latitude = geoResult[0].latitude;
            this.longitude = geoResult[0].longitude;
        } else {
            // Handle the case where the address couldn't be geocoded
            throw new Error('Invalid address');
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Create the Mongoose model
const MyModel = mongoose.model('MyModel', schema);

// Example usage
const instance = new MyModel({ address: '1600 Amphitheatre Parkway, Mountain View, CA' });
instance.save()
    .then((doc) => {
        console.log('Document saved successfully:', doc);
    })
    .catch((error) => {
        console.error('Error saving document:', error);
    });```
In this example, the node-geocoder module is used to geocode the provided address before saving it to the database. The latitude and longitude values are then stored in the document. Make sure to replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key. Note that the usage of the API key is subject to Google's terms of service.

Keep in mind that geocoding may have usage limitations and costs associated with it, depending on the number of requests made to the Google Maps API. Be sure to review the Google Maps API documentation for more details.

===========================

## how to clone a repo on the aws host

### if the directory on the host has no sub directory with the same repo name , command

- `git clone -b phaseOne cloning link (https)`

### if the directory on the host has a sub directory with the same repo name , commands

- `mkdir directory's_name`
- `cd new_directory`
- `mkdir configs` -> inside the new backend directory
- `cp old_directory's_.env_file_from_it's_path new_directories_.env_file_in_the_new_path`
- `git clone -b phaseOne cloning link (https)`

===========================

## how to get the users ip and location from it

```js
  npm install geoip-lite
```

```js
  const geoip = require('geoip-lite');

app.get('/get-location', (req, res) => {
  const ip = req.ip; // Get the client's IP address from the request

  // Use geoip-lite to get location information
  const location = geoip.lookup(ip);

  if (location) {
    const { ll, city, country } = location;
    const [latitude, longitude] = ll;

    res.json({
      city,
      country,
      latitude,
      longitude,
    });
  } else {
    res.json({ error: 'Location not found' });
  }
});
```

========================================

## multer error handling

```js
  app.post('/profile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
    } else if (err) {
      // An unknown error occurred when uploading.
    }

    // Everything went fine.
  })
})
```

========================================

## FAST API sample code

``` js
  //Importing necessary libraries
import uvicorn
import pickle
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd


//Initializing the fast API server
app = FastAPI()

origins = [
    "http://localhost.tiangolo.com/",
    "https://localhost.tiangolo.com/",
    "http://localhost/",
    "http://localhost:8080/",
    "http://localhost:3000/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=[""],
)
//Loading up the trained model
model = pickle.load(open('../model/prediction.pkl', 'rb'))

//Defining the model input types
class Patient(BaseModel):
    age: int
    gender: int
    bmi: float
    MBP:float
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int



//Setting up the home route
@app.get("/")
def read_root():
    return {"data": "Welcome to circulatory failure prediction model"}

//Setting up the prediction route
@app.post("/prediction/")
async def get_predict(data: Patient):
    sample = [[
        data.age * 365.25,
        data.gender,
        data.cholesterol,
        data.gluc,
        data.smoke,
        data.alco,
        data.active,
        data.bmi,
        data.MBP,
    ]]
    
    print(sample[0])
    # sample[0]=data.age 
    icu = model.predict(sample).tolist()[0]

    return {
        "data": {
            'prediction': icu,
            'interpretation': 'patient needs ICU.' if icu == 1 else 'patient does not need ICU.'
        }

    }


//Configuring the server host and port
if name == 'main':
    uvicorn.run(app, port=8080, host='0.0.0.0')
```

========================================================

## how to save a chatGBT chat

1. open the browser inspect (or browser developer console) (f12)
2. type this code in the console : `copy(document.body.innerText);`
3. now you have the whole chat copied to your clipboard
4. paste it somewhere to save it !

===========================================================

## unused codes

```js
// let uploadPath
// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     getUser.profilePicture = { secure_url, public_id }
//     getUser.customId = customId
// }

// req.imagePath = uploadPath

// let uploadPath
// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     getUser.profilePicture = { secure_url, public_id }
//     getUser.customId = customId
// }

// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     image = { secure_url, public_id }
//     userData.profilePicture = image
//     userData.customId = customId
// }

// file: joi.object({
//     fieldname: joi.string(),
//     originalname: joi.string(),
//     encoding: joi.string(),
//     mimetype: joi.string(),
//     destination: joi.string(),
//     filename: joi.string(),
//     path: joi.string(),
//     size: joi.number()
// }).unknown(true).presence('optional')

// for (const file in req.files) {
//     console.log(file)
//     console.log({ typeOfFile: typeof (file) })
//     console.log({ fileFieldName: file.fieldname })
//     if (file['profilePicture'] === 'profilePicture') {
//         const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
//             folder: profileUploadPath
//         })
//         if (!secure_url || !public_id) {
//             return next(new Error("couldn't save the profile picture!", { cause: 400 }))
//         }
//         profilePic = { secure_url, public_id }
//         userData.profilePicture = profilePic
//     }
//     else if (file['coverPicture'] === 'coverPicture') {
//         const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
//             folder: coverUploadPath
//         })
//         if (!secure_url || !public_id) {
//             return next(new Error("couldn't save the image!", { cause: 400 }))
//         }
//         coverPic = { secure_url, public_id }
//         userData.coverPicture = coverPic
//     }
//     else {
//         return next(new Error('invalid file fieldName!', { cause: 400 }))
//     }
// }

  // files: joi.array().items(joi.object({
  //     fieldname: joi.string(),
  //     originalname: joi.string(),
  //     encoding: joi.string(),
  //     mimetype: joi.string(),
  //     destination: joi.string(),
  //     filename: joi.string(),
  //     path: joi.string(),
  //     size: joi.number()
  // }).unknown(true).presence('optional')).options({ presence: 'optional' })

  // no email message , no extra token

    // const passToken = generateToken({ payload: { email: getUser.email }, signature: process.env.change_password_secret_key, expiresIn: '1h' })

    // const changePassLink = `${req.protocol}://${req.headers.host}/tourist/changeoldPass${passToken}`
    // const message = `<a href = ${changePassLink} >PLEASE USE THIS LINK TO CHANGE YOUR PASSWORD !</a>`
    // const subject = 'password changing'
    // const sendEMail = emailService({ message, to: getUser.email, subject })
    // if (!sendEMail) {
    //     return next(new Error('sending email failed!', { cause: 500 }))
    // }

        // let profilePic, coverPic
    // let profileUploadPath // for profile Picture
    // let coverUploadPath // for cover picture

    // if (req.files) {
    //     console.log({
    //         files: req.files,
    //         filesType: typeof (req.files),
    //         filesobjectKeys: Object.keys(req.files),
    //     })
    //     console.log({
    //         profilePicture: req.files['profilePicture'],
    //         coverPicture: req.files['coverPicture']
    //     })

    //     const customId = nanoid()
    //     userData.customId = customId
    //     profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
    //     coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`

    //     // TODO : fix this code and optimize it , you can either stick to nested loops , or single loops or without loops since you know that should be there
    //     for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
    //         console.log({
    //             iterationArrayName: array,
    //             typeOfIterationArray: typeof (array)
    //         })
    //         // console.log({ arrayFieldName: array.fieldname }) // this will always gete undefined since array is a string that has no properties
    //         const arrayFields = req.files[array] // this should access the first array of req.files
    //         console.log({ iterationArray: arrayFields })
    //         for (const file of arrayFields) { // each object of the array inside the object
    //             if (file.fieldname === 'profilePicture') {
    //                 console.log({ accessed: true })
    //                 const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
    //                     folder: profileUploadPath
    //                 })
    //                 if (!secure_url || !public_id) {
    //                     return next(new Error("couldn't save the profile picture!", { cause: 400 }))
    //                 }
    //                 profilePic = { secure_url, public_id }
    //                 userData.profilePicture = profilePic
    //                 console.log({
    //                     message: "profile picture is added!",
    //                     profile_pic_url: userData.profilePicture
    //                 })
    //             }
    //             else if (file.fieldname === 'coverPicture') {
    //                 console.log({ accessed: true })
    //                 const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
    //                     folder: coverUploadPath
    //                 })
    //                 if (!secure_url || !public_id) {
    //                     return next(new Error("couldn't save the image!", { cause: 400 }))
    //                 }
    //                 coverPic = { secure_url, public_id }
    //                 userData.coverPicture = coverPic
    //                 console.log({
    //                     message: "cover picture is added!",
    //                     profile_pic_url: userData.coverPicture
    //                 })
    //             }
    //             else {
    //                 console.log({
    //                     message: "invalid file fieldname",
    //                     file_field_name: file.fieldname
    //                 })
    //                 return next(new Error('invalid file fieldName!', { cause: 400 }))
    //             }
    //         }
    //     }
    // } else {
    //     profilePic = null
    //     coverPic = null
    //     profileUploadPath = null
    //     coverUploadPath = null
    // }

    // req.profileImgPath = profileUploadPath
    // req.coverImgPath = coverUploadPath

        // if (age) {
    //     userData.age = age
    //     console.log({
    //         message: "age added!"
    //     })
    // }

    // if (gender) {
    //     if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
    //         return next(new Error('invalid gender!', { cause: 400 }))
    //     }
    //     userData.gender = gender
    //     console.log({
    //         message: "gender added!"
    //     })
    // }

    // if (language) {
    //     userData.language = language
    //     console.log({
    //         message: "language added!"
    //     })
    // }

    // if (phoneNumber) {
    //     console.log({
    //         length: phoneNumber.length
    //     })
    //     if (phoneNumber.length !== 10) {
    //         console.log({
    //             api_error_message: "invalid phone number length",
    //             phone_length: phoneNumber.length
    //         })
    //         return next(new Error("enter a valid phone number!", { cause: 400 }))
    //     }
    //     if (!EGphoneCodes.includes(phoneNumber.substring(0, 2))) {
    //         console.log({
    //             api_error_message: "invalid phone number code",
    //             phone_code: phoneNumber.substring(0, 2)
    //         })
    //         return next(new Error("please enter an egyptian number!", { cause: 400 }))
    //     }
    //     userData.phoneNumber = phoneNumber
    //     console.log({
    //         message: "phone number added!"
    //     })
    // }

    // if (country) {
    //     userData.country = country
    //     console.log({
    //         message: "country added!"
    //     })
    // }

    // if (countryFlag) {
    //     userData.countryFlag = countryFlag
    //     console.log({
    //         message: "country flag added!"
    //     })
    // }

    // fs.unlink(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.syndicateFileName}`, (error) => {
        //     if (error) {
        //         console.log({
        //             message: "error regarading deleting the temp image again",
        //             error: error.message
        //         })
        //     }
        //     else {
        //         console.log({
        //             message: `the file ${req.syndicateFileName} is deleted!`
        //         })
        //     }
        // })

        // for (let i = 0; i < tripDetails.length; i++) {
    //     const data = await tripDaysModel.create(tripDetails[i])
    //     if (data.errors) {
    //         console.log({
    //             api_error_message: "error in saving the trip details!",
    //             error_info: data.errors
    //         })
    //         return next(new Error('failure in saving the trip details!', { cause: 500 }))
    //     }
    //     tripDaysData.push(data._id)
    // }

     // save the new trip days in the trip days model
        // method 1
        // for (const day of newTripDetails) {
        //     const data = await tripDaysModel.create(day)
        //     if (data.errors) {
        //         console.log({
        //             api_error_message: "error in saving the new trip details!",
        //             error_info: data.errors
        //         })
        //         return next(new Error('failure in saving the new trip details!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        //     }
        //     newDaysIds.push(data._id)
        // }

        // user: {
        //     firstName: saveUser.firstName,
        //     lastName: saveUser.lastName,
        //     token: saveUser.token,
        //     email: saveUser.email,
        //     profile_picture: {
        //         secure_url: saveUser.profilePicture?.secure_url,
        //         public_id: saveUser.profilePicture?.public_id
        //     }
        // }

        // // profile picture deleting
    // const profileDeleting = await deleteAsset(profilePublicId, profilePath)
    // if (profileDeleting.notFound == true) {
    //     console.log({
    //         message: "resource doesn't exist"
    //     })
    // } else if (profileDeleting.deleted == false) {
    //     let message
    //     console.log({
    //         api_error_message: "couldn't delete the profile picture"
    //     })
    //     const profileRestoring = await restoreAsset(profilePublicId, profilePath)
    //     if (profileRestoring == false) {
    //         console.log({
    //             api_error_message: "failed to restore the profile picture from the cloudinary server"
    //         })
    //         message = "API failed , profile picture is lost!" // means both deletion and the attempt to restoration failed!
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "profile picture is restored!" })
    //     message = "deletion failed and the profile picture is restored!"
    //     return next(new Error(message, { cause: 500 }))
    // }
    // console.log({ message: "profile picture is deleted successfully!" })

    // const coverDeleting = await deleteAsset(coverPictureId, coverPath)
    // if (coverDeleting.notFound == true) {
    //     console.log({
    //         message: "resource doesn't exist"
    //     })
    // } else if (coverDeleting.deleted == false) {
    //     let message
    //     console.log({
    //         api_error_message: "couldn't delete the cover picture"
    //     })
    //     const coverRestoring = await restoreAsset(coverPictureId, coverPath)
    //     if (coverRestoring == false) {
    //         console.log({
    //             api_error_message: "Failed to restore the cover picture from the cloudinary server"
    //         })
    //         message = "API failed , cover picture is lost!"
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "cover picture is restored successfully!" })
    //     message = "deletion failed and the cover picture is restored!"
    //     return next(new Error(message, { cause: 500 }))
    // }
    // console.log({ message: "cover picture is deleted successfully!" })

        // if (getUser.profilePicture && typeof (getUser.profilePicture?.public_id) === 'string') {
    //     //profile picture deleting
    //     const profileDeleting = await deleteAsset(profilePublicId, profilePath)
    //     if (profileDeleting.notFound == true) {
    //         console.log({
    //             message: "resource doesn't exist"
    //         })
    //     } else if (profileDeleting.deleted == false) {
    //         let message
    //         console.log({
    //             api_error_message: "couldn't delete the profile picture"
    //         })
    //         const profileRestoring = await restoreAsset(profilePublicId, profilePath)
    //         if (profileRestoring == false) {
    //             console.log({
    //                 api_error_message: "failed to restore the profile picture from the cloudinary server"
    //             })
    //             message = "API failed , profile picture is lost!" // means both deletion and the attempt to restoration failed!
    //             return next(new Error(message, { cause: 500 }))
    //         }
    //         console.log({ message: "profile picture is restored!" })
    //         message = "deletion failed and the profile picture is restored!"
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "profile picture is deleted successfully!" })
    // }

    // if (getUser.syndicateLiscence && typeof (getUser.syndicateLiscence?.public_id) === 'string') {
    //     // syndicate picture deleting
    //     const syndicateDeleting = await deleteAsset(syndicatePubliceId, syndicatepath)
    //     if (syndicateDeleting.notFound == true) {
    //         console.log({
    //             message: "resource doesn't exist"
    //         })
    //     } else if (syndicateDeleting.deleted == false) {
    //         let message
    //         console.log({
    //             api_error_message: "Couldn't delete the syndicate picture"
    //         })
    //         const syndicateRestoring = await restoreAsset(syndicatePubliceId, syndicatepath)
    //         if (syndicateRestoring == false) {
    //             console.log({
    //                 api_error_message: "Failed to restore the syndicate picture from the cloudinary server"
    //             })
    //             message = "API failed , syndicate picture is lost!"
    //             return next(new Error(message, { cause: 500 }))
    //         }
    //         console.log({ message: "syndicate picture is restored successfully!" })
    //         message = "deletion failed and the syndicate picture is restored!"
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "syndicate picture is deleted successfully!" })
    // }

    // if (getUser.ministryLiscence && typeof (getUser.ministryLiscence?.public_id) ==='string') {
    //     // ministry picture deleting
    //     const ministryDeleting = await deleteAsset(ministryPublicId, ministryPath)
    //     if (ministryDeleting.notFound == true) {
    //         console.log({
    //             message: "resource doesn't exist"
    //         })
    //     } else if (ministryDeleting.deleted == false) {
    //         let message
    //         console.log({
    //             api_error_message: "Couldn't delete the ministry picture"
    //         })
    //         const ministryRestoring = await restoreAsset(ministryPublicId, ministryPath)
    //         if (ministryRestoring == false) {
    //             console.log({
    //                 api_error_message: "Failed to restore the ministry picture from the cloudinary server"
    //             })
    //             message = "API failed , ministry picture is lost!"
    //             return next(new Error(message, { cause: 500 }))
    //         }
    //         console.log({ message: "ministry picture is restored successfully!" })
    //         message = "deletion failed and the ministry picture is restored!"
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "ministry image is deleted successfully!" })
    // }

    // if (getUser.CV && typeof (getUser.CV.public_id) === 'string') {
    //     // CV picture deleting
    //     const CVdeleting = await deleteAsset(CVpublicId, CVpath)
    //     if (CVdeleting.notFound == true) {
    //         console.log({
    //             message: "resource doesn't exist"
    //         })
    //     } else if (CVdeleting.deleted == false) {
    //         let message
    //         console.log({
    //             api_error_message: 'failed to delete the CV picture'
    //         })
    //         const CVrestoring = await restoreAsset(CVpublicId, CVpath)
    //         if (CVrestoring == false) {
    //             console.log({
    //                 api_error_message: 'Failed to restore the CV picture from the cloudinary server!'
    //             })
    //             message = "API failed , CV picture is lost!"
    //             return next(new Error(message, { cause: 500 }))
    //         }
    //         console.log({ message: "CV picture is restored successfully!" })
    //         message = "deletion failed and the CV picture is restored!"
    //         return next(new Error(message, { cause: 500 }))
    //     }
    //     console.log({ message: "CV image is deleted successfully!" })
    // }

    // old refresh token code (not working now)
                    // let user
                    // if (decodedToken.role === systemRoles.tourist) {
                    //     user = await touristModel.findOne({
                    //         token: splittedToken
                    //     })
                    //     // if the token sent is wrong along with being expired :
                    //     if (!user) {
                    //         return next(new Error('invalid token', { cause: 400 }))
                    //     }
                    // } else if (decodedToken.role === systemRoles.tourGuide) {
                    //     user = await tourGuideModel.findOne({
                    //         token: splittedToken
                    //     })
                    //     // if the token sent is wrong along with being expired :
                    //     if (!user) {
                    //         return next(new Error('invalid token', { cause: 400 }))
                    //     }
                    // }

                    
// .then((res) => {
//     console.log(`old document : ${res}`)
//     res.updateOne({
//         placeName: req.body.placeName || res.placeName,
//         latitude: req.body.latitude || res.latitude,
//         longitude: req.body.longitude || res.longitude,
//         category: req.body.category || res.category,
//         government: req.body.government || res.government,
//         activity: req.body.activity || res.activity,
//         image: req.body.image || res.image,
//         priceRange: req.body.priceRange || res.priceRange
//     })
//     console.log("message : document updated! , document : ")
//     console.log(res);
// })

// , {
//     // i want to either set the placeName value to what's inside the request body or not change it
//     placeName: req.body.placeName
// }

// if (req.body.placeName) {
//     getTrip.placeName = req.body.placeName
// }
// if (req.body.longitude) {
//     getTrip.longitude = req.body.longitude
// }
// if (req.body.latitude) {
//     getTrip.latitude = req.body.latitude
// }
// if (req.body.category) {
//     getTrip.category = req.body.category
// }
// if (req.body.government) {
//     getTrip.government = req.body.government
// }
// if (req.body.activity) {
//     getTrip.activity = req.body.activity
// }
// if (req.body.image) {
//     getTrip.image = req.body.image
// }
// if (req.body.priceRange) {
//     getTrip.priceRange = req.body.priceRange
// }

// await getTrip.save()

```

### req.file code (.single())

- controller code :

```js
  if (req.file) {
        console.log({
            request_file: req.file
        })
        // we must check that if you have a custom id but you don't have an image on the cloud
        let customId
        let flag = false
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            customId = getUser.customId
            console.log({
                message: "user has a customId"
            })
        }
        else { // else means that you don't have
            customId = nanoid()
            getUser.customId = customId
            await getUser.save()
            flag = true
            console.log({
                message: "a customId is generated"
            })
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        console.log({
            profilePath: profileUploadPath
        })
        console.log({ accessed: true })
        if (flag == false) {
            let isFileExists
            try {
                isFileExists = await cloudinary.api.resource(getUser.profilePicture?.public_id)
            } catch (error) {
                console.log({
                    message: "file isn't found!",
                    error: error
                })
            }
            if (isFileExists) { // if there is a file
                console.log({
                    existing_file_to_be_deleted: isFileExists
                })
                await cloudinary.api.delete_resources_by_prefix(profileUploadPath).catch(async (err) => {
                    console.log(err)
                })
                await cloudinary.api.delete_folder(profileUploadPath).catch(async (err) => {
                    console.log(err)
                })
                console.log({ profilePicDeleted: true })
            }
        }
        console.log({ message: "about to upload" })
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: profileUploadPath
        })
        if (!secure_url || !public_id) {
            return next(new Error("couldn't save the profile picture!", { cause: 400 }))
        }
        profilePic = { secure_url, public_id }
        getUser.profilePicture = profilePic
    }
    else {
        return next(new Error('file must exist!', { cause: 400 }))
    }
```

- schema code :

```js
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true).presence('optional').options({ presence: 'optional' }),
```
